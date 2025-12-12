// src/api/auth.ts
import api from "./client";
import type { AuthUser, UserRole } from "../types/auth";

export type AuthResponse = {
  access_token: string;
  token_type: "bearer";
  user: AuthUser;
};

export async function loginApi(payload: { email: string; password: string }) {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function registerApi(payload: {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}) {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
}

export async function meApi() {
  const { data } = await api.get<AuthUser>("/me");
  return data;
}
