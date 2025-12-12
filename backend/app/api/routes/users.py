# app/api/routes/users.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(tags=["Users"])

class MeOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str

@router.get("/me", response_model=MeOut)
async def me(user: User = Depends(get_current_user)):
    return MeOut(id=str(user.id), email=user.email, full_name=user.full_name, role=user.role)
