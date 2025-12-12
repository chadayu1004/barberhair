# app/api/routes/catalog.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.barber import Barber
from app.models.service import Service

router = APIRouter(tags=["Catalog"])

class BarberOut(BaseModel):
    id: str
    name: str

class ServiceOut(BaseModel):
    id: str
    name: str
    duration_min: int
    price: float

@router.get("/barbers", response_model=list[BarberOut])
async def list_barbers(db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(Barber).where(Barber.is_active == True).order_by(Barber.name))
    return [BarberOut(id=str(b.id), name=b.name) for b in q.scalars().all()]

@router.get("/services", response_model=list[ServiceOut])
async def list_services(db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(Service).where(Service.is_active == True).order_by(Service.name))
    out = []
    for s in q.scalars().all():
        out.append(ServiceOut(id=str(s.id), name=s.name, duration_min=s.duration_min, price=float(s.price)))
    return out
