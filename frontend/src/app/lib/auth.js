import { api } from "./api";

export const login = async ({ email, password }) => {
  const res = await api.post("/auth/login", { email, password });

  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.user));

  return res.data;
};

export const logout = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return;
  };
  await api.post("/auth/logout");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const register = async (form) => {
  const res = await api.post("/auth/register", form);
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.user));
  return res.data;
};

export const googleLogin = async (token) => {
  const res = await api.post("/auth/google", { token });
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.user));
  return res.data;
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token");

  const res = await api.get("/auth/profile");
  return res.data.user; 
};

