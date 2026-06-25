import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import initialSlice from './Slices/initialSlice';
import userSlice from './Slices/userSlice';
import contentDataSlice from './Slices/ContentDataSlice';
import notificationsSlice from './Slices/NotificationSlice';
import scheduleDashboardSlice from './Slices/ScheduleDashBoardSlice';
import sectionDetailsDataSlice from './Slices/SectionDetailDataSlice';
import topicVideoSlice from './Slices/TopicVideoSlice';
import subscriptionSlice from './Slices/SubscriptionDataSlice';
import flashCardsDataSlice from './Slices/FlashCradsDataSlice';
import questionsDataSlice from './Slices/QuestionsDataSlice';

export const store = configureStore({
  reducer: {
    initial: initialSlice,
    user: userSlice,
    contentData: contentDataSlice,
    notifications: notificationsSlice,
    scheduleDashboard: scheduleDashboardSlice,
    sectionDetailsData: sectionDetailsDataSlice,
    topicVideo: topicVideoSlice,
    subscription: subscriptionSlice,
    flashCardsData: flashCardsDataSlice,
    questionsData: questionsDataSlice,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
