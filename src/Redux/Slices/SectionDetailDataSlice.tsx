import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SectionDetailsResponse } from '../../Services/ApiResponses/SectionDetailsApiResponse';

export interface sectionDetailsState {
  sectionDetails: SectionDetailsResponse | null;
}

const sectionDetailState: sectionDetailsState = {
  sectionDetails: null,
};

const sectionDetailSlice = createSlice({
  name: 'sectionDetailsData',
  initialState: sectionDetailState,
  reducers: {
    setSectionsDetails(state, action: PayloadAction<SectionDetailsResponse>) {
      state.sectionDetails = action.payload;
    },
  },
});

export const { setSectionsDetails } = sectionDetailSlice.actions;

export default sectionDetailSlice.reducer;
