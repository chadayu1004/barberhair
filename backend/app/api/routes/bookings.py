from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.service import Service
from app.models.booking import Booking, BookingStatus
from app.schemas.booking import AvailabilityResponse, CreateBookingRequest, BookingOut
from app.utils.time_rules import RULES, TZ, clamp_booking_date, gen_candidate_starts

router = APIRouter(prefix="/bookings", tags=["bookings"])

def parse_iso(dt_str: str) -> datetime:
    # รับทั้งแบบมี timezone และไม่มี timezone (ถ้าไม่มีจะถือว่า Asia/Bangkok)
    try:
        dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    except Exception:
        raise ValueError("Invalid datetime format")
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=TZ)
    return dt

@router.get("/my", response_model=list[BookingOut])
async def my_bookings(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    คืนรายการ booking ของ user (ยกเว้น cancelled)
    จำกัดช่วงวันนี้-พรุ่งนี้เพื่อ UI ใช้งานง่าย
    """
    now = datetime.now(TZ)
    day_start = datetime(now.year, now.month, now.day, 0, 0, tzinfo=TZ)
    day_end = day_start + timedelta(days=2)

    q = await db.execute(
        select(
            Booking.id,
            Booking.customer_id,
            Booking.barber_id,
            Booking.service_id,
            Booking.status,
            Booking.slot.lower().label("start"),
            Booking.slot.upper().label("end"),
        ).where(
            Booking.customer_id == user.id,
            Booking.status != BookingStatus.cancelled,
            Booking.slot.op("&&")(f"[{day_start.isoformat()},{day_end.isoformat()})"),
        ).order_by(text("lower(slot) ASC"))
    )

    rows = q.all()
    return [
        BookingOut(
            id=str(r.id),
            barber_id=str(r.barber_id),
            service_id=str(r.service_id),
            customer_id=str(r.customer_id),
            start=r.start.isoformat(),
            end=r.end.isoformat(),
            status=r.status.value,
        )
        for r in rows
    ]


@router.post("/{booking_id}/cancel", response_model=BookingOut)
async def cancel_booking(
    booking_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    ยกเลิกได้เมื่อเวลาปัจจุบัน < start - CANCEL_BEFORE_HOURS
    และต้องเป็น booking ของ user เอง
    """
    from app.core.config import settings

    q = await db.execute(
        select(
            Booking.id,
            Booking.customer_id,
            Booking.barber_id,
            Booking.service_id,
            Booking.status,
            Booking.slot.lower().label("start"),
            Booking.slot.upper().label("end"),
        ).where(Booking.id == booking_id)
    )
    r = q.one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Booking not found")

    if str(r.customer_id) != str(user.id):
        raise HTTPException(status_code=403, detail="Not your booking")

    if r.status == BookingStatus.cancelled:
        raise HTTPException(status_code=400, detail="Already cancelled")

    now = datetime.now(TZ)
    cancel_deadline = r.start - timedelta(hours=settings.CANCEL_BEFORE_HOURS)
    if now >= cancel_deadline:
        raise HTTPException(
            status_code=400,
            detail=f"Cancel must be at least {settings.CANCEL_BEFORE_HOURS} hours before start",
        )

    # update status
    q2 = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = q2.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = BookingStatus.cancelled
    await db.commit()

    return BookingOut(
        id=str(r.id),
        barber_id=str(r.barber_id),
        service_id=str(r.service_id),
        customer_id=str(r.customer_id),
        start=r.start.isoformat(),
        end=r.end.isoformat(),
        status="cancelled",
    )