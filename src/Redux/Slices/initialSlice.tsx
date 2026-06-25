import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface InitialState {
  isExplored: boolean;
  isScheduled: boolean;
  isOnboarded: boolean;
  hasGuideBeenShown: boolean;
}

const initialState: InitialState = {
  isExplored: false,
  isScheduled: false,
  isOnboarded: false,
  hasGuideBeenShown: false,
};

const initialSlice = createSlice({
  name: 'initial',
  initialState,
  reducers: {
    setIsExplored: (state, action: PayloadAction<boolean>) => {
      state.isExplored = action.payload;
    },
    setIsScheduled: (state, action: PayloadAction<boolean>) => {
      state.isScheduled = action.payload;
    },
    setIsOnboarded: (state, action: PayloadAction<boolean>) => {
      state.isOnboarded = action.payload;
    },
    setFlashCardGuideShown: state => {
      state.hasGuideBeenShown = true;
    },
  },
});

export const {
  setIsExplored,
  setIsOnboarded,
  setIsScheduled,
  setFlashCardGuideShown,
} = initialSlice.actions;

export default initialSlice.reducer;
