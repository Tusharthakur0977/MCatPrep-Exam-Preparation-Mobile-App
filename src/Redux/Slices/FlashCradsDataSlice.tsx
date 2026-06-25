import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GetSectionApiResponse } from '../../Services/ApiResponses/GetSectionApiResponse';
import { flashCardStatsResponse } from '../../Services/ApiResponses/FlashCardStatsApiResponse';
import { FlashCardsResponse } from '../../Services/ApiResponses/FlashCardsResponse';

export interface ContentState {
  flashCards: FlashCardsResponse | null;
}

const contentState: ContentState = {
  flashCards: null,
};

const userSlice = createSlice({
  name: 'flashCardsData',
  initialState: contentState,
  reducers: {
    setFLashCardsData(state, action: PayloadAction<FlashCardsResponse>) {
      state.flashCards = action.payload;
    },
  },
});

export const { setFLashCardsData } = userSlice.actions;

export default userSlice.reducer;
