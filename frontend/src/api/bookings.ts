// src/api/bookings.ts
import api from "./client";

export type Barber = { id: string; name: string };
export type Service = {
  id: string;
  name: string;
  duration_min: number;
  price: number;
};

export type Availability = {
  date: string;
  barber_id: string;

  // optional: ถ้า backend ของคุณใช้ service_id ในการคำนวณเวลาว่าง
  service_id?: string;

  slot_minutes: number; // ✅ int ไม่มีใน TS
  open: string;
  close: string;
  break_start: string;
  break_end: string;

  // เวลาเริ่มที่ว่าง เช่น ["10:00","10:15",...]
  available_starts: string[];

  // ช่วงเวลาที่ถูกจองแล้ว (ไว้ทำ UI disabled/แสดง occupied)
  booked_ranges: { start: string; end: string }[];
};

export type BookingOut = {
  id: string;
  barber_id: string;
  service_id: string;
  customer_id: string;
  start: string;
  end: string;
  status: string;
};

export async function listBarbers() {
  // ถ้า backend ของคุณเป็น /catalog/barbers ให้แก้ path เป็น "/catalog/barbers"
  const { data } = await api.get<Barber[]>("/barbers");
  return data;
}

export async function listServices() {
  // ถ้า backend ของคุณเป็น /catalog/services ให้แก้ path เป็น "/catalog/services"
  const { data } = await api.get<Service[]>("/services");
  return data;
}

/**
 * ดึง availability ของช่างในวันที่เลือก
 * backend: GET /bookings/availability?barber_id=...&date=...(&service_id=...)
 */
export async function getAvailability(params: {
  date: string;
  barber_id: string;
  service_id?: string;
}) {
  const { data } = await api.get<Availability>("/bookings/availability", { params });
  return data;
}

/**
 * สร้างการจอง
 * backend: POST /bookings
 */
export async function createBooking(payload: {
  barber_id: string;
  service_id: string;
  start_time: string; // ✅ ให้ตรงกับหน้า CustomerBooking
  note?: string;
}) {
  const { data } = await api.post<BookingOut>("/bookings", payload);
  return data;
}

export async function listMyBookings() {
  const { data } = await api.get<BookingOut[]>("/bookings/my");
  return data;
}

export async function cancelBooking(booking_id: string) {
  const { data } = await api.post<BookingOut>(`/bookings/${booking_id}/cancel`);
  return data;
}
