from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.db.session import engine
from app.db.base import Base

from app.api.routes.auth import router as auth_router
from app.api.routes.users import router as users_router
from app.api.routes.catalog import router as catalog_router
from app.api.routes.bookings import router as bookings_router

# IMPORTANT: import models ให้ Base.metadata รู้จักตาราง
from app.models.user import User
from app.models.barber import Barber
from app.models.service import Service
from app.models.booking import Booking

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        # extensions สำหรับ uuid + exclude gist
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS btree_gist;'))
        await conn.run_sync(Base.metadata.create_all)

        # seed DEV: barbers/services ถ้ายังไม่มี
        await conn.execute(text("""
        INSERT INTO barbers (id, name, is_active)
        SELECT uuid_generate_v4(), v.name, true
        FROM (VALUES ('ช่างเอ'), ('ช่างบี'), ('ช่างซี')) AS v(name)
        WHERE NOT EXISTS (SELECT 1 FROM barbers);
        """))

        await conn.execute(text("""
        INSERT INTO services (id, name, duration_min, price, is_active)
        SELECT uuid_generate_v4(), v.name, v.dur, v.price, true
        FROM (VALUES
          ('ตัดผมชาย', 30, 150.00),
          ('สระ+ตัด+ไดร์', 45, 250.00),
          ('โกนหนวด', 15, 80.00)
        ) AS v(name,dur,price)
        WHERE NOT EXISTS (SELECT 1 FROM services);
        """))

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(catalog_router)
app.include_router(bookings_router)

@app.get("/health")
def health():
    return {"status": "ok"}
