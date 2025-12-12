// src/pages/admin/AdminDashboard.tsx
import React from "react";
import { Card, CardContent, Typography, Stack, Button } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Card className="w-full max-w-2xl !rounded-2xl">
        <CardContent className="p-6">
          <Typography variant="h5" fontWeight={900}>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
            สวัสดี {user?.full_name ?? "-"} ({user?.role ?? "-"})
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 3 }}>
            <Button variant="contained" onClick={() => nav("/admin/queue")}>
              Daily Queue (ต่อใน STEP 4.2)
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                logout();
                nav("/login", { replace: true });
              }}
            >
              Logout
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
}
