import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SubscriptionResponse } from '../../Services/ApiResponses/SubscriptionApiResponse';

interface SubscriptionState {
  data: SubscriptionResponse | null;
}

const initialState: SubscriptionState = {
  data: null,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    setSubscription(state, action: PayloadAction<SubscriptionResponse>) {
      state.data = action.payload;
    },
    clearSubscription(state) {
      state.data = null;
    },
  },
});

export const { setSubscription, clearSubscription } = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
