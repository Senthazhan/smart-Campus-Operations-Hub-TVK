import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    // Don't override Content-Type for FormData - let browser set it
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    } else {
      // Remove Content-Type for FormData so browser sets it with boundary
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor to handle auth errors
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Clear invalid token and user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally redirect to login, but since it's global, let the app handle
    }

    // For 403 and 302, just return the error
    if (status === 302 || status === 403) {
      return Promise.reject(error);
    }
    return Promise.reject(error);
  },
);
