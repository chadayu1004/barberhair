// src/pages/Login.tsx
import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types/auth";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as any;

  const [email, setEmail] = useState("admin@barberhair.com");
  const [role, setRole] = useState<UserRole>("admin");
  const [name, setName] = useState("Chadayu");
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    login({
      token: "mock_access_token",
      user: {
        id: crypto.randomUUID(),
        email,
        full_name: name,
        role,
      },
    });

    const from = loc?.state?.from as string | undefined;
    if (from) return nav(from, { replace: true });

    nav(role === "admin" ? "/admin/dashboard" : "/booking", { replace: true });
  };

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full max-w-md !rounded-2xl">
        <CardContent className="p-6">
          <Typography variant="h5">Login</Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
            (ชั่วคราว) เลือก role เพื่อทดสอบ Protected Route
          </Typography>

          {err && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {err}
            </Alert>
          )}

          <form onSubmit={onSubmit}>
            <Stack spacing={2} sx={{ mt: 3 }}>
              <TextField
                label="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
              />
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
              <TextField
                label="Role (admin/customer)"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                helperText="พิมพ์ admin หรือ customer"
                fullWidth
              />

              <Button type="submit" variant="contained" fullWidth>
                Sign in
              </Button>

              <Button component={RouterLink} to="/register" variant="outlined" fullWidth>
                Create account
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
