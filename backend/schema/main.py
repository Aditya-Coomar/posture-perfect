from pydantic import BaseModel, Field, ValidationError, EmailStr
from typing import Optional, List, Dict, Any

class TokenData(BaseModel):
    username: str = None
    
class UserRegister(BaseModel):
    email: EmailStr = Field(..., example="example@domain.com")
    username: str = Field(..., example="johndoe")
    password: str = Field(..., example="password")

class UserLogin(BaseModel):
    email: EmailStr = Field(..., example="example@domin.com")
    password: str = Field(..., example="password")
    
class UserProfile(BaseModel):
    email: EmailStr = Field(..., example="example@domain.com")
    weight: float = Field(..., example=70.0)
    height: float = Field(..., example=170.0)
    date_of_birth: str = Field(..., example="1990-01-01")
    primary_goal_for_exercising: str = Field(..., example="Lose weight")
    how_often_exercised_at_past: str = Field(..., example="Never")
    workout_intensity: str = Field(..., example="Low")
    workout_duration: str = Field(..., example="30 minutes")
    what_days_a_week_you_will_workout: str = Field(..., example="Monday, Wednesday, Friday")
    what_time_of_day_you_will_workout: str = Field(..., example="Morning")