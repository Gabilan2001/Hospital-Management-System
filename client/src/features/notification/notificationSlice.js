import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

export const fetchNotifications = createAsyncThunk('notification/fetch', async () => {
  const { data } = await api.get('/notifications');
  return data;
});

export const markNotificationRead = createAsyncThunk('notification/markRead', async (id) => {
  await api.put(`/notifications/${id}/read`);
  return id;
});

export const markAllRead = createAsyncThunk('notification/markAllRead', async () => {
  await api.put('/notifications/read-all');
});

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
  },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload.data;
        state.unreadCount = action.payload.unreadCount;
        state.loading = false;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const item = state.items.find((n) => n._id === action.payload);
        if (item && !item.isRead) {
          item.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.items.forEach((n) => { n.isRead = true; });
        state.unreadCount = 0;
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
