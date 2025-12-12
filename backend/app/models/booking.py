# app/models/booking.py
import uuid
import enum
from sqlalchemy import String, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, TSTZRANGE
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class BookingStatus(str, enum.Enum):
    reserved = "reserved"
    in_service = "in_service"
    done = "done"
    cancelled = "cancelled"
    no_show = "no_show"


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )

    barber_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("barbers.id"),
        nullable=False,
    )

    service_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("services.id"),
        nullable=False,
    )

    slot: Mapped[object] = mapped_column(
        TSTZRANGE,
        nullable=False,
    )

    status: Mapped[BookingStatus] = mapped_column(
        String,
        nullable=False,
        default=BookingStatus.reserved,
    )

    note: Mapped[str | None] = mapped_column(String, nullable=True)

    __table_args__ = (
        CheckConstraint(
            "status IN ('reserved','in_service','done','cancelled','no_show')",
            name="booking_status_chk",
        ),
    )
