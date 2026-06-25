import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import RNFS from 'react-native-fs';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useVideoPlayer, VideoView } from 'react-native-video';
import ICONS from '../../Assets/Icons';
import CustomIcon from '../../Components/CustomIcon';
import { CustomText } from '../../Components/CustomText';
import PodcastModal from '../../Components/Modal/podcastModal';
import PrimaryButton from '../../Components/PrimaryButton';
import { SubjectData } from '../../Seeds/LessonData';
import ENDPOINTS from '../../Services/ApiEndpoints';
import {
  deleteData,
  fetchData,
  postData,
  putData,
} from '../../Services/ApiService';
import { LessonDetailProps } from '../../Typings/route';
import { COLORS } from '../../Utilities/Colors';
import {
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from '../../Utilities/Metrics';
import PremiumGuard from '../../Components/PremiumGuard';

export const findLessonById = (lessonId: string) => {
  for (const subjectGroup of SubjectData) {
    for (const sub of subjectGroup.subjects) {
      const lesson = sub.lessons.find(l => l.id === lessonId);
      if (lesson) return lesson;
    }
  }
  return null;
};

const LessonDetail: FC<LessonDetailProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const {
    lessonId,
    videoId: initialVideoId,
    videosData,
    topicId,
  } = route.params;
  const lessonDetails = findLessonById(lessonId);
  const [isPodcastModalVisible, setIsPodcastModalVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lectureNotesData, setLectureNotesData] = useState<any | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [lastSentSecond, setLastSentSecond] = useState(0);
  const [currentVideoId, setCurrentVideoId] = useState(initialVideoId);
  const [topicName, setTopicName] = useState<any | string>('');
  const [selectedQuality, setSelectedQuality] = useState<
    '720p' | '540p' | '360p'
  >('720p');
  const [isQualityModalVisible, setIsQualityModalVisible] = useState(false);
  const [vttUri, setVttUri] = useState<string | null>(null);

  // Sort once and memoize
  const sortedVideos = useMemo(() => {
    return [...videosData].sort((a, b) => a.order - b.order);
  }, [videosData]);

  const [videosList, setVideosList] = useState(sortedVideos);

  // Current video from local videosData
  const currentVideo = videosList.find(v => v.id === currentVideoId);

  // Find index for prev/next
  const currentIndex = videosList.findIndex(v => v.id === currentVideoId);
  const lessonNumber = currentIndex + 1;

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < videosList.length - 1;

  const handleFetchTopicDetails = async () => {
    try {
      const response = await fetchData<any>(
        `${ENDPOINTS.getTopicDetails}${topicId}?progress=1`,
      );
      if (response.data) {
        setTopicName(response.data.name);
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  // Get video URL based on selected quality
  const videoUrl = useMemo(() => {
    if (!currentVideo) return null;

    switch (selectedQuality) {
      case '720p':
        return (
          currentVideo.resolution_link720 ||
          currentVideo.resolution_link540 ||
          currentVideo.resolution_link360 ||
          null
        );
      case '540p':
        return (
          currentVideo.resolution_link540 ||
          currentVideo.resolution_link720 ||
          currentVideo.resolution_link360 ||
          null
        );
      case '360p':
        return (
          currentVideo.resolution_link360 ||
          currentVideo.resolution_link540 ||
          currentVideo.resolution_link720 ||
          null
        );
      default:
        return null;
    }
  }, [currentVideo, selectedQuality]);

  const handleFetchLectureNotes = async (videoId: any) => {
    try {
      const response = await fetchData(
        `${ENDPOINTS.getTopicVideosDetail}/${videoId}/lecture-note`,
      );
      if (response.data) {
        setLectureNotesData(response.data);
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  // Keep progress API
  const handleVideoProgress = async (
    seconds: number,
    forcePercentage?: number,
  ) => {
    try {
      // Skip API update if video is already completed (100%)
      if (currentVideo?.progress?.percentage === 100 && seconds > 0) {
        return;
      }

      await putData(`${ENDPOINTS.videoProgress}/${currentVideoId}`, {
        seconds,
      });
      setLastSentSecond(seconds);
      const duration = videoDuration || currentVideo?.seconds || 1;
      const percentage =
        forcePercentage ??
        Math.min(100, Math.round((seconds / duration) * 100));
      setVideosList(prev =>
        prev.map(v =>
          v.id === currentVideoId
            ? {
                ...v,
                progress: {
                  ...v.progress,
                  seconds,
                  percentage,
                },
              }
            : v,
        ),
      );
    } catch (error) {
      console.log('Progress error', error);
    }
  };

  const toggleFavorite = async () => {
    if (!currentVideo) return;

    const isAdding = !currentVideo.favorite;

    try {
      if (isAdding) {
        // ADD to favorites
        const response = await postData(ENDPOINTS.favoritesVideo, {
          ids: [currentVideo.id],
        });

        if (response.status === 204 || response.status === 200) {
          setVideosList(prev =>
            prev.map(v =>
              v.id === currentVideo.id ? { ...v, favorite: true } : v,
            ),
          );
          Toast.show({
            type: 'success',
            text1: 'Video successfully added to bookmarks',
            text2: 'You can access it anytime from your bookmarks list.',
          });
        }
      } else {
        // REMOVE from favorites
        const response = await deleteData(ENDPOINTS.removeFavoritesVideo, {
          ids: [currentVideo.id],
        });

        if (response.status === 204 || response.status === 200) {
          setVideosList(prev =>
            prev.map(v =>
              v.id === currentVideo.id ? { ...v, favorite: false } : v,
            ),
          );
          Toast.show({
            type: 'success',
            text1: 'Video successfully removed from bookmarks',
            text2: 'You can add it again anytime from your video library.',
          });
        }
      }
    } catch (error) {
      console.log('Favorite toggle error:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to update bookmark',
      });
    }
  };

  useEffect(() => {
    handleFetchTopicDetails();
  }, [currentVideo?.topic_id, topicId]);

  // Track which video's lecture notes have been fetched to avoid refetching
  const lastFetchedVideoRef = useRef<string | null>(null);

  useEffect(() => {
    if (currentVideoId && lastFetchedVideoRef.current !== currentVideoId) {
      handleFetchLectureNotes(currentVideoId);
      lastFetchedVideoRef.current = currentVideoId;
    }
  }, [currentVideoId]);

  useEffect(() => {
    setVideosList(sortedVideos);
  }, [sortedVideos]);

  // When video starts
  const startVideo = () => {
    if (videoUrl) {
      // If the video was already completed, reset progress locally and on server
      if (currentVideo?.progress?.percentage === 100) {
        handleVideoProgress(0); // This resets both local state and API to 0

        // Ensure the player starts at the beginning
        if (player) {
          player.currentTime = 0;
        }
      }
      setIsPlaying(true);
    }
  };

  const goToPrevious = () => {
    if (hasPrevious) {
      changeVideo(sortedVideos[currentIndex - 1].id);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      changeVideo(sortedVideos[currentIndex + 1].id);
    }
  };

  // Get available quality options for current video
  const getAvailableQualities = () => {
    const qualities: Array<{ label: string; value: '720p' | '540p' | '360p' }> =
      [];

    if (currentVideo?.resolution_link720) {
      qualities.push({ label: '720p (High)', value: '720p' });
    }
    if (currentVideo?.resolution_link540) {
      qualities.push({ label: '540p (Medium)', value: '540p' });
    }
    if (currentVideo?.resolution_link360) {
      qualities.push({ label: '360p (Low)', value: '360p' });
    }

    return qualities;
  };

  const availableQualities = getAvailableQualities();

  const convertSrtToVttString = (srtText: string) => {
    return 'WEBVTT\n\n' + srtText.replace(/(\d+:\d+:\d+),(\d+)/g, '$1.$2');
  };

  const fetchAndSaveVtt = async (srtUrl: string) => {
    try {
      const res = await fetch(srtUrl);
      const srtText = await res.text();
      const vttText = convertSrtToVttString(srtText);

      const path = `${RNFS.CachesDirectoryPath}/subtitles.vtt`;
      await RNFS.writeFile(path, vttText, 'utf8');

      return 'file://' + path; // local file URI
    } catch (e) {
      console.error('Failed to convert SRT to VTT', e);
      return null;
    }
  };

  useEffect(() => {
    if (currentVideo?.srt_url) {
      const srtFullUrl = `https://assets.medschoolcoach.com/srt/${currentVideo.srt_url}`;
      fetchAndSaveVtt(srtFullUrl).then(setVttUri);
    } else {
      setVttUri(null);
    }
  }, [currentVideo?.srt_url]);

  const player = useVideoPlayer(
    videoUrl
      ? {
          uri: videoUrl,
          externalSubtitles: vttUri
            ? [
                {
                  uri: vttUri,
                  label: 'English',
                  type: 'vtt',
                  language: 'en',
                },
              ]
            : [],
        }
      : '',
  );

  useEffect(() => {
    if (!player || !videoUrl) return;

    let didResume = false;
    let seekTimeout: NodeJS.Timeout | null = null;

    // Check if it's already finished
    const isFinished = currentVideo?.progress?.percentage === 100;
    const resumeTime = isFinished ? 0 : currentVideo?.progress?.seconds || 0;

    const onStatusChange = (status: any) => {
      if (status === 'readyToPlay' && !didResume) {
        didResume = true;

        // Only call play() if the user has actually pressed play
        if (isPlaying) {
          player.play();
        }

        // If it was 100%, we reset the UI and API to 0% immediately
        if (isFinished && isPlaying) {
          handleVideoProgress(0);
        }

        // Seek to the appropriate time with null check
        seekTimeout = setTimeout(() => {
          // Check if player still exists before setting currentTime
          if (player && player.currentTime !== undefined) {
            player.currentTime = resumeTime;
          }
        }, 300);
      }
    };

    player.addEventListener('onStatusChange', onStatusChange);

    return () => {
      player.removeEventListener('onStatusChange', onStatusChange);
      // Clear timeout on cleanup to prevent setting currentTime after disposal
      if (seekTimeout) {
        clearTimeout(seekTimeout);
      }
    };
  }, [player, videoUrl, currentVideoId, selectedQuality, isPlaying]);

  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      // Skip progress updates if video is already 100% complete
      if (currentVideo?.progress?.percentage === 100) {
        return;
      }

      const current = Math.floor(player.currentTime);
      if (current % 5 === 0 && current !== lastSentSecond && current > 0) {
        handleVideoProgress(current);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [player, currentVideo?.progress?.percentage, lastSentSecond]);

  useEffect(() => {
    if (!player) return;

    const handlePlayToEnd = async () => {
      // Use actual duration if available, else use what's in the data
      const finalSeconds = videoDuration || currentVideo?.seconds || 0;

      // Force the 100% update to the API and Local State
      await handleVideoProgress(finalSeconds, 100);

      if (hasNext) {
        // Small delay before moving to next video to ensure state is saved
        setTimeout(() => {
          goToNext();
        }, 500);
      }
    };

    player.addEventListener('onEnd', handlePlayToEnd);

    return () => {
      player.removeEventListener('onEnd', handlePlayToEnd);
    };
  }, [player, videoDuration, hasNext, currentVideoId, currentVideo?.seconds]);

  // Control playback based on isPlaying state
  useEffect(() => {
    if (!player) return;

    if (isPlaying) {
      player.play();
    } else {
      player.pause();
    }
  }, [player, isPlaying]);

  const playerKey = `${currentVideoId}-${selectedQuality}`;

  const changeVideo = (id: string) => {
    setIsPlaying(false); // This will keep the next video paused on the thumbnail
    setCurrentVideoId(id);
  };

  if (!currentVideo) {
    return null; // or loading
  }

  return (
    <PremiumGuard>
      <SafeAreaView
        style={styles.container}
        edges={['bottom', 'left', 'right']}
      >
        {/* Header */}
        <View style={styles.header}></View>

        {/* Body background */}
        <View style={styles.body} />
        <View style={styles.scrollContainer}>
          <View
            style={[
              styles.headerRow,
              {
                marginBottom:
                  Platform.OS === 'android'
                    ? verticalScale(15)
                    : verticalScale(10),
              },
            ]}
          >
            <CustomIcon
              Icon={ICONS.WhiteLeftArrow}
              height={20}
              width={20}
              onPress={() => navigation.goBack()}
            />
            <CustomText
              fontFamily="RUBIK_bold"
              fontSize={20}
              color={COLORS.white}
              style={{ flexShrink: 1, flexWrap: 'wrap' }}
            >
              {topicName}
            </CustomText>
          </View>
          <ScrollView
            contentContainerStyle={[
              styles.scrollView,
              {
                marginTop:
                  Platform.OS === 'android'
                    ? verticalScale(5) + insets.top
                    : verticalScale(10),
                paddingBottom:
                  Platform.OS === 'android'
                    ? verticalScale(90) + insets.bottom
                    : verticalScale(20) + insets.bottom,
              },
            ]}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            {/* Lesson Card */}
            <View style={styles.lessonCard}>
              {isPlaying && videoUrl ? (
                <VideoView
                  key={playerKey}
                  player={player}
                  style={styles.inlineVideoPlayer}
                  controls={true}
                />
              ) : (
                <TouchableOpacity
                  style={styles.imageContainer}
                  onPress={startVideo}
                >
                  <Image
                    source={{ uri: currentVideo.image }}
                    style={styles.lessonImage}
                  />
                  <View style={styles.playIconOverlay}>
                    <CustomIcon
                      Icon={ICONS.fadePlayIcon}
                      height={50}
                      width={50}
                    />
                  </View>
                </TouchableOpacity>
              )}
              <View style={styles.lessonCardContent}>
                <View style={styles.lessonCardHeader}>
                  <View style={styles.lessonInfoRow}>
                    <CustomText
                      style={styles.lessonLengthBadge}
                      color={COLORS.MCAT_White}
                      fontSize={12}
                      fontFamily="RUBIK_regular"
                    >
                      {currentVideo?.length}
                    </CustomText>
                    <CustomText
                      style={{ flexShrink: 1, flexWrap: 'wrap' }}
                      fontSize={14}
                      color={COLORS.MCAT_Dark_Blue}
                    >
                      Lesson {lessonNumber}{' '}
                    </CustomText>
                  </View>

                  <View style={styles.lessonProgressRow}>
                    <CustomText
                      color={COLORS.MCAT_Dark_Blue}
                      fontSize={14}
                      fontFamily="RUBIK_regular"
                    >
                      {currentVideo?.progress.percentage}%
                    </CustomText>
                    {availableQualities.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setIsQualityModalVisible(true)}
                        style={styles.qualityButton}
                      >
                        <CustomText
                          color={COLORS.MCAT_White}
                          fontSize={12}
                          fontFamily="RUBIK_medium"
                        >
                          {selectedQuality}
                        </CustomText>
                      </TouchableOpacity>
                    )}
                    <CustomIcon
                      Icon={
                        currentVideo?.favorite
                          ? ICONS.BookmarkSolid
                          : ICONS.BookMarkGrey
                      }
                      height={currentVideo.favorite ? 18 : 17}
                      width={currentVideo.favorite ? 18 : 17}
                      onPress={toggleFavorite}
                    />
                  </View>
                </View>
                <CustomText
                  fontFamily="INTER_extraBold"
                  color={COLORS.MCAT_Black}
                  fontSize={14}
                >
                  {currentVideo?.name}{' '}
                </CustomText>
              </View>
            </View>
            {/* Lesson Next/Prev Buttons */}
            <View
              style={[
                styles.navigationRow,
                {
                  justifyContent: hasPrevious ? 'space-between' : 'flex-end',
                },
              ]}
            >
              {hasPrevious && (
                <TouchableOpacity
                  style={{
                    backgroundColor: COLORS.MCAT_Dark_Blue,
                    paddingVertical: verticalScale(24),
                    justifyContent: 'center',
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 100,
                    gap: horizontalScale(5),
                    minWidth: wp(41),
                  }}
                  onPress={goToPrevious}
                >
                  <CustomIcon Icon={ICONS.LeftIcon} height={20} width={20} />
                  <CustomText
                    fontSize={12}
                    color={COLORS.MCAT_White}
                    fontFamily="INTER_regular"
                  >
                    Previous Lesson
                  </CustomText>
                </TouchableOpacity>
              )}

              {hasNext && (
                <TouchableOpacity
                  style={{
                    backgroundColor: COLORS.MCAT_Dark_Blue,
                    paddingVertical: verticalScale(24),
                    justifyContent: 'center',
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 100,
                    gap: horizontalScale(5),
                    minWidth: wp(41),
                  }}
                  onPress={goToNext}
                >
                  <CustomText
                    fontSize={12}
                    color={COLORS.MCAT_White}
                    fontFamily="INTER_regular"
                  >
                    Next Lesson
                  </CustomText>
                  <CustomIcon Icon={ICONS.RightIcon} height={20} width={20} />
                </TouchableOpacity>
              )}
            </View>
            {/* Lesson Details  */}
            <View style={styles.lessonDetailsRow}>
              {lectureNotesData && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('lessonNotes', {
                      lessonId: lessonDetails?.id!,
                      note_url: '',
                      notes: lectureNotesData,
                    })
                  }
                  style={styles.lessonDetailYellow}
                >
                  <CustomIcon
                    Icon={ICONS.WhiteDocIcon}
                    height={20}
                    width={20}
                    style={styles.detailIcon}
                  />
                  <CustomText
                    fontFamily="RUBIK_medium"
                    color={COLORS.MCAT_White}
                    fontSize={14}
                  >
                    Lecture Notes
                  </CustomText>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.lessonDetailBlue}
                onPress={() =>
                  navigation.navigate('lessonWhiteBoard', {
                    lessonId: lessonDetails?.id!,
                    note_url: currentVideo?.whiteboard_notes_url || null,
                    notes: currentVideo?.whiteboard_notes,
                  })
                }
              >
                <CustomIcon
                  Icon={ICONS.WhiteEditPencilIcon}
                  height={20}
                  width={20}
                  style={styles.detailIcon}
                />
                <CustomText
                  fontFamily="RUBIK_medium"
                  color={COLORS.MCAT_White}
                  fontSize={14}
                >
                  Whiteboard Notes
                </CustomText>
              </TouchableOpacity>
            </View>
            <View style={styles.lessonDetailsRow}>
              {currentVideo?.flashcard_count &&
                currentVideo.flashcard_count > 0 && (
                  <TouchableOpacity
                    style={styles.lessonDetailBlue}
                    onPress={() => {
                      navigation.navigate('mainStack', {
                        screen: 'questionList',
                        params: {
                          type: 'flashCard',
                          subjectId: currentVideo?.subject_id,
                          subject: currentVideo?.name || 'Flashcards',
                        },
                      });
                    }}
                  >
                    <CustomIcon
                      Icon={ICONS.FlashCardIcon}
                      height={20}
                      width={20}
                      style={styles.detailIcon}
                    />
                    <CustomText
                      fontFamily="RUBIK_medium"
                      color={COLORS.MCAT_White}
                      fontSize={14}
                    >
                      Flashcards
                    </CustomText>
                  </TouchableOpacity>
                )}

              {/* Questions Card */}
              {currentVideo?.question_count &&
                currentVideo.question_count > 0 && (
                  <TouchableOpacity
                    style={styles.lessonDetailCrimson}
                    onPress={() => {
                      navigation.navigate('mainStack', {
                        screen: 'questionList',
                        params: {
                          type: 'questions',
                          subjectId: currentVideo.subject_id,
                          subject: currentVideo?.name || 'Questions',
                        },
                      });
                    }}
                  >
                    <CustomIcon
                      Icon={ICONS.QuestionBankIcon}
                      height={20}
                      width={20}
                      style={styles.detailIcon}
                    />

                    <CustomText
                      fontFamily="RUBIK_medium"
                      color={COLORS.MCAT_White}
                      fontSize={14}
                    >
                      Questions
                    </CustomText>
                  </TouchableOpacity>
                )}
            </View>
            {/* Other Options */}
            <View style={styles.otherOptionsContainer}>
              <CustomText
                fontFamily="RUBIK_bold"
                color={COLORS.MCAT_Black}
                fontSize={14}
              >
                Other Options
              </CustomText>

              <PrimaryButton
                title="Get tutoring on this topic"
                onPress={() => navigation.navigate('tutoerFeatures')}
                bgColor={[COLORS.MCAT_Black, COLORS.MCAT_Black]}
                isFullWidth={false}
                rightIcon={ICONS.RightIcon}
                style={styles.optionButton}
                innerViewStyle={styles.optionInner}
                textSize={16}
                iconSize={30}
                gradientStyle={{ borderRadius: verticalScale(10) }}
              />
              <PrimaryButton
                title="Podcast"
                onPress={() => {
                  setIsPodcastModalVisible(true);
                }}
                bgColor={[COLORS.MCAT_LightCrimson, COLORS.MCAT_LightCrimson]}
                isFullWidth={false}
                rightIcon={ICONS.MusicIcon}
                style={styles.optionButton}
                innerViewStyle={styles.optionInner}
                textSize={16}
                iconSize={30}
                gradientStyle={{ borderRadius: verticalScale(10) }}
              />
            </View>
          </ScrollView>
        </View>

        {isQualityModalVisible && (
          <TouchableOpacity
            style={styles.qualityModal}
            activeOpacity={1}
            onPress={() => setIsQualityModalVisible(false)}
          >
            <TouchableOpacity
              style={styles.qualityModalContent}
              activeOpacity={1}
              onPress={e => e.stopPropagation()}
            >
              <View style={styles.qualityModalHeader}>
                <CustomText
                  fontFamily="RUBIK_bold"
                  fontSize={16}
                  color={COLORS.MCAT_Black}
                >
                  Select Quality
                </CustomText>
                <TouchableOpacity
                  onPress={() => {
                    setIsQualityModalVisible(false);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <CustomText
                    fontSize={20}
                    color={COLORS.MCAT_Dark_Blue}
                    fontFamily="RUBIK_bold"
                  >
                    ✕
                  </CustomText>
                </TouchableOpacity>
              </View>

              {availableQualities.map(quality => (
                <TouchableOpacity
                  key={quality.value}
                  style={[
                    styles.qualityOption,
                    selectedQuality === quality.value &&
                      styles.qualityOptionSelected,
                  ]}
                  // onPress={() => {
                  //   setSelectedQuality(quality.value);
                  //   setIsQualityModalVisible(false);
                  //   // Restart video playback with new quality
                  //   if (videoRef.current) {
                  //     const currentTime =
                  //       videoRef.current.getCurrentTime?.() || 0;
                  //     videoRef.current.seek(Math.max(0, currentTime - 1));
                  //   }
                  // }}
                  onPress={() => {
                    setSelectedQuality(quality.value);
                    setIsQualityModalVisible(false);
                    setIsPlaying(true); // restart playback
                  }}
                >
                  <CustomText
                    fontSize={14}
                    color={
                      selectedQuality === quality.value
                        ? COLORS.MCAT_White
                        : COLORS.MCAT_Black
                    }
                    fontFamily="RUBIK_medium"
                  >
                    {quality.label}
                  </CustomText>
                  {selectedQuality === quality.value && (
                    <CustomText
                      fontSize={16}
                      color={COLORS.MCAT_White}
                      fontFamily="RUBIK_bold"
                    >
                      ✓
                    </CustomText>
                  )}
                </TouchableOpacity>
              ))}
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        <PodcastModal
          isVisible={isPodcastModalVisible}
          onClose={() => setIsPodcastModalVisible(false)}
          platformsLinks={[
            'https://podcasts.apple.com/us/podcast/prospectivedoctors-mcat-basics/id1448973714',
            'https://play.google.com/music/listen?u=0#/ps/Itwzpxwqbnvje6cokuogitsfwda',
            'https://open.spotify.com/show/01k1ICEBLfnu7EFZp5OqoR',
            'https://www.stitcher.com/podcast/sam-smith/sams-mcat-basics',
          ]}
        />
      </SafeAreaView>
    </PremiumGuard>
  );
};

export default LessonDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.MCAT_White,
  },
  header: {
    alignItems: 'flex-start',
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(20),
    backgroundColor: COLORS.MCAT_Dark_Blue,
    height: hp(25),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(15),
    paddingHorizontal: horizontalScale(15),
    // width: wp(90),
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.MCAT_White,
  },
  scrollView: {
    gap: verticalScale(20),
    // height: hp(100),
    paddingHorizontal: horizontalScale(22),
  },
  scrollContainer: {
    position: 'relative',
    alignSelf: 'center',
    top: -160,
    // paddingHorizontal: horizontalScale(22),
  },
  lessonCard: {
    width: wp(85),
    alignSelf: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    backgroundColor: COLORS.MCAT_White,
  },

  lessonImage: {
    height: wp(40),
    width: wp(85),
    resizeMode: 'cover',
    borderRadius: 10,
  },
  lessonCardContent: {
    paddingVertical: verticalScale(20),
    gap: verticalScale(10),
    backgroundColor: COLORS.MCAT_White,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: horizontalScale(15),
  },
  lessonCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lessonInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
  },
  lessonLengthBadge: {
    paddingHorizontal: verticalScale(7),
    paddingVertical: verticalScale(3),
    backgroundColor: COLORS.MCAT_Dark_Blue,
    borderRadius: 4,
  },
  lessonProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
  },
  navigationRow: {
    flexDirection: 'row',
    // backgroundColor: 'red',
    // gap: horizontalScale(5),
    alignItems: 'center',
    // maxWidth: wp(90),
  },
  navBtnGradient: {
    borderRadius: 100,
    flex: 1,
    paddingHorizontal: horizontalScale(20),
  },
  navBtn: {
    paddingVertical: verticalScale(20),
  },
  lessonDetailsRow: {
    flexDirection: 'row',
    gap: horizontalScale(10),
  },
  lessonDetailYellow: {
    flex: 1,
    gap: verticalScale(30),
    backgroundColor: COLORS.MCAT_LightYellow,
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(8),
    borderRadius: 10,
    minWidth: '48%',
    maxWidth: '48%', // Match yellow card
    minHeight: 60,
  },
  lessonDetailBlue: {
    flex: 1,
    gap: verticalScale(30),
    backgroundColor: COLORS.MCAT_SkyBlue,
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(8),
    borderRadius: 10,
    minWidth: '48%',
    maxWidth: '48%', // Match yellow card
    minHeight: 60,
  },
  detailIcon: {
    alignSelf: 'flex-end',
  },
  otherOptionsContainer: {
    gap: verticalScale(10),
  },
  optionButton: {
    paddingVertical: verticalScale(20),
    width: '100%',
  },
  optionInner: {
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(20),
  },
  imageContainer: {
    height: wp(40),
    width: wp(85),
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // NEW STYLE: Style for the inline Video Player
  inlineVideoPlayer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 10,
    backgroundColor: COLORS.MCAT_Black,
  },
  // NEW STYLE: Absolute positioning for the play icon
  playIconOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    // Adds a transparent dark overlay over the image to make the play icon stand out
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 10,
  },
  qualityButton: {
    backgroundColor: COLORS.MCAT_Dark_Blue,
    paddingHorizontal: horizontalScale(7),
    paddingVertical: verticalScale(4),
    borderRadius: 6,
  },
  qualityModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  qualityModalContent: {
    backgroundColor: COLORS.MCAT_White,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(20),
    paddingBottom: verticalScale(30),
    gap: verticalScale(10),
  },
  qualityModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  qualityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(15),
    borderRadius: 10,
    backgroundColor: COLORS.MCAT_White,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  qualityOptionSelected: {
    backgroundColor: COLORS.MCAT_Dark_Blue,
    borderColor: COLORS.MCAT_Dark_Blue,
  },
  lessonDetailCrimson: {
    flex: 1,
    gap: verticalScale(30),
    backgroundColor: COLORS.MCAT_LightCrimson,
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(8),
    borderRadius: 10,
    minWidth: '48%',
    maxWidth: '48%', // Match yellow card
    minHeight: 60,
  },
});
