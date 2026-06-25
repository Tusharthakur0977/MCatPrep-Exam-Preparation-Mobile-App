import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { SubjectDetailProps } from '../../Typings/route';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import CustomIcon from '../../Components/CustomIcon';
import ICONS from '../../Assets/Icons';
import { horizontalScale, verticalScale, wp } from '../../Utilities/Metrics';
import { CustomText } from '../../Components/CustomText';
import { COLORS } from '../../Utilities/Colors';
import { deleteData, fetchData, postData } from '../../Services/ApiService';
import ENDPOINTS from '../../Services/ApiEndpoints';
import {
  SectionDetailsResponse,
  Topic,
} from '../../Services/ApiResponses/SectionDetailsApiResponse';
import { useAppDispatch, useAppSelector } from '../../Redux/store';
import { setSectionsDetails } from '../../Redux/Slices/SectionDetailDataSlice';
import IMAGES from '../../Assets/Images';
import { TopicDetailsResponse } from '../../Services/ApiResponses/TopicDetailsApiResponse';
import {
  ScheduleDashBoardResponse,
  ScheduleItem,
} from '../../Services/ApiResponses/GetDashScheduleDashboardApiResponse';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';

interface Video {
  id: string;
  progress: { percentage: number; seconds: number };
  order: number;
  image?: string; // thumbnail of the first video
}

interface SelectedVideo {
  id: string;
  isSelectedId: boolean;
}
const lessons = [
  {
    id: '1',
    title: 'Overview of the MCAT',
    category: 'Schedule',
    image: IMAGES.SplahScreen,
    progress: 0,
    bookmarked: true,
    duration: '12:33',
  },
  {
    id: '2',
    title: 'The MCAT Chem/Phys Section',
    category: 'Lesson',
    image: IMAGES.SplahScreen,
    progress: 88,
    bookmarked: true,
    duration: '7:37',
  },
  {
    id: '3',
    title: "Chemical Formula and Avogadro's Number",
    category: 'Lesson',
    image: IMAGES.SplahScreen,
    progress: 0,
    bookmarked: false,
    duration: '8:48',
  },
  {
    id: '4',
    title: 'Composition by Percent Mass and Chemical Equations',
    category: 'Lesson',
    image: IMAGES.SplahScreen,
    progress: 70,
    bookmarked: false,
    duration: '6:30',
  },
];

const SubjectDetails: FC<SubjectDetailProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { subjectId } = route.params;
  const { sectionDetails } = useAppSelector(state => state.sectionDetailsData);
  const subjectData = sectionDetails?.subjects.find(
    item => item.id === subjectId,
  );
  const [expanded, setExpanded] = useState<string | null>(
    subjectData?.name ?? null,
  );
  const [topicDetails, setTopicDetails] = useState<TopicDetailsResponse | null>(
    null,
  );
  const [searchResults, setSearchResults] = useState<
    ScheduleDashBoardResponse | any
  >([]);
  const [nextVideoId, setNextVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [topicLoader, setTopicLoader] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Topic | null>(null);

  const handleFetchSectionDetails = async () => {
    try {
      setLoading(true);
      const response = await fetchData<SectionDetailsResponse>(
        `${ENDPOINTS.getSections}/${subjectId}?progress=1&topics=1`,
      );

      if (response.data) {
        dispatch(setSectionsDetails(response.data));
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchTopicDetails = async (id: string) => {
    setTopicDetails(null);
    try {
      setTopicLoader(true);
      const response = await fetchData<TopicDetailsResponse>(
        `${ENDPOINTS.getTopicDetails}${id}?progress=1`,
      );

      if (response.data) {
        setTopicDetails(response.data);
        // // Extract videos and determine next one
        const videos = response.data.videos || [];
        const next = getNextVideoToPlay(videos);

        if (next) {
          setNextVideoId(next.id);
        } else {
          setNextVideoId(null);
        }
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
      setTopicLoader(false);
    } finally {
      setTopicLoader(false);
    }
  };

  // Filtered subjects based on search query
  const filteredSubjects = sectionDetails?.subjects
    ?.map(subject => {
      // Find topics that belong to this subject
      const relatedTopics =
        sectionDetails?.topics?.filter(
          topic => topic.subject_id === subject.id,
        ) ?? [];

      // Filter topics by search query

      // If search query is empty, show all topics
      const visibleTopics = relatedTopics;

      return { ...subject, topics: visibleTopics };
    })
    // Filter out subjects that have no visible topics
    .filter(subject => subject.topics.length > 0);

  // Handle lesson click
  const handleLessonClick = (lesson: any) => {
    setSelectedLesson(lesson);
  };

  const formatLength = (length: number) => {
    const minutes = Math.floor(length);
    const seconds = Math.round((length - minutes) * 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const getNextVideoToPlay = (videos: Video[]): SelectedVideo | null => {
    if (!videos?.length) return null;

    const sorted = [...videos].sort((a, b) => a.order - b.order);

    const lastCompletedIdx = sorted
      .map((v, i) => (v.progress.percentage === 100 ? i : -1))
      .filter(i => i !== -1)
      .pop();

    if (
      lastCompletedIdx !== undefined &&
      lastCompletedIdx + 1 < sorted.length
    ) {
      return {
        id: sorted[lastCompletedIdx + 1].id,
        isSelectedId: true,
      };
    }

    // nothing completed → first video
    return {
      id: sorted[0].id,
      isSelectedId: false,
    };
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
            videosData: searchResults,
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
              {/* {item?.progress.percentage > 0
                ? `${item.progress.percentage}%`
                : item.length} */}
              {item?.length && `${item.length}`}
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
                ? COLORS.MCAT_Green
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
                    item?.progress.percentage === 100
                      ? '#008E2E'
                      : COLORS.MCAT_Dark_Blue,
                }}
              />
            )}
          </View>
        </View>

        {/* Bookmark / Cross icon */}
        <CustomIcon
          Icon={item.favorite ? ICONS.BookmarkSolid : ICONS.BookMarkGrey}
          height={20}
          width={20}
          style={{
            position: 'absolute',
            top: 5,
            right: horizontalScale(10),
          }}
          onPress={async () => {
            const videoId = item.id;
            const isCurrentlyFavorite = item.favorite;

            // Optimistic update - CORRECT
            setSearchResults((prev: any) => {
              if (!Array.isArray(prev)) return prev;
              return prev.map(v =>
                v.id === videoId ? { ...v, favorite: !isCurrentlyFavorite } : v,
              );
            });

            try {
              if (isCurrentlyFavorite) {
                await handleRemoveFavoriteVideo(videoId);
              } else {
                await handleAddFavoriteVideo(videoId);
              }
            } catch (error) {
              // Revert on error
              setSearchResults((prev: any) => {
                if (!Array.isArray(prev)) return prev;
                return prev.map(v =>
                  v.id === videoId
                    ? { ...v, favorite: isCurrentlyFavorite }
                    : v,
                );
              });

              Toast.show({
                type: 'error',
                text1: 'Failed to update bookmark',
              });
            }
          }}
        />
      </TouchableOpacity>
    );
  };

  const handleAddFavoriteVideo = async (id: string | string[]) => {
    try {
      const data = {
        ids: Array.isArray(id) ? id : [id],
      };
      const response = await postData(ENDPOINTS.favoritesVideo, data);
      if (response.status === 204) {
        Toast.show({
          type: 'success',
          text1: 'Video successfully added to bookmarks',
          text2: 'You can access it anytime from your bookmarks list.',
        });
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  const handleRemoveFavoriteVideo = async (id: string | string[]) => {
    try {
      const data = {
        ids: Array.isArray(id) ? id : [id],
      };
      const response = await deleteData(ENDPOINTS.favoritesVideo, data);
      if (response.status === 204) {
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
      if (selectedLesson && !selectedLesson.name.toLowerCase()) {
        setSelectedLesson(null);
      }
      if (subjectId) {
        handleFetchSectionDetails();
      }
    }, [subjectId]),
  );

  useFocusEffect(
    useCallback(() => {
      if (selectedLesson?.id) {
        handleFetchTopicDetails(selectedLesson.id); // Refetch to sync bookmark state
      }
    }, [selectedLesson?.id]),
  );

  useEffect(() => {
    if (sectionDetails?.subjects && sectionDetails.subjects.length === 1) {
      setExpanded(sectionDetails.subjects[0].name);
    }
  }, [sectionDetails]);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[
        styles.container,
        {
          backgroundColor: COLORS.MCAT_Dark_Blue,
        },
      ]}
    >
      <View style={styles.header}>
        <CustomIcon
          Icon={ICONS.WhiteLeftArrow}
          height={20}
          width={20}
          onPress={() => {
            if (selectedLesson) setSelectedLesson(null);
            else navigation.goBack();
          }}
        />
        <View style={{ gap: verticalScale(5), flexShrink: 1 }}>
          <CustomText
            fontFamily="RUBIK_bold"
            fontSize={22}
            color={COLORS.white}
          >
            {loading
              ? ''
              : `${
                  selectedLesson ? selectedLesson.name : sectionDetails?.name
                }`}
          </CustomText>

          <CustomText
            fontFamily="INTER_regular"
            fontSize={12}
            color={COLORS.white}
          >
            {loading
              ? ''
              : `${
                  selectedLesson
                    ? `${selectedLesson.percentage}% completed`
                    : `${sectionDetails?.amount_of_videos} lessons`
                }`}
          </CustomText>
        </View>
      </View>

      <View style={[styles.body, { paddingBottom: insets.bottom }]}>
        <View
          style={[
            styles.searchBox,
            {
              position: 'absolute',
              top: verticalScale(-15),
            },
          ]}
        >
          <CustomIcon Icon={ICONS.SearchIcon} height={15} width={15} />
          <TextInput
            placeholder="Search for a lesson"
            placeholderTextColor={'#0000008d'}
            style={styles.searchInput}
            value={''}
            onChangeText={text => {}}
            onFocus={() => {
              navigation.navigate('mainStack', {
                screen: 'search',
              });
            }}
          />

          <CustomIcon
            Icon={ICONS.CrossIcon}
            height={14}
            width={14}
            onPress={() => {}}
          />
        </View>

        {selectedLesson &&
          (!topicLoader ? (
            <FlatList
              data={
                topicDetails?.videos
                  ? [...topicDetails.videos].sort((a, b) => a.order - b.order)
                  : []
              }
              keyExtractor={item => item.id}
              renderItem={({ item, index }) => {
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
                        videosData: topicDetails?.videos || [],
                        topicId: selectedLesson.id,
                      });
                    }}
                  >
                    {/* Thumbnail */}
                    <View style={{ position: 'relative' }}>
                      <Image
                        // source={{ uri: selectedLesson.thumbnail }}
                        source={{
                          uri: item.image,
                        }}
                        style={{
                          height: 80,
                          width: 80,
                          borderRadius: 6,
                        }}
                      />
                      <View
                        style={{
                          backgroundColor:
                            item.progress.percentage === 100
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
                          fontFamily="INTER_bold"
                          fontSize={12}
                          color={COLORS.white}
                        >
                          {item.progress?.percentage > 0
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
                          item.progress.percentage === 100
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
                        {item?.progress.percentage > 0 && (
                          <View
                            style={{
                              height: '100%',
                              width: `${item.progress?.percentage}%`,
                              backgroundColor:
                                item.progress.percentage === 100
                                  ? '#008E2E'
                                  : COLORS.MCAT_Dark_Blue,
                            }}
                          />
                        )}
                      </View>
                    </View>

                    {/* Bookmark / Cross icon */}
                    <CustomIcon
                      Icon={
                        item.favorite ? ICONS.BookmarkSolid : ICONS.BookMarkGrey
                      }
                      height={20}
                      width={20}
                      style={{
                        position: 'absolute',
                        top: 5,
                        right: horizontalScale(10),
                      }}
                      onPress={async () => {
                        const videoId = item.id;
                        const isCurrentlyFavorite = item.favorite;

                        // Optimistic UI update
                        setTopicDetails(prev => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            videos: prev.videos.map(v =>
                              v.id === videoId
                                ? { ...v, favorite: !isCurrentlyFavorite }
                                : v,
                            ),
                          };
                        });

                        try {
                          if (isCurrentlyFavorite) {
                            await handleRemoveFavoriteVideo(videoId);
                          } else {
                            await handleAddFavoriteVideo(videoId);
                          }
                        } catch (error) {
                          // Revert on failure
                          setTopicDetails(prev => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              videos: prev.videos.map(v =>
                                v.id === videoId
                                  ? { ...v, favorite: isCurrentlyFavorite }
                                  : v,
                              ),
                            };
                          });
                          Toast.show({
                            type: 'error',
                            text1: 'Failed to update bookmark',
                          });
                        }
                      }}
                    />
                  </TouchableOpacity>
                );
              }}
            />
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
          ))}

        {!selectedLesson &&
          (!loading ? (
            <FlatList
              data={
                filteredSubjects
                  ? [...filteredSubjects].sort((a, b) => a.order - b.order)
                  : []
              }
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.subjectBlock}>
                  {/* Subject header */}
                  <TouchableOpacity
                    style={styles.subjectHeader}
                    onPress={() =>
                      setExpanded(expanded === item.name ? null : item.name)
                    }
                  >
                    <CustomText
                      fontFamily="RUBIK_bold"
                      fontSize={18}
                      color={COLORS.MCAT_Black}
                    >
                      {item.name}
                    </CustomText>
                    <CustomIcon
                      Icon={
                        expanded === item.name
                          ? ICONS.blackUpArrowBold
                          : ICONS.blackDownArrowBold
                      }
                      height={15}
                      width={15}
                    />
                  </TouchableOpacity>

                  {/* Lessons */}
                  {expanded === item.name && (
                    <View style={styles.lessonList}>
                      {item.topics.map(topic => {
                        let progressColor = COLORS.MCAT_Dark_Blue;
                        if (topic.percentage >= 70)
                          progressColor = COLORS.MCAT_Dark_Blue;
                        else if (topic.percentage >= 30)
                          progressColor = '#FFA500';
                        else progressColor = COLORS.grey;

                        return (
                          <TouchableOpacity
                            key={topic.id}
                            onPress={() => {
                              handleLessonClick(topic);
                              handleFetchTopicDetails(topic.id);
                            }}
                          >
                            <View style={styles.lessonItem}>
                              <CustomText
                                fontFamily="INTER_medium"
                                color={COLORS.MCAT_Black}
                                fontSize={14}
                                style={{ flex: 1 }}
                              >
                                {topic.name}
                              </CustomText>
                              <View
                                style={[
                                  styles.progressBadge,
                                  { backgroundColor: progressColor },
                                ]}
                              >
                                <CustomText
                                  fontFamily="INTER_bold"
                                  fontSize={12}
                                  color={COLORS.white}
                                >
                                  {topic.percentage
                                    ? `${topic.percentage}%`
                                    : '0%'}
                                </CustomText>
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}
              contentContainerStyle={{ paddingHorizontal: horizontalScale(15) }}
            />
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
          ))}
      </View>
    </SafeAreaView>
  );
};

export default SubjectDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(15),
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(30),
  },
  Activeheader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(5),
    paddingVertical: verticalScale(5),
    width: wp(86),
    marginLeft: horizontalScale(10),
    marginTop: verticalScale(10),
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: horizontalScale(40),
    paddingHorizontal: horizontalScale(15),
    position: 'relative',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: verticalScale(15),

    alignSelf: 'center',
    boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
    paddingVertical: verticalScale(5),
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
    marginLeft: 6,
    color: COLORS.black,
  },
  subjectBlock: {
    marginBottom: verticalScale(10),
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  lessonList: {
    marginTop: 5,
  },
  lessonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  progressBadge: {
    backgroundColor: COLORS.MCAT_Dark_Blue,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    minWidth: 40,
    alignItems: 'center',
  },
  iconClosed: { transform: [{ rotate: '270deg' }] },
  iconOpen: { transform: [{ rotate: '180deg' }] },
});
