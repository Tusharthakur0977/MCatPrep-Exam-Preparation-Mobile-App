import {
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Toast from 'react-native-toast-message';
import { SearchProps } from '../../Typings/route';
import { FC, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomIcon from '../../Components/CustomIcon';
import ICONS from '../../Assets/Icons';
import { CustomText } from '../../Components/CustomText';
import { horizontalScale, verticalScale } from '../../Utilities/Metrics';
import {
  ScheduleDashBoardResponse,
  ScheduleItem,
} from '../../Services/ApiResponses/GetDashScheduleDashboardApiResponse';
import IMAGES from '../../Assets/Images';
import { deleteData, fetchData, postData } from '../../Services/ApiService';
import ENDPOINTS from '../../Services/ApiEndpoints';
import { COLORS } from '../../Utilities/Colors';

const Search: FC<SearchProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    setIsLoading(true);
    try {
      const response = await fetchData<ScheduleDashBoardResponse>(
        `${ENDPOINTS.getSearch}?term=${encodeURIComponent(searchQuery)}`,
      );

      if (response.data?.items) {
        setSearchResults(response.data.items);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
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

  const renderActiveLesson = ({
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
            if (item.favorite) {
              handleRemoveFavoriteVideo(item.id);
              handleSearch();
            } else {
              handleAddFavroiteVideo(item.id);
              handleSearch();
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <CustomIcon Icon={ICONS.BackArrowIcon} height={24} width={24} />
        </TouchableOpacity>
        <View style={styles.searchInputContainer}>
          <CustomIcon Icon={ICONS.SearchIcon} height={18} width={18} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a lesson"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            autoFocus
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              <CustomIcon Icon={ICONS.CrossIcon} height={18} width={18} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {searchResults.length === 0 && !isLoading && searchQuery.length >= 2 && (
        <View style={styles.emptyState}>
          <CustomText fontSize={16} fontFamily="ROBOTO_regular">
            No results found
          </CustomText>
        </View>
      )}
      <FlatList
        data={searchResults}
        keyExtractor={item => item.id}
        renderItem={renderActiveLesson}
        contentContainerStyle={{
          paddingHorizontal: horizontalScale(20),
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(15),
    gap: horizontalScale(15),
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGrey,
    borderRadius: 10,
    paddingHorizontal: horizontalScale(15),
    gap: horizontalScale(10),
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultItem: {
    padding: horizontalScale(20),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
});
export default Search;
