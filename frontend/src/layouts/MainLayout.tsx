// src/layouts/MainLayout.tsx
import React from "react";
import { Outlet, Link as RouterLink, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box, Container } from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const nav = useNavigate();

  return (
    <Box className="min-h-screen bg-slate-950 text-white">
      <AppBar position="sticky" color="transparent" elevation={0}>
        <Toolbar className="border-b border-slate-800">
          <Typography
            component={RouterLink}
            to="/"
            variant="h6"
            sx={{ textDecoration: "none", color: "inherit", fontWeight: 900 }}
          >
            💈 BarberHair
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {!isAuthenticated ? (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button component={RouterLink} to="/login" variant="outlined">
                Login
              </Button>
              <Button component={RouterLink} to="/register" variant="contained">
                Register
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {user?.full_name} ({user?.role})
              </Typography>

              {user?.role === "admin" ? (
                <Button component={RouterLink} to="/admin/dashboard" variant="outlined">
                  Admin
                </Button>
              ) : (
                <Button component={RouterLink} to="/booking" variant="outlined">
                  Booking
                </Button>
              )}

              <Button
                variant="contained"
                onClick={() => {
                  logout();
                  nav("/login", { replace: true });
                }}
              >
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
