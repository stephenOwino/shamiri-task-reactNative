import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = "http://192.168.100.47:5000"; // Update if needed

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log("Request:", config.method?.toUpperCase(), config.url);
      return config;
    } catch (error) {
      console.error("Request Interceptor Error:", error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error("Request Error:", error.message);
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    console.log("Response:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error("Response Error:", error.message, error.response?.data);
    return Promise.reject(error);
  }
);

export type Entry = {
  id: number;
  title: string;
  content: string;
  category: string;
  date: string;
  createdAt: string;
  updatedAt: string | null;
};

const register = async (userData: { email: string; username: string; password: string }) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};

const login = async (userData: { email: string; password: string }) => {
  try {
    const response = await api.post("/auth/login", userData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

const createEntry = async (entryData: { title: string; content: string; category: string; date: string }) => {
  try {
    const response = await api.post("/entries", entryData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create entry");
  }
};

const getEntries = async () => {
  try {
    const response = await api.get("/entries");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch entries");
  }
};

const updateEntry = async (id: number, entryData: Partial<Entry>) => {
  try {
    const response = await api.put(`/entries/${id}`, entryData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update entry");
  }
};

const deleteEntry = async (id: number) => {
  try {
    await api.delete(`/entries/${id}`);
    return true;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete entry");
  }
};

const logout = async () => {
  await SecureStore.deleteItemAsync("token");
};

const apiService = { register, login, createEntry, getEntries, updateEntry, deleteEntry, logout };
export default apiService;