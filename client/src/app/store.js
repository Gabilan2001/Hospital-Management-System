import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import notificationReducer from '../features/notification/notificationSlice';
import queueReducer from '../features/queue/queueSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notification: notificationReducer,
    queue: queueReducer,
  },
});
