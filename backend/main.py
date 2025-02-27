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
from schema.main import TokenData, UserRegister, UserLogin
from template.mail.main import MAIL_TEMPLATE
from config.mail.main import MAIL_SERVER
import os
from dotenv import load_dotenv
from bson import ObjectId
import random
from fastapi.middleware.cors import CORSMiddleware
import uuid


load_dotenv()
app = FastAPI()
db = Database()
mail = MAIL_SERVER()
mail_template = MAIL_TEMPLATE()

origins = ["*"]

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
        connection = db.check_connection()
        return JSONResponse(content={"message": f"Connection Established to {connection}", "status": "success"}, status_code=200)
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
        if get_user:
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
            return JSONResponse(content={"access_token": access_token, "status" : "success"}, status_code=200)
        else:
            return JSONResponse(content={"message": "Invalid credentials", "status": "error"}, status_code=400)
    except Exception as e:
        return JSONResponse(content={"message": f"{str(e)}", "status": "error"}, status_code=500)
    



