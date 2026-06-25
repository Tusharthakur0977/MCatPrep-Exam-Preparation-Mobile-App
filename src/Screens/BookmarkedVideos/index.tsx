import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ICONS from '../../Assets/Icons';
import CustomIcon from '../../Components/CustomIcon';
import { CustomText } from '../../Components/CustomText';
import { BookmarkedVideosProps } from '../../Typings/route';
import { COLORS } from '../../Utilities/Colors';
import { horizontalScale, verticalScale } from '../../Utilities/Metrics';
import { deleteData, fetchData, postData } from '../../Services/ApiService';
import ENDPOINTS from '../../Services/ApiEndpoints';
import { useFocusEffect } from '@react-navigation/native';
import {
  FavoritesVideos,
  Root,
  Video,
} from '../../Services/ApiResponses/FavortiesVideoResponse';
import Toast from 'react-native-toast-message';

const BookmarkedVideos: FC<BookmarkedVideosProps> = ({ navigation }) => {
  // Use a state to track which group IDs are open
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [groupedData, setGroupedData] = useState<any[]>([]);

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev =>
      prev.includes(id)
        ? prev.filter(groupId => groupId !== id)
        : [...prev, id],
    );
  };

  const transformFavoritesToGroups = (data: FavoritesVideos[]) => {
    return data.map(section => ({
      id: section.id,
      name: section.name,
      order: section.order,
      section_id: section.section_id,
      updated_at: section.updated_at,
      videos: section.videos ?? [], // <-- ALWAYS return an array
    }));
  };

  const bookmarkCount = groupedData.reduce(
    (sum, g) => sum + (g?.videos?.length ?? 0),
    0,
  );

  const handleGetScheduleData = async () => {
    try {
      const response = await fetchData<FavoritesVideos[]>(
        ENDPOINTS.getFavoritesVidoes,
      );
      if (response.data) {
        const transformedGroups = transformFavoritesToGroups(response.data);
        setGroupedData(transformedGroups);

        // Open first group by default
        if (transformedGroups.length > 0) {
          setExpandedGroups([transformedGroups[0].id]);
        }
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  // Helper component for rendering a single lesson item
  const LessonItem: FC<{
    item: Video;
    index: number;
    lessonVideos: Video[];
  }> = ({ item, index, lessonVideos }) => {
    return (
      <TouchableOpacity
        style={styles.lessonItemContainer}
        onPress={() => {
          navigation.navigate('lessonDetail', {
            lessonId: item.id,
            videoId: item.id,
            videosData: lessonVideos ?? [],
            topicId: item.topic_id,
          });
        }}
      >
        {/* Thumbnail */}
        <View style={{ position: 'relative' }}>
          <Image
            source={{
              uri: item.image,
            }}
            style={{
              height: 90,
              width: 90,
              borderRadius: 6,
            }}
          />
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  item.progress.percentage === 100
                    ? COLORS.MCAT_Green
                    : COLORS.MCAT_Dark_Blue,
              },
            ]}
          >
            <CustomText
              color={COLORS.MCAT_White}
              fontSize={12}
              fontFamily="RUBIK_semiBold"
            >
              {item?.progress.percentage > 0
                ? `${item.progress.percentage}%`
                : item.length}
            </CustomText>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <CustomText
            color={COLORS.MCAT_Dark_Blue}
            fontFamily="RUBIK_medium"
            fontSize={13}
          >
            Lesson {index + 1}
          </CustomText>
          <CustomText fontFamily="ROBOTO_regular" fontSize={15}>
            {item.name.slice(0, 25)}
          </CustomText>

          {/* Progress bar */}
          <View style={styles.progressBarBackground}>
            {item?.progress.percentage > 0 && (
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${item.progress.percentage}%`,
                    backgroundColor:
                      item.progress.percentage === 100
                        ? COLORS.MCAT_Green
                        : COLORS.MCAT_Dark_Blue,
                  },
                ]}
              />
            )}
          </View>
        </View>

        {/* Bookmark / Cross icon */}
        <CustomIcon
          Icon={ICONS.BookmarkSolid}
          height={25}
          width={25}
          style={styles.bookmarkIcon}
          onPress={() => {
            handleRemoveFavoriteVideo(item.id);
          }}
        />
      </TouchableOpacity>
    );
  };

  // Render function for each Accordion Group
  const renderGroup = ({ item: group }: { item: FavoritesVideos }) => {
    const isExpanded = expandedGroups.includes(group.id);
    const groupLessonCount = group?.videos?.length ?? 0;

    if (groupLessonCount === 0) return null;
    return (
      <View style={styles.groupContainer}>
        {/* Accordion Header (Section Header) */}
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => toggleGroup(group.id)}
          activeOpacity={0.8}
        >
          <CustomText
            fontFamily="RUBIK_bold"
            fontSize={18}
            color={COLORS.black}
          >
            {group.name}
          </CustomText>

          <View style={styles.lessonCountContainer}>
            <CustomText
              fontFamily="ROBOTO_regular"
              fontSize={14}
              color={COLORS.MCAT_Dark_Blue}
            >
              {groupLessonCount} {groupLessonCount === 1 ? 'lesson' : 'lessons'}
            </CustomText>
            <CustomIcon
              Icon={ICONS.BlueDropdown}
              height={20}
              width={20}
              style={{
                transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
              }}
            />
          </View>
        </TouchableOpacity>

        {/* Accordion Content (Lessons List) */}
        {isExpanded && (
          <View style={styles.accordionContent}>
            <FlatList
              data={[...group.videos].sort((a, b) => a.order - b.order)}
              keyExtractor={item => item.id}
              renderItem={({ item, index }) => (
                <LessonItem
                  item={item}
                  index={index}
                  lessonVideos={group.videos}
                />
              )}
              scrollEnabled={false} // Disable inner FlatList scrolling
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        )}
      </View>
    );
  };

  const handleRemoveFavoriteVideo = async (id: string | string[]) => {
    try {
      const data = {
        ids: Array.isArray(id) ? id : [id],
      };

      const response = await deleteData(ENDPOINTS.removeFavoritesVideo, data);
      if (response.status === 204) {
        Toast.show({
          type: 'success',
          text1: 'Video successfully removed from bookmarks',
          text2: 'You can add it again anytime from your video library.',
        });
        handleGetScheduleData();
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  useFocusEffect(
    useCallback(() => {
      handleGetScheduleData();
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <CustomIcon
          Icon={ICONS.WhiteLeftArrow}
          height={20}
          width={20}
          onPress={() => {
            navigation.goBack();
          }}
        />
        <View style={{ gap: verticalScale(5) }}>
          <CustomText
            fontFamily="RUBIK_bold"
            fontSize={22}
            color={COLORS.white}
          >
            Bookmarked Videos
          </CustomText>
          <CustomText
            fontFamily="INTER_regular"
            fontSize={12}
            color={COLORS.white}
          >
            {bookmarkCount} {bookmarkCount === 1 ? 'lesson' : 'lessons'}
          </CustomText>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {bookmarkCount > 0 ? (
          <FlatList
            data={
              groupedData
                ? [...groupedData].sort((a, b) => a.order - b.order)
                : []
            }
            keyExtractor={item => item.id}
            renderItem={renderGroup}
            contentContainerStyle={styles.mainListContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <CustomIcon Icon={ICONS.BookmarksIcon} height={30} width={30} />
            <CustomText
              fontFamily="INTER_regular"
              fontSize={14}
              color={COLORS.black}
            >
              No Bookmarks yet
            </CustomText>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default BookmarkedVideos;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.MCAT_Dark_Blue,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(15),
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(30),
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  // New style for the main FlatList content
  mainListContent: {
    paddingBottom: verticalScale(70),
    gap: verticalScale(20), // Gap between accordion groups
  },
  // New styles for accordion group
  groupContainer: {
    paddingHorizontal: horizontalScale(10),
    borderWidth: 1,
    borderColor: COLORS.LightGrey,
    borderRadius: 8,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(15),
  },
  lessonCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(5),
  },
  accordionContent: {
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(5),
    borderTopWidth: 1,
    borderTopColor: COLORS.LightGrey,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.LightGrey,
    marginVertical: verticalScale(5),
  },
  // Existing styles for lesson item, slightly adjusted
  lessonItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(10),
    gap: horizontalScale(20),
  },
  badge: {
    borderRadius: 3,
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    position: 'absolute',
    top: -verticalScale(4),
    right: -horizontalScale(10),
  },
  infoContainer: {
    gap: verticalScale(4),
    flex: 1,
    paddingRight: horizontalScale(10),
    position: 'relative',
  },
  progressBarBackground: {
    width: '100%',
    backgroundColor: COLORS.LightGrey,
    height: 4,
    borderRadius: 5,
    marginTop: verticalScale(5),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  bookmarkIcon: {
    position: 'absolute',
    top: verticalScale(10),
    right: horizontalScale(10),
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: verticalScale(10),
  },
});
