from pydantic import BaseModel, Field
from typing import Literal, Optional

BookingStatus = Literal["reserved", "cancelled", "in_service", "done", "no_show"]

class BarberOut(BaseModel):
    id: str
    name: str

class ServiceOut(BaseModel):
    id: str
    name: str
    duration_min: int
    price: float

class AvailabilityResponse(BaseModel):
    date: str
    barber_id: str
    service_id: str
    slot_minutes: int
    open: str
    close: str
    break_start: str
    break_end: str
    available_starts: list[str]  # ISO datetime strings
    booked_ranges: list[dict]    # [{"start": "...", "end":"..."}]

class CreateBookingRequest(BaseModel):
    barber_id: str
    service_id: str
    start: str  # ISO datetime (มี timezone ได้ หรือไม่มี)
    note: Optional[str] = Field(default=None, max_length=500)

class BookingOut(BaseModel):
    id: str
    barber_id: str
    service_id: str
    customer_id: str
    start: str
    end: str
    status: BookingStatus
