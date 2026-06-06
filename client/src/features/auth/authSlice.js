import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

let meRequest = null;

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    if (!meRequest) {
      meRequest = api.get('/auth/me').finally(() => {
        meRequest = null;
      });
    }
    try {
      const { data } = await meRequest;
      return data.user;
    } catch {
      return rejectWithValue(null);
    }
  },
  {
    condition: (_, { getState }) => !getState().auth.sessionChecked,
  }
);

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    return data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  try {
    await api.post('/auth/logout');
  } catch {
    // ignore logout errors
  } finally {
    dispatch(clearAuth());
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    initializing: true,
    sessionChecked: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.sessionChecked = true;
      state.initializing = false;
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.initializing = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.initializing = false;
        state.sessionChecked = true;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.initializing = false;
        state.sessionChecked = true;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.initializing = false;
        state.sessionChecked = true;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.sessionChecked = true;
        state.initializing = false;
      });
  },
});

export const { clearError, clearAuth, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;
