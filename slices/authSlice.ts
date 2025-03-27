import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../services/apiService";
import * as SecureStore from "expo-secure-store";

export interface User {
  id: number;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isError: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  message: string;
  sessionExpired: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isError: false,
  isLoading: false,
  isSuccess: false,
  message: "",
  sessionExpired: false,
};

// Register
export const register = createAsyncThunk("auth/register", async (userData: { email: string; username: string; password: string }, thunkAPI) => {
  try {
    const response = await apiService.register(userData);
    await SecureStore.setItemAsync("token", response.token);
    return { token: response.token, user: { id: response.id, email: userData.email, username: userData.username } };
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// Login
export const login = createAsyncThunk("auth/login", async (userData: { email: string; password: string }, thunkAPI) => {
  try {
    const response = await apiService.login(userData);
    await SecureStore.setItemAsync("token", response.token);
    return { token: response.token, user: { id: response.id, email: userData.email, username: "User" } }; // Username TBD
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// Logout
export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    await apiService.logout();
    return true;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// Check Token Expiry
export const checkTokenExpiry = createAsyncThunk("auth/checkTokenExpiry", async (_, thunkAPI) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000;
    if (Date.now() >= exp) {
      await SecureStore.deleteItemAsync("token");
      return thunkAPI.rejectWithValue("Token expired");
    }
  }
  return token;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isLoading = false;
      state.isSuccess = false;
      state.message = "";
      state.sessionExpired = false;
    },
    setSessionExpired: (state) => {
      state.sessionExpired = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.token = null;
        state.user = null;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.token = null;
        state.user = null;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      })
      // Token Expiry
      .addCase(checkTokenExpiry.rejected, (state, action) => {
        state.sessionExpired = true;
        state.token = null;
        state.user = null;
        state.message = action.payload as string;
      });
  },
});

export const { reset, setSessionExpired } = authSlice.actions;
export default authSlice.reducer;