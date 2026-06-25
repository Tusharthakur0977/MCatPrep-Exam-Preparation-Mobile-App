import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Video } from '../Services/ApiResponses/TopicDetailsApiResponse';

export type RootStackParams = {
  splash: undefined;
  exploreFeatures: undefined;
  scheduleTimings: { activeTab?: number };
  mainStack: NavigatorScreenParams<MainStackParams>;
};

export type MainStackParams = {
  bottomTabStack: NavigatorScreenParams<BottomTabStackParams>;
  tutoerFeatures: undefined;
  questionList: {
    type: 'flashCard' | 'questions';
    subject: string;
    subjectId?: string;
  };
  questionBank: undeinfed;
  search: undefined;
  studyTime: undefined;
  myStats: undefined;
  buddies: {
    showForm: boolean;
  };
  manageAccount: undefined;
  editProfile: undefined;
  lessonDetail: {
    lessonId: string;
    videoId: string | null;
    videosData: Video[];
    topicId: string;
  };
  lessonNotes: { lessonId: string; notes: any | null; note_url: string | null };
  lessonWhiteBoard: {
    lessonId: string;
    notes: any | null;
    note_url: string | null;
  };
  subjectDetails: { subjectId: string };
  notification: undefined;
  flashcard: undefined;
  questionSummary: {
    total: number;
    correct: number;
    incorrect: number;
    questions: any[];
    subjectId: string;
    status: string;
    subject: string;
  };
};

export type BottomTabStackParams = {
  homeTab: NavigatorScreenParams<HomeStackParams>;
  progressTab: NavigatorScreenParams<ProgressStackParams>;
  learnTab: { initialTab: 'Schedule' | 'Lessons' };
  practiceTab: NavigatorScreenParams<PracticeStackParams>;
  profileTab: NavigatorScreenParams<ProfileStackParams>;
};

export type HomeStackParams = {
  home: undefined;
};
export type PracticeStackParams = {
  practice: undefined;
};

export type ProgressStackParams = {
  progress: undefined;
};

export type ProfileStackParams = {
  profile: undefined;
  myAccount: undefined;
  dailyNotification: undefined;
  quesitonOfDay: undefined;
  testDate: undefined;
  studyTime: undefined;
  bookmarkedVideos: undefined;
  feedback: undefined;
};

// SPLASH SCREEN
export type SplashScreenProps = NativeStackScreenProps<
  RootStackParams,
  'splash'
>;

// EXPLORE FEATURES SCREEN
export type ExploreFeaturesScreenProps = NativeStackScreenProps<
  RootStackParams,
  'exploreFeatures'
>;

// SCHEDULE TIMINGS SCREEN
export type ScheduleTimingScreenProps = NativeStackScreenProps<
  RootStackParams & MainStackParams & BottomTabStackParams,
  'scheduleTimings'
>;

// SCHEDULE TIMINGS SCREEN
export type OnBoardingScreenProps = NativeStackScreenProps<
  RootStackParams,
  'onBoarding'
>;

// PRACTICE SCREENS
export type PracticeProps = NativeStackScreenProps<
  RootStackParams & BottomTabStackParams & PracticeStackParams,
  'practice'
>;
export type QuestionListProps = NativeStackScreenProps<
  RootStackParams & BottomTabStackParams & MainStackParams,
  'questionList'
>;
export type QuestionBankProps = NativeStackScreenProps<
  RootStackParams & BottomTabStackParams & MainStackParams,
  'questionBank'
>;
export type FlashcardProps = NativeStackScreenProps<
  RootStackParams & BottomTabStackParams & MainStackParams,
  'flashcard'
>;

// PROFILE SCREENS
export type ProfileScreenProps = NativeStackScreenProps<
  RootStackParams & BottomTabStackParams & ProfileStackParams,
  'profile'
>;
export type MyAccountProps = NativeStackScreenProps<
  RootStackParams & BottomTabStackParams & ProfileStackParams,
  'myAccount'
>;
export type ManageAccountProps = NativeStackScreenProps<
  RootStackParams & MainStackParams & ProfileStackParams,
  'manageAccount'
>;
export type BuddiesScreenProps = NativeStackScreenProps<
  RootStackParams & MainStackParams & ProfileStackParams,
  'buddies'
>;
export type DailyNotificationScreenProps = NativeStackScreenProps<
  RootStackParams & BottomTabStackParams & ProfileStackParams,
  'dailyNotification'
>;
export type TestDateScreenProps = NativeStackScreenProps<
  RootStackParams & BottomTabStackParams & ProfileStackParams,
  'testDate'
>;
export type StudyTimeScreenProps = NativeStackScreenProps<
  RootStackParams & BottomTabStackParams & MainStackParams,
  'studyTime'
>;
export type MyStatsScreenProps = NativeStackScreenProps<
  RootStackParams & MainStackParams & ProfileStackParams,
  'myStats'
>;
export type BookmarkedVideosProps = NativeStackScreenProps<
  RootStackParams & BottomTabStackParams & ProfileStackParams & MainStackParams,
  'bookmarkedVideos'
>;
export type FeedbackProps = NativeStackScreenProps<
  RootStackParams & BottomTabStackParams & ProfileStackParams,
  'feedback'
>;

// HOME STACK SCREENS
export type HomeScreenProps = NativeStackScreenProps<
  RootStackParams & BottomTabStackParams & HomeStackParams & MainStackParams,
  'home'
>;

// PROGRESS STACK SCREENS
export type TutoerFeaturesProps = NativeStackScreenProps<
  RootStackParams & BottomTabStackParams & HomeStackParams & MainStackParams,
  'tutoerFeatures'
>;

// PRACTICE QUESTION  BANK SCREEN
export type QuestionListProps = NativeStackScreenProps<
  RootStackParams &
    BottomTabStackParams &
    PracticeStackParams &
    MainStackParams,
  'questionList'
>;

// Lesson screens
export type EditProfileProps = NativeStackScreenProps<
  RootStackParams & BottomTabStackParams & MainStackParams,
  'editProfile'
>;
export type LessonDetailProps = NativeStackScreenProps<
  RootStackParams & BottomTabStackParams & MainStackParams,
  'lessonDetail'
>;
export type SubjectDetailProps = NativeStackScreenProps<
  RootStackParams & BottomTabStackParams & MainStackParams,
  'subjectDetails'
>;

export type LearnScreenProps = NativeStackScreenProps<
  RootStackParams & BottomTabStackParams & MainStackParams,
  'learnTab'
>;

export type LessonNotesProps = NativeStackScreenProps<
  RootStackParams & BottomTabStackParams & MainStackParams,
  'lessonNotes'
>;

export type LessonWhiteBoardProps = NativeStackScreenProps<
  RootStackParams & BottomTabStackParams & MainStackParams,
  'lessonWhiteBoard'
>;

// Notification Screen
export type NotificationsProps = NativeStackScreenProps<
  RootStackParams & BottomTabStackParams & MainStackParams,
  'notification'
>;
export type SearchProps = NativeStackScreenProps<
  RootStackParams & BottomTabStackParams & MainStackParams,
  'search'
>;

export type QuestionSummaryProps = NativeStackScreenProps<
  RootStackParams & BottomTabStackParams & MainStackParams,
  'questionSummary'
>;
