import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { NavigationProp } from "@react-navigation/native";

// Simple event emitter for session expiry
const sessionExpiredListeners: Array<() => void> = [];
export const onSessionExpired = (callback: () => void) => {
  sessionExpiredListeners.push(callback);
};
const emitSessionExpired = () => {
  sessionExpiredListeners.forEach((callback) => callback());
};

// Navigation reference
let navigation: NavigationProp<any> | null = null;
export const setNavigation = (nav: NavigationProp<any>) => {
  navigation = nav;
};

const api = axios.create({
  baseURL: "http://192.168.100.47:5000",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
      const exp = payload.exp * 1000; // Convert to milliseconds
      if (Date.now() >= exp) {
        console.log("Token expired locally, triggering session expiry...");
        await SecureStore.deleteItemAsync("token");
        emitSessionExpired();
        throw new Error("Token expired");
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Safely handle config.method being undefined
    const method = config.method ? config.method.toUpperCase() : "UNKNOWN";
    console.log("API Request:", method, config.url, config.data);
    return config;
  },
  (error) => {
    console.error("Request error:", error.message, "Code:", error.code);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.data);
    return response;
  },
  async (error) => {
    console.error(
      "Response error:",
      error.message,
      "Code:",
      error.code,
      "Details:",
      error.response?.data
    );
    if (error.response?.status === 401) {
      console.log("Token rejected by server, triggering session expiry...");
      await SecureStore.deleteItemAsync("token");
      emitSessionExpired();
    }
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

export const register = (data: { email: string; username: string; password: string }) =>
  api.post("/auth/register", data);

export const login = (data: { email: string; password: string }) => api.post("/auth/login", data);

export const createEntry = (data: {
  title: string;
  content: string;
  category: string;
  date: string;
}) => api.post("/entries", data);

export const getEntries = () => api.get("/entries");

export const updateEntry = (id: number, data: Partial<Entry>) => api.put(`/entries/${id}`, data);

export const deleteEntry = (id: number) => api.delete(`/entries/${id}`);

export const getFrequency = () => api.get("/summary/frequency");

export const getCategories = () => api.get("/summary/categories");

export const getWordCount = () => api.get("/summary/word-count");

export const updateProfile = (data: { username: string }) => api.put("/user/profile", data);

export const getProfile = () => api.get("/user/profile");

export default api;








