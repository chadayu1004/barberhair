from pydantic import BaseModel, EmailStr, Field
from typing import Literal

UserRole = Literal["admin", "customer"]

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    full_name: str = Field(min_length=1, max_length=255)
    role: UserRole = "customer"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: UserRole

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
