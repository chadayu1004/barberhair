// src/api/client.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// แนบ token ทุก request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("barberhair_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ถ้า 401 → เคลียร์ session แล้วเด้งไป /login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("barberhair_token");
      localStorage.removeItem("barberhair_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
