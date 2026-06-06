import { createSlice } from '@reduxjs/toolkit';

const queueSlice = createSlice({
  name: 'queue',
  initialState: {
    display: [],
    doctorQueue: [],
  },
  reducers: {
    setQueueDisplay: (state, action) => {
      state.display = action.payload;
    },
    setDoctorQueue: (state, action) => {
      state.doctorQueue = action.payload;
    },
    updateQueue: (state, action) => {
      state.display = action.payload;
    },
  },
});

export const { setQueueDisplay, setDoctorQueue, updateQueue } = queueSlice.actions;
export default queueSlice.reducer;
