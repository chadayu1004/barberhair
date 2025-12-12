# app/api/routes/auth.py
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext
from jose import jwt

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str  # "admin" | "customer"

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

def create_access_token(sub: str) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": sub, "iat": int(now.timestamp()), "exp": int(exp.timestamp())}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

@router.post("/register", response_model=AuthResponse)
async def register(payload: RegisterIn, db: AsyncSession = Depends(get_db)):
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    if payload.role not in ("admin", "customer"):
        raise HTTPException(status_code=400, detail="Invalid role")

    q = await db.execute(select(User).where(User.email == payload.email))
    if q.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        role=payload.role,
        password_hash=pwd.hash(payload.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(str(user.id))
    return AuthResponse(
        access_token=token,
        user=UserOut(id=str(user.id), email=user.email, full_name=user.full_name, role=user.role),
    )

@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginIn, db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(User).where(User.email == payload.email))
    user = q.scalar_one_or_none()
    if not user or not pwd.verify(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(str(user.id))
    return AuthResponse(
        access_token=token,
        user=UserOut(id=str(user.id), email=user.email, full_name=user.full_name, role=user.role),
    )
