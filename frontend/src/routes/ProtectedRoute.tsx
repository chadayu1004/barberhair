// src/routes/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types/auth";

export default function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: UserRole;
}) {
  const { isAuthenticated, user, loading } = useAuth();
  const loc = useLocation();

  // ตอน bootstrapping /me
  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  if (role && user?.role !== role) {
    // ถ้า role ไม่ตรง พาไปหน้าที่เหมาะกับ role
    const target = user?.role === "admin" ? "/admin/dashboard" : "/booking";
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
}
