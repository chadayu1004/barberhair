// src/pages/Register.tsx
import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  MenuItem,
  Divider,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import type { UserRole } from "../types/auth";
import { registerApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setBusy(true);

    try {
      const res = await registerApi({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        role,
      });

      // login อัตโนมัติ
      login({ token: res.access_token, user: res.user });

      setOk("สมัครสมาชิกสำเร็จ ✅ กำลังพาไปหน้าถัดไป...");

      // redirect ตาม role
      nav(res.user.role === "admin" ? "/admin/dashboard" : "/booking", {
        replace: true,
      });
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? "Register failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Card className="w-full max-w-md !rounded-2xl">
        <CardContent className="p-6">
          <Typography variant="h5" fontWeight={900}>
            Register
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
            สมัครสมาชิกเพื่อจองคิว (Customer) หรือผู้ดูแลร้าน (Admin)
          </Typography>

          <Divider sx={{ my: 2 }} />

          {(err || ok) && (
            <Stack spacing={1} sx={{ mb: 2 }}>
              {err && <Alert severity="error">{err}</Alert>}
              {ok && <Alert severity="success">{ok}</Alert>}
            </Stack>
          )}

          <form onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                fullWidth
                required
              />

              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                autoComplete="email"
              />

              <TextField
                select
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                fullWidth
                helperText="แนะนำ: ผู้ใช้ทั่วไปเลือก Customer"
              >
                <MenuItem value="customer">Customer (ลูกค้า)</MenuItem>
                <MenuItem value="admin">Admin (ผู้ดูแลร้าน)</MenuItem>
              </TextField>

              <TextField
                label="Password (อย่างน้อย 6 ตัว)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                autoComplete="new-password"
              />

              <Button type="submit" variant="contained" fullWidth disabled={busy}>
                {busy ? "Creating..." : "Create account"}
              </Button>

              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                fullWidth
                disabled={busy}
              >
                Back to Login
              </Button>
            </Stack>
          </form>

          <Typography variant="caption" sx={{ opacity: 0.7, mt: 2, display: "block" }}>
            ถ้าต้องการล็อกไม่ให้สมัคร Admin เอง บอกผมได้ เดี๋ยวผมปรับให้สมัครได้เฉพาะ Customer
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}
