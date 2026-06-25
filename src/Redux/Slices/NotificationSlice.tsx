import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationResponse } from '../../Services/ApiResponses/NotificationApiResponse';

// ✅ Initial state
const initialState: NotificationResponse = {
  push_notifications: true,
  email_notifications: true,
  study_reminders: true,
  question_of_the_day: true,
  weekly_progress: true,
};

// ✅ Slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Update a single notification setting
    setNotificationSetting: (
      state,
      action: PayloadAction<{
        key: keyof NotificationResponse;
        value: boolean;
      }>,
    ) => {
      state[action.payload.key] = action.payload.value;
    },

    // Replace all settings
    setAllNotifications: (
      state,
      action: PayloadAction<NotificationResponse>,
    ) => {
      return action.payload;
    },

    // Reset to initial default
    resetNotifications: () => initialState,
  },
});

// ✅ Export actions & reducer
export const {
  setNotificationSetting,
  setAllNotifications,
  resetNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
