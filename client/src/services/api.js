import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
};

// Receipts API
export const receiptsAPI = {
  upload: (formData) =>
    api.post("/receipts/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getAll: () => api.get("/receipts"),
  getById: (id) => api.get(`/receipts/${id}`),
  delete: (id) => api.delete(`/receipts/${id}`),
};

// Transactions API
export const transactionsAPI = {
  create: (data) => api.post("/transactions", data),
  getAll: (params) => api.get("/transactions", { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getStats: (params) => api.get("/transactions/stats", { params }),
};

// Budgets API
export const budgetsAPI = {
  create: (data) => api.post("/budgets", data),
  getAll: (params) => api.get("/budgets", { params }),
  getById: (id) => api.get(`/budgets/${id}`),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
  getStatus: (params) => api.get("/budgets/status", { params }),
};

export default api;
