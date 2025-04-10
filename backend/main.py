from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import Optional, Dict
from pydantic import BaseModel
import jwt
from jwt import PyJWTError
import bcrypt
from database.main import Database
from schema.main import TokenData, UserRegister, UserLogin, UserProfile, UserUpdateProfile, LeaderboardEntry
from template.mail.main import MAIL_TEMPLATE
from config.mail.main import MAIL_SERVER
from config.bot.main import GROQ_SERVER
from utils.main import Utils
import os
from dotenv import load_dotenv
from bson import ObjectId
import json
from fastapi.middleware.cors import CORSMiddleware



load_dotenv()
app = FastAPI()
db = Database()
mail = MAIL_SERVER()
mail_template = MAIL_TEMPLATE()
groq = GROQ_SERVER()
utility = Utils()

origins = ["http://localhost:3001", "http://localhost:3000"]

app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.get("/")
async def read_root():
    try :
        return JSONResponse(content={"message": "Welcome to the Posture Perfect", "status": "success"}, status_code=200)
    except Exception as e:
        return JSONResponse(content={"message": f"{str(e)}", "status": "error"}, status_code=500)

    
def verify_token(token: str, credentials_exception):
    try:
        payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=[os.getenv("JWT_ALGORITHM")])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username, role=role)
        return token_data
    except PyJWTError:
        raise credentials_exception
    
def get_current_user(token: str = Depends(OAuth2PasswordBearer(tokenUrl="api/auth/cms/login"))):
    credentials_exception = HTTPException(
        status_code=401, 
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
        )
    token_data = verify_token(token, credentials_exception)
    if token_data is None:
        raise credentials_exception
    return token_data

def generate_access_token(data: Dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire, "sub": data["sub"], "iss": "techverse", "iat": datetime.utcnow(), "nbf": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, os.getenv("JWT_SECRET"), algorithm=os.getenv("JWT_ALGORITHM"), headers={"typ": "JWT", "alg": os.getenv("JWT_ALGORITHM")})
    return encoded_jwt


@app.get("/api/check/connection")
async def check_connection():
    try:
        db.check_connection()
        return JSONResponse(content={"message": "successfully connected", "status": "success"}, status_code=200)
    except Exception as e:
        return JSONResponse(content={"message": f"{str(e)}", "status": "error"}, status_code=500)
    

@app.post("/api/auth/register")
async def register_user(user: UserRegister):
    try:
        if user.email is None or user.username is None or user.password is None:
            return JSONResponse(content={"message": "Please provide all required fields", "status": "error"}, status_code=400)
        hashed_password = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt())
        user_data = {
            "email": str(user.email),
            "username": str(user.username),
            "password": hashed_password.decode("utf-8"),
        }
        get_user = (db.db.table("auth-users")
                    .select("email")
                    .eq("email", user_data["email"])
                    .execute())
        if get_user.data:
            return JSONResponse(content={"message": "User already exists", "status": "error"}, status_code=400)
        try:
            response = (db.db.table("auth-users")
                        .insert({"email": user_data["email"], "username": user_data["username"], "password": user_data["password"]})
                        .execute())
            if response:
                return JSONResponse(content={"message": "User registered successfully", "status": "success"}, status_code=201)
            else:
                return JSONResponse(content={"message": "Failed to register user", "status": "error"}, status_code=500)
        except Exception as e:
            return JSONResponse(content={"message": f"{str(e)}", "status": "error"}, status_code=500)
    except Exception as e:
        return JSONResponse(content={"message": f"{str(e)}", "status": "error"}, status_code=500)
    
    

@app.post("/api/auth/login")
async def login_user(user: UserLogin):
    try:
        if user.email is None or user.password is None:
            return JSONResponse(content={"message": "Please provide all required fields", "status": "error"}, status_code=400)
        user_data = {
            "email": str(user.email),
            "password": str(user.password)
        }
        get_user = (db.db.table("auth-users")
                    .select("*")
                    .eq("email", user_data["email"])
                    .execute())
        if not get_user.data:
            return JSONResponse(content={"message": "User does not exist", "status": "error"}, status_code=400)
        
        get_user = get_user.data[0]
        if bcrypt.checkpw(user_data["password"].encode("utf-8"), get_user["password"].encode("utf-8")):
            access_token_expires = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")))
            access_token = generate_access_token(data={"sub": get_user["id"]}, expires_delta=access_token_expires)
            return JSONResponse(content={"message": "User Loginned successfully", "data": access_token, "status" : "success"}, status_code=200)
        else:
            return JSONResponse(content={"message": "Invalid credentials", "status": "error"}, status_code=400)
    except Exception as e:
        return JSONResponse(content={"message": f"{str(e)}", "status": "error"}, status_code=500)
    


@app.post("/api/auth/personalize")
async def personalize_user_profile(user: UserProfile, token: str = Depends(OAuth2PasswordBearer(tokenUrl="api/auth/login"))):
    try:
        token_data = get_current_user(token)
        get_user = (db.db.table("auth-users")
                    .select("email", "username")
                    .eq("id", token_data.username)
                    .execute())
        if not get_user.data:
            return JSONResponse(content={"message": "User does not exist", "status": "error"}, status_code=400)
        get_user_email = get_user.data[0]["email"]
        get_username = get_user.data[0]["username"]
        search_user = (db.db.table("user-profile")
                          .select("email")
                            .eq("email", get_user_email)
                            .execute())
        if search_user.data and search_user.data[0]:
            return JSONResponse(content={"message": "User profile already exists", "status": "error"}, status_code=400)
        user_data = {
            "your_gender": user.your_gender,
            "weight": user.weight,
            "height": user.height,
            "date_of_birth": user.date_of_birth,
            "primary_goal_for_exercising": user.primary_goal_for_exercising,
            "how_often_exercised_at_past": user.how_often_exercised_at_past,
            "workout_intensity": user.workout_intensity,
            "workout_duration": user.workout_duration,
            "what_days_a_week_you_will_workout": user.what_days_a_week_you_will_workout,
            "what_time_of_day_you_will_workout": user.what_time_of_day_you_will_workout,
            "email": get_user_email
        }
        points_schema = { "Pushups" : 0, "Squats" : 0, "Crunches" : 0, "Bicep Curls" : 0 }
        try:
            response = (db.db.table("user-profile")
                        .insert(user_data)
                        .execute())
            leaderboard = (db.db.table("leaderboard")
                           .insert({"email": get_user_email,
                                    "username": get_username,
                                    "total_points": points_schema, 
                                    "today_points": points_schema, 
                                    "created_on": datetime.now().strftime("%Y-%m-%d"), 
                                    "last_updated": datetime.now().strftime("%Y-%m-%d")})
                           .execute())
            if response.data and leaderboard.data and response.data[0] and leaderboard.data[0]:
                return JSONResponse(content={"message": "User profile added successfully", "status": "success"}, status_code=201)
            else:
                return JSONResponse(content={"message": "Failed to personalize user profile", "status": "error"}, status_code=500)
        except Exception as e:
            return JSONResponse(content={"message": f"{str(e)}", "status": "error"}, status_code=500)
    except Exception as e:
        return JSONResponse(content={"message": f"{str(e)}", "status": "error"}, status_code=500)
    


@app.get("/api/auth/workout/recommendation")
async def get_workout_recommendation(token: str = Depends(OAuth2PasswordBearer(tokenUrl="api/auth/login"))):
    try:
        token_data = get_current_user(token)
        get_user = (db.db.table("auth-users")
                    .select("email")
                    .eq("id", token_data.username)
                    .execute())
        if not get_user.data[0]:
            return JSONResponse(content={"message": "User does not exist", "status": "error"}, status_code=400)
        get_user_email = get_user.data[0]["email"]
        
        search_user = (db.db.table("user-profile")
                          .select("*")
                            .eq("email", get_user_email)
                            .execute())
        if not search_user.data[0]:
            return JSONResponse(content={"message": "User profile does not exist", "status": "error"}, status_code=400)
        user_data = search_user.data[0]
        dob = user_data['date_of_birth']
        user_age = utility.calculate_age(dob)
        query = f'''
        A few questions were asked to personalize your workout recommendation. Here are the details:
        1. User Gender: {user_data["your_gender"]}
        2. User Weight: {user_data["weight"]}
        3. User Height: {user_data["height"]}
        4. User Age: {user_age}
        5. Primary Goal for Exercising: {user_data["primary_goal_for_exercising"]}
        6. How often user exercised at past: {user_data["how_often_exercised_at_past"]}
        7. Workout Intensity user prefers: {user_data["workout_intensity"]}
        8. Workout Duration user prefers: {user_data["workout_duration"]}
        9. Days a week user will workout: {user_data["what_days_a_week_you_will_workout"]}
        10. Time of day user will prefer for workout: {user_data["what_time_of_day_you_will_workout"]}
        
        Based on the above details, give how many 
        1. Bicep Curls should user do in a day?
        2. Pushups should user do in a day?
        3. Squats should user do in a day?
        4. Crunches should user do in a day?
        
        Use the below format for response:
        {'{ "exercise_name": "name of the exercise", "exercise_reps": "number of reps", "exercise_sets": "number of sets", "duration": "duration of the exercise", "day": "day(s) of the week this exercise should be done"}'}
        Make sure that the total workout duration for all exercises combined is equal to the user's preferred workout duration and add suitable unit to it. 
        Give in an array format for each exercise. Only the exercises and no other details.
        '''
        response = await groq.ask(query)
        try :
            exercise_list = json.loads(response)
            add_exercise = (db.db.table("user-profile")
                            .update({"recommended_exercise_plan": exercise_list})
                            .eq("email", get_user_email)
                            .execute())
            if add_exercise.data[0]['recommended_exercise_plan']:
                return JSONResponse(content={"message": "Recommendation plan fetched successfully", "data": exercise_list, "status": "success"}, status_code=200)
            else:
                return JSONResponse(content={"message": "Failed to get workout recommendation", "status": "error"}, status_code=500)
        except Exception as e:
            return JSONResponse(content={"message": f"{str(e)}", "status": "error"}, status_code=500)
    except Exception as e:
        return JSONResponse(content={"message": f"{str(e)}", "status": "error"}, status_code=500)
    


@app.get("/api/auth/user/profile")
async def get_user_profile(token: str = Depends(OAuth2PasswordBearer(tokenUrl="api/auth/login"))):
    try:
        token_data = get_current_user(token)
        get_user = (db.db.table("auth-users")
                    .select("email", "username", "created_at")
                    .eq("id", token_data.username)
                    .execute())
        if not get_user.data:
            return JSONResponse(content={"message": "User does not exist", "status": "error"}, status_code=400)
        get_user_data = get_user.data[0]
        get_leaderboard = (db.db.table("leaderboard")
                           .select("total_points", "today_points")
                           .eq("email", get_user_data["email"])
                           .execute())
        get_user_data["total_points"] = get_leaderboard.data and get_leaderboard.data[0]["total_points"]
        get_user_data["today_points"] = get_leaderboard.data and get_leaderboard.data[0]["today_points"]        
        return JSONResponse(content={"message": "User profile fetched successfully", "data": get_user_data, "status": "success"}, status_code=200)
    except Exception as e:
        return JSONResponse(content={"message": f"{str(e)}", "status": "error"}, status_code=500)
    


@app.get("/api/auth/user/workout/profile")
async def get_user_profile(token: str = Depends(OAuth2PasswordBearer(tokenUrl="api/auth/login"))):
    try:
        token_data = get_current_user(token)
        get_user = (db.db.table("auth-users")
                    .select("email")
                    .eq("id", token_data.username)
                    .execute())
        if not get_user.data:
            return JSONResponse(content={"message": "User does not exist", "status": "error"}, status_code=400)
        get_user_email = get_user.data[0]["email"]
        profile_response = (db.db.table("user-profile")
                            .select("*")
                            .eq("email", get_user_email)
                            .execute())
        if not profile_response.data:
            return JSONResponse(content={"message": "User profile does not exist", "status": "error"}, status_code=400)
        user_profile = profile_response.data[0]
        return JSONResponse(content={"message": "User profile fetched successfully", "data": user_profile, "status": "success"}, status_code=200)
    except Exception as e:
        return JSONResponse(content={"message": f"{str(e)}", "status": "error"}, status_code=500)



@app.patch("/api/auth/profile/update")
async def update_user_profile(user: UserUpdateProfile, token: str = Depends(OAuth2PasswordBearer(tokenUrl="api/auth/login"))):
    try:
        token_data = get_current_user(token)
        get_user = (db.db.table("auth-users")
                    .select("email")
                    .eq("id", token_data.username)
                    .execute())
        if not get_user.data:
            return JSONResponse(content={"message": "User does not exist", "status": "error"}, status_code=400)
        get_user_email = get_user.data[0]["email"]
        profile_response = (db.db.table("user-profile")
                            .select("*")
                            .eq("email", get_user_email)
                            .execute())
        if not profile_response.data:
            return JSONResponse(content={"message": "User profile does not exist", "status": "error"}, status_code=400)
        user_data = user.model_dump()
        updated_data = { k: v for k, v in user_data.items() if v is not None }
        update_profile = (db.db.table("user-profile")
                        .update(updated_data)
                        .eq("email", get_user_email)
                        .execute())
        if update_profile.data:
            return JSONResponse(content={"message": "User profile updated successfully", "data" : update_profile.data[0], "status": "success"}, status_code=200)
        else:
            return JSONResponse(content={"message": "Failed to update user profile", "status": "error"}, status_code=500)
        
    except Exception as e:
        return JSONResponse(content={"message": f"{str(e)}", "status": "error"}, status_code=500)



@app.get("/api/auth/leaderboard")
async def get_leaderboard(token: str = Depends(OAuth2PasswordBearer(tokenUrl="api/auth/login"))):
    try:
        overall_leaderboard = (db.db.table("leaderboard")
                               .select("username", "total_points")
                               .order("total_points")
                               .execute())
        today = datetime.now().strftime("%Y-%m-%d")
        today_leaderboard = (db.db.table("leaderboard")
                             .select("username", "today_points")
                             .eq("last_updated", today)
                             .order("today_points")
                             .execute())
        if overall_leaderboard.data or today_leaderboard.data:
            return JSONResponse(content={"message": "Leaderboard fetched successfully", "data" : {"overall_leaderboard" : overall_leaderboard.data, "today_leaderboard" : today_leaderboard.data } , "status": "success"}, status_code=200)
        else:
            return JSONResponse(content={"message": "Failed to fetch leaderboard", "status": "error"}, status_code=500)
    except Exception as e:
        return JSONResponse(content={"message": f"{str(e)}", "status": "error"}, status_code=500)


@app.patch("/api/auth/leaderboard/update")
async def update_leaderboard_entry(leaderboard: LeaderboardEntry, token: str = Depends(OAuth2PasswordBearer(tokenUrl="api/auth/login"))):
    try:
        token_data = get_current_user(token)
        get_user = (db.db.table("auth-users")
                    .select("email", "username")
                    .eq("id", token_data.username)
                    .execute())
        if not get_user.data[0]:
            return JSONResponse(content={"message": "User does not exist", "status": "error"}, status_code=400)
        get_user_email = get_user.data[0]["email"]
        get_current_leaderboard = (db.db.table("leaderboard")
                                   .select("*")
                                   .eq("email", get_user.data[0]["email"])
                                    .execute())
        if not get_current_leaderboard.data and not get_current_leaderboard.data[0]:
            return JSONResponse(content={"message": "Leaderboard entry does not exist", "status": "error"}, status_code=400)
        
        today = datetime.now().strftime("%Y-%m-%d")
        if get_current_leaderboard.data[0]["last_updated"] == today:
            if leaderboard.exercise in get_current_leaderboard.data[0]["today_points"]:
                get_current_leaderboard.data[0]["today_points"][leaderboard.exercise] += leaderboard.score
                get_current_leaderboard.data[0]["total_points"][leaderboard.exercise] += leaderboard.score
                update_leaderboard = (db.db.table("leaderboard")
                                      .update({"today_points": get_current_leaderboard.data[0]["today_points"], "total_points": get_current_leaderboard.data[0]["total_points"]})
                                      .eq("email", get_user_email)
                                      .execute())
        else:
            if leaderboard.exercise in get_current_leaderboard.data[0]["today_points"]:
                get_current_leaderboard.data[0]["today_points"][leaderboard.exercise] = leaderboard.score
                get_current_leaderboard.data[0]["total_points"][leaderboard.exercise] += leaderboard.score
                update_leaderboard = (db.db.table("leaderboard")
                                      .update({"today_points": get_current_leaderboard.data[0]["today_points"], "total_points": get_current_leaderboard.data[0]["total_points"], "last_updated": today})
                                      .eq("email", get_user_email)
                                      .execute())

        if update_leaderboard.data and update_leaderboard.data[0]:
            return JSONResponse(content={"message": "Leaderboard updated successfully", "data" : update_leaderboard.data[0], "status": "success"}, status_code=200)
        else:
            return JSONResponse(content={"message": "Failed to update leaderboard", "status": "error"}, status_code=500)
    except Exception as e:
        return JSONResponse(content={"message": f"{str(e)}", "status": "error"}, status_code=500)
