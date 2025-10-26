// lib/auth.js
import { api } from "./api";

// Login (simpan cookie automatically)
export const login = async ({ email, password }) => {
  const res = await api({ withCredentials: true }).post("/auth/login", { email, password });
  return res.data;
};

// Logout (delete cookie from server)
export const logout = async () => {
  const res = await api({ withCredentials: true }).post("/auth/logout");
  return res.data;
};

// Register
export const register = async (form) => {
  const res = await api({ withCredentials: true }).post("/auth/register", form);
  return res.data;
};

// Google login
export const googleLogin = async (token) => {
  const res = await api({ withCredentials: true }).post("/auth/google", { token });
  return res.data;
};

