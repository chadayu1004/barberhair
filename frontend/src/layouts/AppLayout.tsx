// src/layouts/AppLayout.tsx
import React from "react";
import { Outlet, Link as RouterLink, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function AppLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: "rgba(2,6,23,0.80)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Toolbar className="gap-2">
          <Typography
            variant="h6"
            sx={{ fontWeight: 900, letterSpacing: 0.4 }}
            component={RouterLink}
            to="/"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            💈 BarberHair
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" spacing={1} alignItems="center">
            {isAuthenticated && user ? (
              <>
                <Chip
                  label={user.role === "admin" ? "Admin" : "Customer"}
                  variant="outlined"
                />
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  {user.full_name}
                </Typography>

                {user.role === "admin" ? (
                  <Button
                    component={RouterLink}
                    to="/admin/dashboard"
                    variant="outlined"
                  >
                    Dashboard
                  </Button>
                ) : (
                  <Button
                    component={RouterLink}
                    to="/booking"
                    variant="outlined"
                  >
                    Booking
                  </Button>
                )}

                <Button variant="contained" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                {!isAuthPage && (
                  <>
                    <Button component={RouterLink} to="/login" variant="outlined">
                      Login
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/register"
                      variant="contained"
                    >
                      Register
                    </Button>
                  </>
                )}
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" className="py-8">
        <Outlet />
      </Container>
    </div>
  );
}
