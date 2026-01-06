// lib/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const getStorageUrl = (path) => {
  if (!path) return "/default-avatar.png";
  if (path.startsWith("data:") || path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_API_URL}/storage/${path}`;
};

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (token revoked/expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is invalid/revoked (401), force logout
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Dispatch storage event to trigger logout across tabs
      window.dispatchEvent(new Event("storage"));

      // Only redirect if not already on login/register pages
      const currentPath = window.location.pathname;
      if (
        !currentPath.startsWith("/login") &&
        !currentPath.startsWith("/register")
      ) {
        window.location.href =
          "/login?message=Your session has expired. Please login again.";
      }
    }

    return Promise.reject(error);
  }
);
