// src/services/api.ts
import axios, { AxiosInstance } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Axios instance with automatic JWT injection and 401 handling.
 */
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token from localStorage to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("tms_token");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

// If we receive a 401, clear auth and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("tms_token");
        localStorage.removeItem("tms_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

