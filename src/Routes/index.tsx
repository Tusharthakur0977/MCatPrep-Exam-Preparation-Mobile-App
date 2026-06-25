import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Platform } from 'react-native';
import 'react-native-gesture-handler';
import BottomTabBar from '../Components/BottomTabBar';
import BookmarkedVideos from '../Screens/BookmarkedVideos';
import Buddies from '../Screens/Buddies';
import DailyNotification from '../Screens/DailyNotification';
import EditProfile from '../Screens/EditProfile';
import ExploreFeatures from '../Screens/ExploreFeatures';
import Feedback from '../Screens/Feedback';
import Home from '../Screens/Home';
import Learn from '../Screens/Learn';
import LessonDetail from '../Screens/LessonDetail';
import ManageAccount from '../Screens/ManageAccount';
import MyAccount from '../Screens/MyAccount';
import MyStats from '../Screens/MyStats';
import Notifications from '../Screens/Notification';
import Practice from '../Screens/Practice';
import Profile from '../Screens/Profile';
import Progress from '../Screens/Progress';
import ScheduleTimings from '../Screens/ScheduleTimings';
import Splash from '../Screens/Splash';
import StudyTime from '../Screens/StudyTime';
import SubjectDetails from '../Screens/SubjectDetails';
import TestDate from '../Screens/TestDate';
import TutorFeatures from '../Screens/TutorFeatures';
import {
  BottomTabStackParams,
  HomeStackParams,
  MainStackParams,
  PracticeStackParams,
  ProfileStackParams,
  ProgressStackParams,
  RootStackParams,
} from '../Typings/route';
import LessonNotes from '../Screens/LessonNotes';
import LessonWhiteBoard from '../Screens/LessonWhiteBoard';
import QuestionList from '../Screens/QuestionList';
import QuestionBank from '../Screens/QuestionBank';
import Flashcard from '../Screens/Flashcard';
import QuestionSummary from '../Screens/QuestionSummary';
import Search from '../Screens/Search';

const Stack = createNativeStackNavigator<RootStackParams>();
const MainStack = createNativeStackNavigator<MainStackParams>();
const BottomTab = createBottomTabNavigator<BottomTabStackParams>();

const HomeStack = createNativeStackNavigator<HomeStackParams>();
const ProgressStack = createNativeStackNavigator<ProgressStackParams>();
const PracticeStack = createNativeStackNavigator<PracticeStackParams>();
const ProfileStack = createNativeStackNavigator<ProfileStackParams>();

export default function Routes() {
  const navigatorScreenOptions = {
    headerShown: false,
    animation: Platform.select({
      android: 'none' as const,
      ios: 'default' as const,
    }),
  };

  function MainStackScreens() {
    return (
      <MainStack.Navigator
        screenOptions={{
          animation: Platform.select({ android: 'none', ios: 'none' }),
          headerShown: false,
        }}
      >
        <MainStack.Screen name="bottomTabStack" component={TabStack} />
        <MainStack.Screen name="tutoerFeatures" component={TutorFeatures} />
        <MainStack.Screen name="questionList" component={QuestionList} />
        <MainStack.Screen name="studyTime" component={StudyTime} />
        <MainStack.Screen name="myStats" component={MyStats} />
        <MainStack.Screen name="buddies" component={Buddies} />
        <MainStack.Screen name="manageAccount" component={ManageAccount} />
        <MainStack.Screen name="editProfile" component={EditProfile} />
        <MainStack.Screen name="lessonDetail" component={LessonDetail} />
        <MainStack.Screen name="lessonNotes" component={LessonNotes} />
        <MainStack.Screen
          name="lessonWhiteBoard"
          component={LessonWhiteBoard}
        />
        <MainStack.Screen name="subjectDetails" component={SubjectDetails} />
        <MainStack.Screen name="notification" component={Notifications} />

        <MainStack.Screen name="questionBank" component={QuestionBank} />
        <MainStack.Screen name="flashcard" component={Flashcard} />
        <MainStack.Screen name="questionSummary" component={QuestionSummary} />
        <MainStack.Screen name="search" component={Search} />
      </MainStack.Navigator>
    );
  }

  function TabStack() {
    return (
      <BottomTab.Navigator
        screenOptions={{
          animation: Platform.select({ android: 'none', ios: 'none' }),
          headerShown: false,
          tabBarHideOnKeyboard: true,
        }}
        tabBar={props => <BottomTabBar {...props} />}
      >
        <BottomTab.Screen name="homeTab" component={HomeScreenStack} />
        <BottomTab.Screen name="progressTab" component={ProgressScreenStack} />
        <BottomTab.Screen name="learnTab" component={Learn} />
        <BottomTab.Screen name="practiceTab" component={PracticeScreenStack} />
        <BottomTab.Screen
          name="profileTab"
          options={{
            tabBarHideOnKeyboard: true, // Hides tab bar on this specific screen when keyboard is open
          }}
          component={ProfileTabScreenStack}
        />
      </BottomTab.Navigator>
    );
  }

  function HomeScreenStack() {
    return (
      <HomeStack.Navigator
        screenOptions={{
          animation: Platform.select({ android: 'none', ios: 'none' }),
          headerShown: false,
        }}
      >
        <HomeStack.Screen name="home" component={Home} />
      </HomeStack.Navigator>
    );
  }

  function ProgressScreenStack() {
    return (
      <ProgressStack.Navigator
        screenOptions={{
          animation: Platform.select({ android: 'none', ios: 'none' }),
          headerShown: false,
        }}
      >
        <ProgressStack.Screen name="progress" component={Progress} />
      </ProgressStack.Navigator>
    );
  }
  function PracticeScreenStack() {
    return (
      <PracticeStack.Navigator
        screenOptions={{
          animation: Platform.select({ android: 'none', ios: 'none' }),
          headerShown: false,
        }}
      >
        <PracticeStack.Screen name="practice" component={Practice} />
      </PracticeStack.Navigator>
    );
  }

  function ProfileTabScreenStack() {
    return (
      <ProfileStack.Navigator
        screenOptions={{
          animation: Platform.select({ android: 'none', ios: 'none' }),
          headerShown: false,
        }}
      >
        <ProfileStack.Screen name="profile" component={Profile} />
        <ProfileStack.Screen name="myAccount" component={MyAccount} />
        <ProfileStack.Screen
          name="dailyNotification"
          component={DailyNotification}
        />
        <ProfileStack.Screen name="testDate" component={TestDate} />
        <ProfileStack.Screen
          name="bookmarkedVideos"
          component={BookmarkedVideos}
        />
        <ProfileStack.Screen name="feedback" component={Feedback} />
      </ProfileStack.Navigator>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={navigatorScreenOptions}>
        <Stack.Screen name="splash" component={Splash} />
        <Stack.Screen name="mainStack" component={MainStackScreens} />
        <Stack.Screen name="exploreFeatures" component={ExploreFeatures} />
        <Stack.Screen name="scheduleTimings" component={ScheduleTimings} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
