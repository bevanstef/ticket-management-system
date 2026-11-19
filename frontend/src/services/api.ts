// src/services/api.ts
import axios, { AxiosInstance } from "axios";

// Determine API URL dynamically in browser so phones/external devices connect to laptop's IP
const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:8000`;
  }
  return "http://localhost:8000";
};

const api: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Update baseURL dynamically in request interceptor if window is available
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    config.baseURL = getBaseURL();
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

