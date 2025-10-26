// lib/api.js
import axios from "axios";

export const api = (options = {}) => {
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: options.withCredentials ?? false, // cookies only if needed
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};
