import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import entryReducer from "./slices/entrySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    entries: entryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;