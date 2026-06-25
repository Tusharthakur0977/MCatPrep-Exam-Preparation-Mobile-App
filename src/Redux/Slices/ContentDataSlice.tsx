import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GetSectionApiResponse } from '../../Services/ApiResponses/GetSectionApiResponse';
import { GetSubjectsApiResponse } from '../../Services/ApiResponses/GetSubjectsApiResponse';

export interface ContentState {
  sections: GetSectionApiResponse | null;
  subjects: GetSubjectsApiResponse | null;
}

const contentState: ContentState = {
  sections: null,
  subjects: null,
};

const userSlice = createSlice({
  name: 'contentData',
  initialState: contentState,
  reducers: {
    setSections(state, action: PayloadAction<GetSectionApiResponse>) {
      state.sections = action.payload;
    },
    setSubjects(state, action: PayloadAction<GetSubjectsApiResponse>) {
      state.subjects = action.payload;
    },
  },
});

export const { setSections, setSubjects } = userSlice.actions;

export default userSlice.reducer;
