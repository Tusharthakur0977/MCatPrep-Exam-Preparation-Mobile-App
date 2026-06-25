import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GetUserAcountAPiResponse } from '../../Services/ApiResponses/GetUserAcountAPiResponse';

export interface UserInitialState {
  userData: GetUserAcountAPiResponse | null;
  userPaymentStatus: any;
}

const userInitialState: UserInitialState = {
  userData: null,
  userPaymentStatus: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState: userInitialState,
  reducers: {
    setUSerdata(state, action: PayloadAction<GetUserAcountAPiResponse | null>) {
      state.userData = action.payload;
    },
    setUserPaymentStatus(state, action: PayloadAction<any>) {
      state.userPaymentStatus = action.payload;
    },
  },
});

export const { setUSerdata, setUserPaymentStatus } = userSlice.actions;

export default userSlice.reducer;
