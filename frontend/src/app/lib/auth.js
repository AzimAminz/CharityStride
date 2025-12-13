import { api } from "./api";

export const login = async ({ email, password }) => {
  const res = await api.post("/auth/login", { email, password });

  // Store token and user
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.user));

  return res.data;
};

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    // Ignore errors, just clear local data
    console.log("Logout API failed, clearing local data anyway");
  }

  // Always clear local data
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const register = async (form) => {
  const res = await api.post("/auth/register", form);

  // Store token and user
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.user));

  return res.data;
};

export const googleLogin = async (token) => {
  const res = await api.post("/auth/google", { token });

  // Store token and user
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.user));

  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get("/auth/profile");
  return res.data.user;
};

/**
 * Complete user profile
 * @param {Object} data - Profile data { phone, birthdate }
 * @returns {Promise<Object>} Response data
 */
export const completeProfile = async ({ phone, birthdate }) => {
  const res = await api.post("/auth/complete-profile", { phone, birthdate });

  // Update localStorage with completed user data
  localStorage.setItem("user", JSON.stringify(res.data.user));

  return res.data;
};
