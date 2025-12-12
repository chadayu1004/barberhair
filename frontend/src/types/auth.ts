// src/types/auth.ts
export type UserRole = "admin" | "customer";

export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
};
