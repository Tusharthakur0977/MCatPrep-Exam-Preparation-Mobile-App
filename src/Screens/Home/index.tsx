import { useFocusEffect } from '@react-navigation/native';
import React, { FC, useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import ICONS from '../../Assets/Icons';
import IMAGES from '../../Assets/Images';
import BlueBubbleContainer from '../../Components/BlueBubbleContainer';
import CustomIcon from '../../Components/CustomIcon';
import { CustomText } from '../../Components/CustomText';
import LearningSupportModal from '../../Components/Modal/LearningSupportModal';
import ProgressSchedulerModal from '../../Components/Modal/ProgressSchedulerModal';
import PrimaryButton from '../../Components/PrimaryButton';
import { setSections, setSubjects } from '../../Redux/Slices/ContentDataSlice';
import { setSelectedDayItems } from '../../Redux/Slices/ScheduleDashBoardSlice';
import { useAppDispatch, useAppSelector } from '../../Redux/store';
import ENDPOINTS from '../../Services/ApiEndpoints';
import { ScheduleItem } from '../../Services/ApiResponses/GetDashScheduleDashboardApiResponse';
import { ProfileDataResponse } from '../../Services/ApiResponses/GetProfileApiResponse';
import { GetSectionApiResponse } from '../../Services/ApiResponses/GetSectionApiResponse';
import { GetSubjectsApiResponse } from '../../Services/ApiResponses/GetSubjectsApiResponse';
import { deleteData, fetchData, postData } from '../../Services/ApiService';
import { LastWatchedVideoResponse } from '../../Services/LastWatchedVideoApiResponse';
import { fetchUserApiData } from '../../Services/UserApiService';
import { HomeScreenProps } from '../../Typings/route';
import { COLORS } from '../../Utilities/Colors';
import { horizontalScale, verticalScale, wp } from '../../Utilities/Metrics';
import { FlashCardsResponse } from '../../Services/ApiResponses/FlashCardsResponse';
import { setFLashCardsData } from '../../Redux/Slices/FlashCradsDataSlice';
import { QuestionsResponse } from '../../Services/ApiResponses/QuestionsDataResponse';
import { setQuestionsData } from '../../Redux/Slices/QuestionsDataSlice';

const Home: FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { user } = useAuth0();
  const { items } = useAppSelector(state => state.scheduleDashboard);
  const { data } = useAppSelector(state => state.subscription);
  const { userData } = useAppSelector(state => state.user);
  const [lessonDataLoading, setLessonDataLoading] = useState(false);
  const [currentDay, setcurrentDay] = useState<number>(0);
  const [lastWatchedVideoData, setLastWatchedVideoData] =
    useState<LastWatchedVideoResponse | null>(null);
  const { data: subscription } = useAppSelector(state => state.subscription);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLearningSupportModalVisible, setIsLearningSupportModalVisible] =
    useState(false);
  const [profileData, setProfileData] = useState<ProfileDataResponse | null>(
    null,
  );

  const handleNavigateToPremium = (screen: string, params?: any) => {
    // Check subscription before navigating
    if (!subscription || subscription.status !== 'active') {
      navigation.navigate('scheduleTimings', { activeTab: 4 });
      return;
    }
    // If subscription is active, navigate normally
    navigation.navigate(screen, params);
  };

  const fetchSections = async () => {
    try {
      const response = await fetchData<GetSectionApiResponse>(
        ENDPOINTS.getSections,
      );

      if (response.data) {
        dispatch(setSections(response.data));
      }
    } catch (error) {
      console.log('Error fetching sections:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetchData<GetSubjectsApiResponse>(
        ENDPOINTS.getSubjects,
      );

      if (response.data) {
        dispatch(setSubjects(response.data));
      }
    } catch (error) {
      console.log('Error fetching sections:', error);
    }
  };

  const hanldeFetchScheduleProgress = async () => {
    try {
      const response = await fetchData<any>(ENDPOINTS.getScheduleProgress);
      if (response.data.current_day) {
        setcurrentDay(response.data.current_day);
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  const handleFetchDaySchedule = async (day: number) => {
    try {
      setLessonDataLoading(true);
      const response = await fetchData<ScheduleItem[]>(
        `${ENDPOINTS.getSpecificDaySchedule}${day}?isHour=true`,
      );

      if (response.data) {
        dispatch(setSelectedDayItems(response.data));
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
      setLessonDataLoading(false);
    } finally {
      setLessonDataLoading(false);
    }
  };

  const handleLastWatchedVideo = async () => {
    try {
      const response = await fetchData<LastWatchedVideoResponse>(
        ENDPOINTS.last_Watched_video,
      );

      if (response && response.data) {
        setLastWatchedVideoData(response.data);
      } else {
        // Handle cases where response is 200 but data is empty
        setLastWatchedVideoData(null);
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
      setLastWatchedVideoData(null);
    }
  };

  const handleAddFavroiteVideo = async (id: string | string[]) => {
    try {
      const videoIds = Array.isArray(id) ? id : [id];
      const data = {
        ids: videoIds,
      };
      const response = await postData(ENDPOINTS.favoritesVideo, data);
      if (response.status === 204) {
        handleFetchDaySchedule(currentDay);
        Toast.show({
          type: 'success',
          text1: 'Video successfully added to bookmarks',
          text2: 'You can access it anytime from your bookmarks list.',
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemoveFavoriteVideo = async (id: string | string[]) => {
    try {
      const videoIds = Array.isArray(id) ? id : [id];
      const data = {
        ids: videoIds,
      };
      const response = await deleteData(ENDPOINTS.removeFavoritesVideo, data);
      if (response.status === 204) {
        handleFetchDaySchedule(currentDay);
        Toast.show({
          type: 'success',
          text1: 'Video successfully removed from bookmarks',
          text2: 'You can add it again anytime from your video library.',
        });
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  const getProfileData = async () => {
    try {
      const response = await fetchUserApiData<ProfileDataResponse>(
        ENDPOINTS.profile,
      );
      if (response.data) {
        setProfileData(response.data);
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  const fetchFlashCards = async () => {
    try {
      const response = await fetchData<FlashCardsResponse>(
        ENDPOINTS.getSectionsFlashcard,
      );
      if (response.data) {
        dispatch(setFLashCardsData(response.data));
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetchData<QuestionsResponse>(
        ENDPOINTS.getSectionsQuestion,
      );
      if (response.data) {
        dispatch(setQuestionsData(response.data));
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSections();
      fetchSubjects();
      hanldeFetchScheduleProgress();
      handleLastWatchedVideo();
      fetchFlashCards();
      fetchQuestions();
      getProfileData();
      if (currentDay) {
        handleFetchDaySchedule(currentDay);
      }
    }, [currentDay]),
  );

  const getDisplayName = (name?: string) => {
    if (!name) return '';
    return name.includes('@') ? name.split('@')[0] : name;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollCont}
      >
        <View style={styles.header}>
          <View>
            <TouchableOpacity
              onPress={() => setIsLearningSupportModalVisible(true)}
            >
              <CustomText
                fontFamily="ROBOTO_bold"
                fontSize={22}
                color={COLORS.blueBlack}
              >
                Hello{' '}
                {`${
                  profileData?.first_name && profileData.last_name
                    ? profileData.first_name + ' ' + profileData.last_name
                    : profileData?.first_name
                    ? getDisplayName(profileData.first_name)
                    : getDisplayName(userData?.first_name)
                }`}
              </CustomText>
            </TouchableOpacity>
            <View style={{ alignSelf: 'flex-start' }}>
              <CustomText
                onPress={() => navigation.navigate('manageAccount')}
                fontSize={12}
                fontFamily="ROBOTO_bold"
                color={COLORS.MCAT_Dark_Blue}
                textAlign="left"
              >
                {data?.name ? `${data?.name} -` : ''}{' '}
                <CustomText
                  fontSize={12}
                  color={COLORS.MCAT_Dark_Blue}
                  fontFamily="ROBOTO_medium"
                >
                  {data?.status}
                </CustomText>
              </CustomText>
            </View>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('profileTab', {
                screen: 'profile',
              })
            }
          >
            <Image
              source={{ uri: user?.picture }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <CustomIcon
            Icon={ICONS.SearchIcon}
            height={verticalScale(14)}
            width={verticalScale(14)}
          />
          <TextInput
            placeholder="Search for a lesson"
            placeholderTextColor="#00000059"
            value={''}
            onChangeText={text => {}}
            style={styles.searchInput}
            onFocus={() => {
              navigation.navigate('mainStack', {
                screen: 'search',
              });
            }}
          />
          <CustomIcon
            Icon={ICONS.CrossIcon}
            height={verticalScale(11)}
            width={verticalScale(11)}
            onPress={() => {}}
          />
        </View>

        <View style={styles.sectionContainer}>
          <CustomText fontSize={15} fontFamily="ROBOTO_bold">
            Practice
          </CustomText>

          <FlatList
            data={[
              {
                name: 'Lessons',
                icon: ICONS.LessonIcon,
                bgColor: '#FFB84A',
                routeName: 'lessons',
              },
              {
                name: 'Question Of The Day',
                icon: ICONS.QuestionOfDayIcon,
                bgColor: COLORS.MCAT_Green,
                routeName: 'questionList',
              },
              {
                name: 'Flashcards',
                icon: ICONS.FlashCardIcon,
                bgColor: COLORS.MCAT_Dark_Blue,
                routeName: 'flashCard',
              },
              {
                name: 'Question Bank',
                icon: ICONS.QuestionBankIcon,
                bgColor: COLORS.MCAT_Orange,
                routeName: 'questionList',
              },
            ]}
            numColumns={2}
            columnWrapperStyle={styles.flatlistColumnWrapper}
            contentContainerStyle={styles.flatlistContent}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  style={[
                    styles.practiceItem,
                    { backgroundColor: item.bgColor },
                  ]}
                  onPress={() => {
                    if (item.name === 'Lessons') {
                      handleNavigateToPremium('learnTab', {
                        initialTab: 'Lessons',
                      });
                    } else if (item.name === 'Flashcards') {
                      handleNavigateToPremium('flashcard');
                    } else if (item.name === 'Question Bank') {
                      handleNavigateToPremium('questionBank');
                    } else {
                      navigation.navigate('questionList', {
                        subject: 'Questions of the Day',
                        type: 'questions',
                      });
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <CustomIcon
                    Icon={item.icon}
                    height={verticalScale(41)}
                    width={verticalScale(41)}
                  />
                  <CustomText
                    fontSize={12}
                    fontFamily="ROBOTO_regular"
                    color={COLORS.MCAT_White}
                  >
                    {item.name}
                  </CustomText>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {lastWatchedVideoData && (
          <View style={styles.sectionContainer}>
            <CustomText fontSize={15} fontFamily="ROBOTO_bold">
              Recently Watched
            </CustomText>

            <BlueBubbleContainer
              mainStyle={{
                borderRadius: 10,
              }}
              contentStyle={styles.watchedCard}
            >
              <View
                style={{
                  gap: verticalScale(10),
                  width: wp(50),
                }}
              >
                <TouchableOpacity
                  style={styles.continueWatchingBadge}
                  activeOpacity={0.8}
                  onPress={() => {
                    navigation.navigate('lessonDetail', {
                      lessonId: lastWatchedVideoData.id,
                      videoId: lastWatchedVideoData.id,
                      videosData: Array.isArray(lastWatchedVideoData)
                        ? lastWatchedVideoData
                        : [lastWatchedVideoData] || [],
                      topicId: lastWatchedVideoData.topic_id,
                    });
                  }}
                >
                  <View
                    style={{
                      backgroundColor: COLORS.MCAT_Dark_Blue,
                      borderRadius: 100,
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: 5,
                    }}
                  >
                    <CustomIcon
                      Icon={ICONS.playIconWhite}
                      height={7}
                      width={7}
                      style={{ marginLeft: 1 }}
                    />
                  </View>
                  <CustomText
                    color={COLORS.MCAT_Dark_Blue}
                    fontSize={10}
                    fontFamily="RUBIK_bold"
                  >
                    CONTINUE WATCHING
                  </CustomText>
                </TouchableOpacity>

                <View style={styles.watchedTextGroup}>
                  <CustomText
                    color={COLORS.MCAT_White}
                    fontSize={13}
                    fontFamily="RUBIK_semiBold"
                  >
                    {lastWatchedVideoData.subject.name} -{' '}
                    {lastWatchedVideoData.topic.name}
                  </CustomText>
                  <CustomText
                    color={COLORS.MCAT_White}
                    fontSize={13}
                    fontFamily="RUBIK_semiBold"
                  >
                    LESSON {lastWatchedVideoData.topic.order}
                  </CustomText>
                  <CustomText
                    color={COLORS.MCAT_White}
                    fontSize={16}
                    fontFamily="RUBIK_regular"
                  >
                    {lastWatchedVideoData.name}
                  </CustomText>

                  <View style={styles.watchedProgressRow}>
                    <View style={styles.watchedTimeBadge}>
                      <CustomText
                        color={COLORS.MCAT_Dark_Blue}
                        fontSize={12}
                        fontFamily="RUBIK_semiBold"
                      >
                        {lastWatchedVideoData.length}
                      </CustomText>
                    </View>
                    <CustomText
                      color={COLORS.MCAT_White}
                      fontFamily="RUBIK_medium"
                      fontSize={12}
                    >
                      {lastWatchedVideoData.progress.percentage}% watched
                    </CustomText>
                  </View>
                </View>
              </View>

              <CustomIcon Icon={ICONS.illustration} height={150} width={150} />
            </BlueBubbleContainer>
          </View>
        )}

        <View style={styles.upNextSection}>
          <View style={styles.upNextHeader}>
            <CustomText fontSize={15} fontFamily="ROBOTO_bold">
              Up Next
            </CustomText>
            <CustomText fontSize={15} fontFamily="ROBOTO_bold">
              Day {currentDay}
            </CustomText>
          </View>

          {!lessonDataLoading && items.length > 0 ? (
            <>
              <FlatList
                data={items}
                contentContainerStyle={styles.upNextList}
                ItemSeparatorComponent={() => {
                  return <View style={styles.upNextSeparator} />;
                }}
                renderItem={({
                  item,
                  index,
                }: {
                  item: ScheduleItem;
                  index: any;
                }) => {
                  return (
                    <TouchableOpacity
                      style={styles.upNextItem}
                      onPress={() => {
                        navigation.navigate('lessonDetail', {
                          lessonId: item.id,
                          videoId: item.id,
                          videosData: items || [],
                          topicId: item.topic_id,
                        });
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.imageWrapper}>
                        <Image
                          source={{
                            uri: item.image || IMAGES.MedSchool,
                          }}
                          style={styles.upNextImage}
                        />
                        <View
                          style={[
                            styles.upNextTimeBadge,
                            {
                              backgroundColor:
                                item.progress.percentage === 100
                                  ? '#008E2E'
                                  : COLORS.MCAT_Dark_Blue,
                            },
                          ]}
                        >
                          <CustomText
                            color={COLORS.MCAT_White}
                            fontSize={12}
                            fontFamily="RUBIK_regular"
                          >
                            {item.progress.percentage > 0
                              ? `${item.progress.percentage}%`
                              : `${item.length}`}
                          </CustomText>
                        </View>
                      </View>
                      <View style={styles.upNextTextContent}>
                        <CustomText
                          color={COLORS.MCAT_Dark_Blue}
                          fontFamily="RUBIK_medium"
                          fontSize={13}
                        >
                          Lesson {index + 1}
                        </CustomText>
                        <CustomText fontFamily="ROBOTO_regular" fontSize={14}>
                          {item.name}
                        </CustomText>
                        {item.progress && (
                          <View style={styles.progressBarContainer}>
                            <View
                              style={[
                                styles.progressBar,
                                {
                                  width: `${item.progress.percentage}%`,
                                  backgroundColor:
                                    item.progress.percentage === 100
                                      ? COLORS.MCAT_Green // Green at 100%
                                      : COLORS.MCAT_Dark_Blue, // Blue otherwise
                                },
                              ]}
                            />
                          </View>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          // toggleBookmark(index)
                          if (item.favorite) {
                            handleRemoveFavoriteVideo(item.id);
                          } else {
                            handleAddFavroiteVideo(item.id);
                          }
                        }}
                        activeOpacity={0.7}
                        style={styles.upNextCrossIcon}
                      >
                        <CustomIcon
                          Icon={
                            item.favorite
                              ? ICONS.BookmarkSolid
                              : ICONS.BookMarkGrey
                          }
                          height={18}
                          width={18}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                }}
              />

              <PrimaryButton
                title="See full schedule"
                onPress={() => {
                  navigation.navigate('learnTab', {
                    initialTab: 'Schedule',
                  });
                }}
                bgColor={[COLORS.MCAT_Dark_Blue, COLORS.MCAT_Dark_Blue]}
              />
            </>
          ) : (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
              }}
            >
              <ActivityIndicator size="large" color={COLORS.MCAT_Dark_Blue} />
            </View>
          )}
        </View>

        <ProgressSchedulerModal
          isVisible={isModalVisible}
          setIsVisible={setIsModalVisible}
          onSelect={() => setIsModalVisible(false)}
        />
        <LearningSupportModal
          isVisible={isLearningSupportModalVisible}
          setIsVisible={setIsLearningSupportModalVisible}
          onSelect={() => setIsLearningSupportModalVisible(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(20),
  },
  scrollView: {
    flex: 1,
  },
  scrollCont: {
    gap: verticalScale(20),
    paddingHorizontal: horizontalScale(15),
    paddingBottom: verticalScale(70),
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: horizontalScale(10),
  },
  Activeheader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(5),
    paddingVertical: verticalScale(5),
    width: wp(86),
  },
  profileInitials: {
    backgroundColor: '#00B690',
    padding: verticalScale(10),
    borderRadius: 100,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
    width: '100%',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    borderRadius: 5,
    shadowOpacity: 0.2,
    elevation: 8,
    backgroundColor: COLORS.white,
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(12),
    shadowRadius: 5,
  },
  profileImage: {
    height: 40,
    width: 40,
    borderRadius: 100,
  },

  searchInput: {
    flex: 1,
    paddingVertical: verticalScale(5),
  },
  sectionContainer: {
    gap: verticalScale(10),
  },
  flatlistColumnWrapper: {
    justifyContent: 'space-between',
  },
  flatlistContent: {
    gap: verticalScale(10),
  },
  practiceItem: {
    width: (wp(100) - horizontalScale(40)) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: verticalScale(10),
    gap: verticalScale(8),
  },
  watchedCard: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: verticalScale(5),
    padding: verticalScale(15),
    alignItems: 'flex-start',
  },
  continueWatchingBadge: {
    backgroundColor: COLORS.MCAT_White,
    borderRadius: 15,
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(10),
    flexDirection: 'row',
    gap: horizontalScale(4),
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(45),
  },
  watchedTextGroup: {
    gap: verticalScale(5),
  },
  watchedProgressRow: {
    flexDirection: 'row',
    gap: horizontalScale(10),
    alignItems: 'center',
    marginTop: verticalScale(5),
  },
  watchedTimeBadge: {
    backgroundColor: COLORS.MCAT_White,
    borderRadius: 3,
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
  },
  illustrationIcon: {
    position: 'absolute',
    right: horizontalScale(-20),
    top: verticalScale(-10),
  },
  upNextSection: {
    gap: verticalScale(10),
    flex: 1,
  },
  upNextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  upNextList: {
    gap: verticalScale(10),
  },
  upNextSeparator: {
    backgroundColor: COLORS.LightGrey,
    height: 2,
    borderRadius: 5,
    marginTop: verticalScale(5),
  },
  upNextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(10),
    gap: horizontalScale(20),
  },
  imageWrapper: {
    position: 'relative',
  },
  upNextImage: {
    height: 80,
    width: 80,
    borderRadius: 6,
  },
  upNextTimeBadge: {
    borderRadius: 3,
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    position: 'absolute',
    top: -verticalScale(4),
    right: -10,
  },
  upNextTextContent: {
    gap: verticalScale(4),
    flex: 1,
    paddingRight: horizontalScale(10),
    position: 'relative',
  },
  upNextProgressBar: {
    width: '100%',
    backgroundColor: COLORS.LightGrey,
    height: 4,
    borderRadius: 5,
    marginTop: verticalScale(5),
  },
  upNextCrossIcon: {
    position: 'absolute',
    top: 0,
    right: horizontalScale(10),
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: verticalScale(5),
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});
