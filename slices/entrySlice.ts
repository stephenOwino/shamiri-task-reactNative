import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../services/apiService";
import { Entry } from "../services/apiService";

interface EntryState {
  entries: Entry[];
  isError: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  message: string;
}

const initialState: EntryState = {
  entries: [],
  isError: false,
  isLoading: false,
  isSuccess: false,
  message: "",
};

export const fetchEntries = createAsyncThunk("entries/fetchEntries", async (_, thunkAPI) => {
  try {
    const entries = await apiService.getEntries();
    return entries;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const createEntry = createAsyncThunk("entries/createEntry", async (entryData: { title: string; content: string; category: string; date: string }, thunkAPI) => {
  try {
    const entry = await apiService.createEntry(entryData);
    return entry;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const updateEntry = createAsyncThunk("entries/updateEntry", async ({ id, data }: { id: number; data: Partial<Entry> }, thunkAPI) => {
  try {
    const updatedEntry = await apiService.updateEntry(id, data);
    return updatedEntry;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const deleteEntry = createAsyncThunk("entries/deleteEntry", async (id: number, thunkAPI) => {
  try {
    await apiService.deleteEntry(id);
    return id;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const entrySlice = createSlice({
  name: "entries",
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isLoading = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Entries
      .addCase(fetchEntries.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEntries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.entries = action.payload;
      })
      .addCase(fetchEntries.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      // Create Entry
      .addCase(createEntry.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.entries.unshift(action.payload); // Optimistic update
      })
      .addCase(createEntry.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      // Update Entry
      .addCase(updateEntry.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.entries = state.entries.map((entry) =>
          entry.id === action.payload.id ? action.payload : entry
        );
      })
      .addCase(updateEntry.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      // Delete Entry
      .addCase(deleteEntry.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.entries = state.entries.filter((entry) => entry.id !== action.payload);
      })
      .addCase(deleteEntry.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      });
  },
});

export const { reset: resetEntries } = entrySlice.actions;
export default entrySlice.reducer;