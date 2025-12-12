// src/routes/AppRouter.tsx
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import AppLayout from "../layouts/AppLayout";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import CustomerBooking from "../pages/CustomerBooking";
import AdminDashboard from "../pages/AdminDashboard";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Home /> },

      // public
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },

      // customer only
      {
        element: <ProtectedRoute allow={["customer"]} />,
        children: [{ path: "/booking", element: <CustomerBooking /> }],
      },

      // admin only
      {
        element: <ProtectedRoute allow={["admin"]} />,
        children: [{ path: "/admin/dashboard", element: <AdminDashboard /> }],
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
