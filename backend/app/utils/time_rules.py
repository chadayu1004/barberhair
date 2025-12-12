from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime, date, time, timedelta
from zoneinfo import ZoneInfo
from app.core.config import settings

TZ = ZoneInfo("Asia/Bangkok")

@dataclass
class ShopRules:
    open_t: time
    close_t: time
    break_start: time
    break_end: time
    slot_minutes: int
    book_ahead_days: int

def parse_hhmm(s: str) -> time:
    h, m = s.split(":")
    return time(int(h), int(m))

RULES = ShopRules(
    open_t=parse_hhmm(settings.SHOP_OPEN),
    close_t=parse_hhmm(settings.SHOP_CLOSE),
    break_start=parse_hhmm(settings.BREAK_START),
    break_end=parse_hhmm(settings.BREAK_END),
    slot_minutes=settings.SLOT_MINUTES,
    book_ahead_days=settings.BOOK_AHEAD_DAYS,
)

def local_dt(d: date, t: time) -> datetime:
    return datetime(d.year, d.month, d.day, t.hour, t.minute, tzinfo=TZ)

def clamp_booking_date(d: date) -> None:
    today = datetime.now(TZ).date()
    max_day = today + timedelta(days=RULES.book_ahead_days)
    if d < today or d > max_day:
        raise ValueError(f"Booking date must be between {today} and {max_day}")

def gen_candidate_starts(d: date, duration_min: int) -> list[datetime]:
    """
    สร้าง start candidates ทุก 15 นาที ภายในช่วงเปิด-ปิด ตัดช่วงพักออก
    และให้ end ไม่เกินเวลาปิด
    """
    open_dt = local_dt(d, RULES.open_t)
    close_dt = local_dt(d, RULES.close_t)
    bs = local_dt(d, RULES.break_start)
    be = local_dt(d, RULES.break_end)

    step = timedelta(minutes=RULES.slot_minutes)
    dur = timedelta(minutes=duration_min)

    cur = open_dt
    out: list[datetime] = []
    while cur + dur <= close_dt:
        # ถ้าทับช่วงพัก (start < break_end && end > break_start) -> ข้าม
        if not (cur < be and (cur + dur) > bs):
            out.append(cur)
        cur += step
    return out
