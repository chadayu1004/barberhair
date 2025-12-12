import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Card,
  CardContent,
  Typography,
  MenuItem,
  TextField,
  Stack,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { getBarbers, getServices } from "../api/catalog";
import { getAvailability, createBooking } from "../api/bookings";

interface Barber {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  duration_min: number;
  price: number;
}

export default function CustomerBooking() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [barberId, setBarberId] = useState("");
  const [serviceId, setServiceId] = useState("");

  // วันที่จอง: default วันนี้ (แต่ backend ของคุณอนุญาตจองล่วงหน้าได้ 1 วัน)
  const today = useMemo(() => dayjs().format("YYYY-MM-DD"), []);
  const maxDay = useMemo(() => dayjs().add(1, "day").format("YYYY-MM-DD"), []);
  const [date, setDate] = useState<string>(today);

  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) ?? null,
    [services, serviceId]
  );

  // โหลดรายชื่อช่าง/บริการ
  useEffect(() => {
    (async () => {
      try {
        setLoadingCatalog(true);
        const [b, s] = await Promise.all([getBarbers(), getServices()]);
        setBarbers(b);
        setServices(s);
      } catch (e: any) {
        setError(e?.message ?? "โหลดข้อมูลช่าง/บริการไม่สำเร็จ");
      } finally {
        setLoadingCatalog(false);
      }
    })();
  }, []);

  // โหลดเวลาว่างเมื่อเลือกครบ
  useEffect(() => {
    if (!barberId || !serviceId || !date) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }

    (async () => {
      try {
        setError(null);
        setSuccess(null);
        setLoadingSlots(true);
        setSelectedSlot(null);
        const data = await getAvailability(barberId, date);
        setSlots(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message ?? "โหลดเวลาว่างไม่สำเร็จ");
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, [barberId, serviceId, date]);

  const canSubmit = Boolean(barberId && serviceId && date && selectedSlot);

  const onSubmit = async () => {
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      // ส่งให้ backend สร้าง booking
      // start_time = "YYYY-MM-DD HH:mm"
      const start_time = `${date} ${selectedSlot}`;

      await createBooking({
        barber_id: barberId,
        service_id: serviceId,
        start_time,
      });

      setSuccess(`จองสำเร็จ ✅ (${start_time})`);

      // รีเฟรช slot หลังจอง เพื่อไม่ให้จองซ้ำ
      const data = await getAvailability(barberId, date);
      setSlots(Array.isArray(data) ? data : []);
      setSelectedSlot(null);
    } catch (e: any) {
      // ถ้า DB กันซ้อน → backend มักตอบ 409 หรือ 400
      const msg =
        e?.response?.data?.detail ??
        e?.message ??
        "จองไม่สำเร็จ (อาจมีคนจองไปก่อน)";
      setError(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-xl !rounded-2xl">
        <CardContent className="p-6">
          <Typography variant="h5">Booking</Typography>
          <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
            เลือกช่าง บริการ และเวลาว่าง
          </Typography>

          {loadingCatalog && (
            <div className="flex items-center gap-2 text-slate-300">
              <CircularProgress size={18} />
              <span className="text-sm">กำลังโหลดข้อมูลช่าง/บริการ…</span>
            </div>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />

          <Stack spacing={2}>
            <TextField
              select
              label="ช่าง"
              value={barberId}
              onChange={(e) => setBarberId(e.target.value)}
              fullWidth
              disabled={loadingCatalog}
            >
              {barbers.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="บริการ"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              fullWidth
              disabled={loadingCatalog}
            >
              {services.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name} ({s.duration_min} นาที / {s.price}฿)
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="date"
              label="วันที่"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: today,
                max: maxDay, // จองล่วงหน้าได้ 1 วัน
              }}
              disabled={!barberId || !serviceId}
              helperText="จองล่วงหน้าได้ 1 วัน"
            />

            {/* สรุปบริการที่เลือก */}
            {selectedService && (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
                <p className="text-sm text-slate-300">
                  บริการที่เลือก:{" "}
                  <span className="text-white">{selectedService.name}</span>{" "}
                  • {selectedService.duration_min} นาที • {selectedService.price}
                  ฿
                </p>
              </div>
            )}

            {/* Slots */}
            <div>
              <div className="flex items-center justify-between">
                <Typography variant="subtitle1">เวลาว่าง</Typography>
                {loadingSlots && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <CircularProgress size={16} />
                    <span className="text-xs">กำลังโหลด…</span>
                  </div>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {!barberId || !serviceId ? (
                  <Typography variant="body2" sx={{ opacity: 0.6 }}>
                    กรุณาเลือกช่างและบริการก่อน
                  </Typography>
                ) : slots.length === 0 && !loadingSlots ? (
                  <Typography variant="body2" sx={{ opacity: 0.6 }}>
                    ไม่มีเวลาว่างในวันที่เลือก
                  </Typography>
                ) : (
                  slots.map((t) => (
                    <Chip
                      key={t}
                      label={t}
                      clickable
                      color={selectedSlot === t ? "primary" : "default"}
                      onClick={() => setSelectedSlot(t)}
                    />
                  ))
                )}
              </div>

              <Typography variant="caption" sx={{ opacity: 0.6, display: "block", mt: 1 }}>
                * ระบบจะตัดช่วงพัก และกันจองซ้อนด้วยข้อจำกัดในฐานข้อมูล
              </Typography>
            </div>

            <Button
              variant="contained"
              fullWidth
              disabled={!canSubmit || submitting}
              onClick={onSubmit}
            >
              {submitting ? "กำลังจอง…" : "ยืนยันการจอง"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
}
