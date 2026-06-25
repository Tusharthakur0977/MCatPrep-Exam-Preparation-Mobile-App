import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ICONS from '../../Assets/Icons';
import IMAGES from '../../Assets/Images';
import CustomIcon from '../../Components/CustomIcon';
import { CustomText } from '../../Components/CustomText';
import { KeyboardScrollView } from '../../Components/KeyboardScrollView';
import { LearnScreenProps } from '../../Typings/route';
import { COLORS } from '../../Utilities/Colors';
import { horizontalScale, verticalScale, wp } from '../../Utilities/Metrics';
import { deleteData, fetchData, postData } from '../../Services/ApiService';
import ENDPOINTS from '../../Services/ApiEndpoints';
import {
  ScheduleDashBoardResponse,
  ScheduleItem,
} from '../../Services/ApiResponses/GetDashScheduleDashboardApiResponse';
import {
  GetSectionApiResponse,
  Item,
} from '../../Services/ApiResponses/GetSectionApiResponse';
import { useAppDispatch, useAppSelector } from '../../Redux/store';
import {
  dashboard,
  setDays,
  setSelectedDay,
  setSelectedDayItems,
  setToday,
} from '../../Redux/Slices/ScheduleDashBoardSlice';
import { setSections } from '../../Redux/Slices/ContentDataSlice';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import { ScheduleResponse } from '../../Services/ApiResponses/ScheduleApiResponse';

const Learn: FC<LearnScreenProps> = ({ route, navigation }) => {
  const dispatch = useAppDispatch();
  const { sections } = useAppSelector(state => state.contentData);
  const { days, items, selectedDay } = useAppSelector(
    state => state.scheduleDashboard,
  );
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [sepcificDayLoading, setSepcificDayLoading] = useState(false);
  const initialTab = route?.params?.initialTab || 'Schedule';
  const [activeTab, setActiveTab] = useState<'Schedule' | 'Lessons'>(
    initialTab,
  );
  const [scheduleData, setScheduleData] = useState<ScheduleResponse | null>(
    null,
  );

  const handleGetScheduleStats = async () => {
    try {
      const response = await fetchData<ScheduleResponse>(
        `${ENDPOINTS.getStatsSchedule}isHour=true`,
      );

      if (response.data) {
        setScheduleData(response.data);
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  const renderLesson = ({
    item,
    index,
  }: {
    item: ScheduleItem;
    index: any;
  }) => {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: verticalScale(10),
          gap: horizontalScale(20),
        }}
        onPress={() => {
          navigation.navigate('lessonDetail', {
            lessonId: item.id,
            videoId: item.id,
            videosData: items || [],
            topicId: item.topic_id,
          });
        }}
      >
        {/* Thumbnail */}
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: item.image || IMAGES.MedSchool }}
            style={{
              height: 80,
              width: 80,
              borderRadius: 6,
            }}
          />
          <View
            style={{
              backgroundColor:
                item?.progress.percentage === 100
                  ? '#008E2E'
                  : COLORS.MCAT_Dark_Blue,
              borderRadius: 3,
              paddingHorizontal: horizontalScale(8),
              paddingVertical: verticalScale(4),
              position: 'absolute',
              top: -verticalScale(4),
              right: -10,
            }}
          >
            <CustomText
              color={COLORS.MCAT_White}
              fontSize={12}
              fontFamily="RUBIK_regular"
            >
              {item?.progress.percentage > 0
                ? `${item.progress.percentage}%`
                : item.length}
            </CustomText>
          </View>
        </View>

        {/* Info */}
        <View
          style={{
            gap: verticalScale(4),
            flex: 1,
            paddingRight: horizontalScale(10),
            position: 'relative',
          }}
        >
          <CustomText
            color={
              item?.progress.percentage === 100
                ? '#008E2E'
                : COLORS.MCAT_Dark_Blue
            }
            fontFamily="RUBIK_medium"
            fontSize={13}
          >
            Lesson {index + 1}
          </CustomText>
          <CustomText fontFamily="ROBOTO_regular" fontSize={14}>
            {item.name}
          </CustomText>

          {/* Progress bar */}
          <View
            style={{
              width: '100%',
              backgroundColor: COLORS.LightGrey,
              height: 4,
              borderRadius: 5,
              marginTop: verticalScale(5),
              overflow: 'hidden',
            }}
          >
            {item.progress.percentage > 0 && (
              <View
                style={{
                  height: '100%',
                  width: `${item.progress.percentage}%`,
                  backgroundColor:
                    item.progress.percentage === 100
                      ? COLORS.MCAT_Green // Green at 100%
                      : COLORS.MCAT_Dark_Blue, // Blue otherwise
                }}
              />
            )}
          </View>
        </View>

        {/* Bookmark / Cross icon */}
        <TouchableOpacity
          onPress={() => {
            // toggleBookmark(item.id)
            if (item.favorite) {
              handleRemoveFavoriteVideo(item.id);
            } else {
              handleAddFavroiteVideo(item.id);
            }
          }}
          style={{
            position: 'absolute',
            top: 5,
            right: horizontalScale(10),
          }}
        >
          <CustomIcon
            Icon={item.favorite ? ICONS.BookmarkSolid : ICONS.BookMarkGrey}
            height={20}
            width={20}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderDay = ({ item }: { item: { id: string; day: number } }) => {
    const isSelected = item.day === selectedDay;
    return (
      <TouchableOpacity
        style={[styles.dayButton, isSelected && styles.activeDay]}
        onPress={() => {
          dispatch(setSelectedDay(item.day));
          handleFetchSpecificDayData(item.day);
        }}
      >
        <CustomText
          fontFamily="INTER_bold"
          fontSize={14}
          color={isSelected ? COLORS.white : COLORS.black}
          style={{ letterSpacing: 0.5 }}
        >
          Day
        </CustomText>
        <CustomText
          fontFamily="INTER_bold"
          fontSize={13}
          color={isSelected ? COLORS.white : COLORS.black}
        >
          {item.day}
        </CustomText>
      </TouchableOpacity>
    );
  };

  const renderRemainingDaysBanner = (scheduleData: ScheduleResponse | null) => {
    if (!scheduleData) return null;

    const remainingDays = scheduleData?.days_left ?? 0;

    const getProgressColor = () => {
      if (remainingDays <= 6) return COLORS.MCAT_Orange;
      if (remainingDays <= 15) return COLORS.MCAT_Yellow;
      return COLORS.MCAT_Green;
    };

    const getProgressImageBanner = () => {
      if (remainingDays <= 6) return IMAGES.RedRemainingDaysBanner;
      if (remainingDays <= 15) return IMAGES.orangeRemainingDaysBanner;
      return IMAGES.GeenRemainingDaysBanner;
    };

    const getIcon = () => {
      if (remainingDays <= 6) return ICONS.AlarmClockIcon;
      if (remainingDays <= 15) return ICONS.RocketIcon;
      return ICONS.Star;
    };

    return (
      <View style={{ paddingHorizontal: horizontalScale(40) }}>
        <ImageBackground
          source={getProgressImageBanner()}
          style={styles.banner}
          resizeMode="contain"
        >
          <CustomIcon Icon={getIcon()} height={14} width={14} />
          <CustomText
            fontFamily="INTER_bold"
            fontSize={12}
            color={getProgressColor()}
          >
            {remainingDays} days left to finish your schedule
          </CustomText>
        </ImageBackground>
      </View>
    );
  };

  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route]);

  const renderCategory = ({ item }: { item: Item }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        { backgroundColor: item.setting.background_color },
      ]}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('mainStack', {
          screen: 'subjectDetails',
          params: {
            subjectId: item.id,
          },
        })
      }
    >
      <View style={{ width: '40%' }}>
        <CustomText fontFamily="INTER_bold" fontSize={14} color={COLORS.white}>
          {item.name}
        </CustomText>
      </View>
      <View style={{ width: '40%' }}>
        <CustomText
          fontFamily="INTER_regular"
          fontSize={13}
          color={COLORS.white}
        >
          {item.amount_of_videos} lessons
        </CustomText>
      </View>
      <CustomIcon Icon={ICONS.RightIcon} height={20} width={20} />
    </TouchableOpacity>
  );

  const handleFetchScheduleDayData = async () => {
    try {
      setScheduleLoading(true);
      const response = await fetchData<dashboard>(
        `${ENDPOINTS.getScheduleDashboard}isHour=true`,
      );

      if (response.data) {
        dispatch(setToday(response.data.today));
        dispatch(setDays(response.data.days));
        dispatch(setSelectedDay(response.data.today));
        dispatch(setSelectedDayItems(response.data.items));
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
      setScheduleLoading(false);
    } finally {
      setScheduleLoading(false);
    }
  };

  const daysArray = Array.from({ length: days }, (_, i) => ({
    id: (i + 1).toString(),
    day: i + 1,
  }));

  const handleFetchSpecificDayData = async (day: number) => {
    try {
      setSepcificDayLoading(true);
      const response = await fetchData<ScheduleItem[]>(
        `${ENDPOINTS.getSpecificDaySchedule}${day}?isHour=true`,
      );
      if (response.data) {
        // dispatch(setSelectedDay(day));
        dispatch(setSelectedDayItems(response.data));
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
      setSepcificDayLoading(false);
    } finally {
      setSepcificDayLoading(false);
    }
  };

  const getAllSection = async () => {
    try {
      setLessonsLoading(true);
      const response = await fetchData<GetSectionApiResponse>(
        `${ENDPOINTS.getSections}`,
      );
      if (response.data) {
        dispatch(setSections(response.data));
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
      setLessonsLoading(false);
    } finally {
      setLessonsLoading(false);
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
        handleFetchSpecificDayData(selectedDay);
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
        handleFetchSpecificDayData(selectedDay);
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

  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'Lessons') {
        getAllSection();
      }
      if (activeTab === 'Schedule') {
        handleFetchScheduleDayData();
        handleGetScheduleStats();
      }
    }, [activeTab]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardScrollView
        style={{
          backgroundColor: COLORS.white,
          gap: verticalScale(20),
          paddingBottom: verticalScale(100),
        }}
      >
        <CustomText
          fontFamily="INTER_extraBold"
          fontSize={22}
          color={COLORS.blueBlack}
        >
          Learn
        </CustomText>

        <View style={styles.tabRow}>
          {['Schedule', 'Lessons'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab as 'Schedule' | 'Lessons')}
            >
              <CustomText
                fontFamily="ROBOTO_bold"
                fontSize={14}
                color={
                  activeTab === tab ? COLORS.MCAT_Dark_Blue : COLORS.greyText
                }
              >
                {tab}
              </CustomText>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'Schedule' ? (
          !scheduleLoading ? (
            <>
              <View style={styles.ScheduleContainer}>
                <TouchableOpacity
                  style={styles.card}
                  activeOpacity={0.8}
                  onPress={() => {
                    navigation.navigate('tutoerFeatures');
                  }}
                >
                  <View style={styles.iconWrapper}>
                    <CustomIcon Icon={ICONS.TutorHelp} height={60} width={60} />
                  </View>
                  <CustomText fontFamily="INTER_regular" fontSize={12}>
                    Get Help From A Tutor
                  </CustomText>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity
                  style={styles.card}
                  activeOpacity={0.8}
                  onPress={() => {
                    navigation.navigate('studyTime');
                  }}
                >
                  <View style={styles.iconWrapper}>
                    <CustomIcon
                      Icon={ICONS.ChangeSchedule}
                      height={60}
                      width={60}
                    />
                  </View>
                  <CustomText fontFamily="INTER_regular" fontSize={12}>
                    Change My Schedule
                  </CustomText>
                </TouchableOpacity>
              </View>

              {renderRemainingDaysBanner(scheduleData)}

              <View style={{}}>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={daysArray}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={renderDay}
                  contentContainerStyle={{ gap: horizontalScale(8) }}
                />
              </View>

              {!sepcificDayLoading ? (
                <>
                  <View style={{ marginTop: verticalScale(10) }}>
                    <FlatList
                      data={items}
                      scrollEnabled={false}
                      keyExtractor={item => item.id}
                      renderItem={renderLesson}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{ gap: horizontalScale(8) }}
                    />
                  </View>

                  <View>
                    <TouchableOpacity
                      style={styles.footerButton}
                      onPress={() => {
                        navigation.navigate('tutoerFeatures');
                      }}
                    >
                      <CustomText
                        fontFamily="INTER_bold"
                        fontSize={14}
                        color={COLORS.white}
                      >
                        I want to speed up my Schedule
                      </CustomText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.changeSchedule}
                      onPress={() => {
                        navigation.navigate('studyTime');
                      }}
                    >
                      <CustomText
                        fontFamily="INTER_medium"
                        fontSize={12}
                        color={COLORS.MCAT_Dark_Blue}
                        style={{ textDecorationLine: 'underline' }}
                      >
                        Change My Schedule
                      </CustomText>
                      <CustomIcon
                        Icon={ICONS.blueArrow}
                        height={15}
                        width={15}
                      />
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <ActivityIndicator
                    size="large"
                    color={COLORS.MCAT_Dark_Blue}
                  />
                </View>
              )}
            </>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator size="large" color={COLORS.MCAT_Dark_Blue} />
            </View>
          )
        ) : !lessonsLoading ? (
          <View style={{ flex: 1 }}>
            <View style={styles.searchWrapper}>
              <CustomIcon Icon={ICONS.SearchLesson} height={18} width={18} />
              <TextInput
                placeholder="Search for a lesson"
                placeholderTextColor="#999"
                style={[
                  styles.searchInput,
                  {
                    paddingVertical:
                      Platform.OS === 'ios'
                        ? verticalScale(10)
                        : verticalScale(8),
                  },
                ]}
                value={''}
                onFocus={() => {
                  navigation.navigate('mainStack', {
                    screen: 'search',
                  });
                }}
                onChangeText={text => {}}
              />

              <CustomIcon
                Icon={ICONS.CrossIcon}
                height={11}
                width={11}
                onPress={() => {}}
              />
            </View>

            <FlatList
              data={[...(sections?.items ?? [])].sort(
                (a, b) => a.order - b.order,
              )}
              scrollEnabled={false}
              bounces={false}
              keyExtractor={item => item.id}
              renderItem={renderCategory}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                gap: verticalScale(10),
                marginTop: verticalScale(20),
              }}
            />
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size="large" color={COLORS.MCAT_Dark_Blue} />
          </View>
        )}
      </KeyboardScrollView>
    </SafeAreaView>
  );
};

export default Learn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: horizontalScale(15),
    paddingTop: verticalScale(10),
  },
  scrollView: {
    flex: 1,
  },
  scrollCont: {
    gap: verticalScale(20),
    paddingHorizontal: horizontalScale(15),
    paddingBottom: verticalScale(70),
  },
  tabRow: {
    flexDirection: 'row',
    gap: horizontalScale(10),
  },
  tabButton: {
    paddingVertical: verticalScale(10),
    marginRight: horizontalScale(15),
  },
  activeTab: {
    borderBottomWidth: 3,
    borderColor: COLORS.MCAT_Dark_Blue,
  },
  banner: {
    height: verticalScale(35),
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: horizontalScale(5),
    alignSelf: 'center',
  },
  dayButton: {
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(8),
    borderRadius: 5,
    alignItems: 'center',
  },
  activeDay: {
    backgroundColor: COLORS.blueBlack,
    borderColor: COLORS.blueBlack,
    borderWidth: 1,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
    paddingVertical: verticalScale(10),
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    paddingHorizontal: horizontalScale(10),
  },
  lessonBorder: {
    borderBottomWidth: 1,
    borderColor: COLORS.LightGrey,
  },
  thumbnail: {
    height: verticalScale(50),
    width: horizontalScale(50),
    borderRadius: 6,
  },
  durationTag: {
    position: 'absolute',
    top: -6,
    right: -4,
    backgroundColor: COLORS.blue,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(6),
    marginTop: 4,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.LightGrey,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.blue,
    borderRadius: 2,
  },
  footerButton: {
    backgroundColor: COLORS.MCAT_Dark_Blue,
    marginHorizontal: horizontalScale(15),
    marginTop: verticalScale(15),
    paddingVertical: verticalScale(15),
    borderRadius: 25,
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
  },
  changeSchedule: {
    flexDirection: 'row',
    gap: horizontalScale(10),
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: verticalScale(10),
    justifyContent: 'center',
  },
  ScheduleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.MCAT_White,
    borderRadius: 10,
    paddingVertical: verticalScale(10),
    boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
    marginTop: verticalScale(5),
    borderWidth: 1,
    borderColor: COLORS.borderGrey,
  },
  card: {
    flex: 1,
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: verticalScale(15),
  },

  divider: {
    width: 1.5,
    backgroundColor: COLORS.borderGrey,
  },
  categoryCard: {
    paddingVertical: verticalScale(25),
    paddingHorizontal: horizontalScale(30),
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(5),
    // marginBottom: verticalScale(20),
    gap: horizontalScale(10),
    backgroundColor: COLORS.MCAT_White,
    boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'ROBOTO_bold',
    fontSize: 14,
  },
  Activeheader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(5),
    paddingVertical: verticalScale(5),
    width: wp(86),
  },
});
