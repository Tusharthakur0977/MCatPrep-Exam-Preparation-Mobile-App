import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ScheduleItem } from '../../Services/ApiResponses/GetDashScheduleDashboardApiResponse';

export interface dashboard {
  today: number;
  days: number;
  selectedDay: number;
  items: ScheduleItem[];
  refreshList: number;
}

// ✅ Initial state
const initialState: dashboard = {
  today: 0,
  days: 0,
  selectedDay: 1,
  items: [],
  refreshList: 0,
};

// ✅ Slice
const scheduleDashboardSlice = createSlice({
  name: 'scheduleDashboard',
  initialState,
  reducers: {
    // Replace entire dashboard data

    setToday: (state, action: PayloadAction<number>) => {
      state.today = action.payload;
    },
    setDays: (state, action: PayloadAction<number>) => {
      state.days = action.payload;
    },
    setSelectedDay: (state, action: PayloadAction<number>) => {
      state.selectedDay = action.payload;
    },
    setSelectedDayItems: (state, action: PayloadAction<ScheduleItem[]>) => {
      state.items = [...action.payload];
    },
    setRefreshList: state => {
      state.refreshList = Math.floor(Math.random() * 1000) + 1;
    },
  },
});

// ✅ Export actions & reducer
export const {
  setDays,
  setSelectedDay,
  setSelectedDayItems,
  setToday,
  setRefreshList,
} = scheduleDashboardSlice.actions;

export default scheduleDashboardSlice.reducer;
