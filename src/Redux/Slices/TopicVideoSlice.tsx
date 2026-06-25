import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TopicVideoResponse } from '../../Services/ApiResponses/TopicsVideoApiResponse';

interface topicVideoState {
  topicVideo: TopicVideoResponse | null;
}

const initialState: topicVideoState = {
  topicVideo: null,
};

const topicVideoSlice = createSlice({
  name: 'topicVideo',
  initialState,
  reducers: {
    setTopicVideo: (state, action: PayloadAction<TopicVideoResponse>) => {
      state.topicVideo = action.payload;
    },
  },
});

export const { setTopicVideo } = topicVideoSlice.actions;

export default topicVideoSlice.reducer;
