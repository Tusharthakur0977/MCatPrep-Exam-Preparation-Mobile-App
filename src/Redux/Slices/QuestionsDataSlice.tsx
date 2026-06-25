import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { QuestionsResponse } from '../../Services/ApiResponses/QuestionsDataResponse';

export interface QuestionState {
  questionsData: QuestionsResponse | null;
}

const contentState: QuestionState = {
  questionsData: null,
};

const userSlice = createSlice({
  name: 'questionsData',
  initialState: contentState,
  reducers: {
    setQuestionsData(state, action: PayloadAction<QuestionsResponse>) {
      state.questionsData = action.payload;
    },
  },
});

export const { setQuestionsData } = userSlice.actions;

export default userSlice.reducer;
