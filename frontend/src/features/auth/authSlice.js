import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchMe } from '../../api/authApi';

export const loadMe = createAsyncThunk('auth/loadMe', async () => {
  return await fetchMe();
});

const initialState = {
  me: null,
  status: 'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth(state) {
      state.me = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMe.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadMe.fulfilled, (state, action) => {
        state.me = action.payload;
        state.status = 'succeeded';
      })
      .addCase(loadMe.rejected, (state) => {
        state.me = null;
        state.status = 'failed';
      });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;

