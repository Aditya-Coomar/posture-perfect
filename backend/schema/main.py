from pydantic import BaseModel, Field, ValidationError, EmailStr
from typing import Optional, List, Dict, Any

class TokenData(BaseModel):
    username: str = None
    
class UserAuth(BaseModel):
    email: EmailStr = Field(..., example="example@domain.com")
    username: str = Field(..., example="johndoe")
    password: str = Field(..., example="password")
