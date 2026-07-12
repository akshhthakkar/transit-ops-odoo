import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request if available
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("transit_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses by clearing stored session
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("transit_token");
        localStorage.removeItem("transit_user");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);
