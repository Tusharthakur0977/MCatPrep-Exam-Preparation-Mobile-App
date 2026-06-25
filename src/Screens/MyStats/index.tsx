import React, { FC, useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ICONS from '../../Assets/Icons';
import CustomIcon from '../../Components/CustomIcon';
import { CustomText } from '../../Components/CustomText';
import { MyStatsScreenProps } from '../../Typings/route';
import { COLORS } from '../../Utilities/Colors';
import { horizontalScale, verticalScale, wp } from '../../Utilities/Metrics';
import { fetchData } from '../../Services/ApiService';
import ENDPOINTS from '../../Services/ApiEndpoints';
import { useFocusEffect } from '@react-navigation/native';
import { GlobalStatsResponse } from '../../Services/ApiResponses/GlobalStatsApiResponse';
import { StatsProfileResponse } from '../../Services/ApiResponses/StatsProfileApiResponse';

const MyStats: FC<MyStatsScreenProps> = ({ navigation }) => {
  const BADGE_CONFIG: Record<
    string,
    { title: string; icon: any; color: string } | undefined
  > = {
    // Questions
    'First question': {
      title: 'First question',
      icon: ICONS.RedMileStone,
      color: COLORS.MCAT_Orange,
    },
    '10 questions': {
      title: '10 questions',
      icon: ICONS.RedMileStone,
      color: COLORS.MCAT_Orange,
    },
    '20 questions': {
      title: '20 questions',
      icon: ICONS.RedMileStone,
      color: COLORS.MCAT_Orange,
    },
    '30 questions': {
      title: '30 questions',
      icon: ICONS.RedMileStone,
      color: COLORS.MCAT_Orange,
    },

    // Videos (example - adjust based on actual badge strings from backend)
    'First video': {
      title: 'First video',
      icon: ICONS.YellowMileStone,
      color: COLORS.Orange,
    },
    '10 videos': {
      title: '10 videos',
      icon: ICONS.YellowMileStone,
      color: COLORS.Orange,
    },

    // Flashcards
    'First flashcard': {
      title: 'First flashcard',
      icon: ICONS.GreenMileStone,
      color: COLORS.green,
    },
    '10 flashcards': {
      title: '10 flashcards',
      icon: ICONS.GreenMileStone,
      color: COLORS.green,
    },
  };

  const getMilestoneItems = (badges: string[] | undefined) => {
    if (!badges || badges.length === 0) return [];

    return badges
      .map(badge => {
        const config = BADGE_CONFIG[badge];
        if (!config) return null;
        return {
          id: badge,
          title: config.title,
          icon: config.icon,
          color: config.color,
          achieved: true,
        };
      })
      .filter(Boolean);
  };

  const getDynamicSections = () => {
    if (!milestonesData?.badges) return [];

    return [
      {
        id: 'videos',
        title: 'Videos Milestones',
        data: getMilestoneItems(milestonesData.badges.videos),
      },
      {
        id: 'questions',
        title: 'Questions Milestones',
        data: getMilestoneItems(milestonesData.badges.questions),
      },
      {
        id: 'flashcards',
        title: 'Flashcards Milestones',
        data: getMilestoneItems(milestonesData.badges.flashcards),
      },
    ].filter(section => section.data.length > 0); // show only non-empty
  };

  const MILESTONE_DATA_TEMPLATE = [
    {
      id: '1',
      title: 'First video',
      icon: ICONS.YellowMileStone,
      color: COLORS.Orange, // Use a more descriptive color variable if possible
      achieved: true,
    },
    {
      id: '2',
      title: 'First question',
      icon: ICONS.RedMileStone,
      color: COLORS.MCAT_Orange,
      achieved: true,
    },
    {
      id: '3',
      title: 'First flashcard',
      icon: ICONS.GreenMileStone,
      color: COLORS.green,
      achieved: true,
    },
  ];

  // Define sections with unique content data
  const ACCORDION_SECTIONS = [
    {
      id: 'videos',
      title: 'Videos Milestones',
      data: [MILESTONE_DATA_TEMPLATE[0]],
    },
    {
      id: 'questions',
      title: 'Questions Milestones',
      data: [MILESTONE_DATA_TEMPLATE[1]],
    },
    {
      id: 'flashcards',
      title: 'Flashcards Milestones',
      data: [MILESTONE_DATA_TEMPLATE[2]],
    },
  ];

  const renderMilestoneItem = ({ item }: any) => (
    <View style={styles.milestoneItem}>
      <CustomIcon Icon={item.icon} height={60} width={60} />
      <CustomText
        fontFamily="ROBOTO_medium"
        fontSize={14}
        color={item.color} // Use the color property from the item
        style={styles.milestoneText}
        textAlign="center"
      >
        {item.title}
      </CustomText>
    </View>
  );

  // Milestone Accordion Component
  interface MilestoneAccordionProps {
    section: (typeof ACCORDION_SECTIONS)[number];
    isOpen: boolean;
    onToggle: () => void;
    data: any;
  }

  const MilestoneAccordion: FC<MilestoneAccordionProps> = ({
    section,
    isOpen,
    onToggle,
  }) => (
    <View style={styles.accordionContainer}>
      <TouchableOpacity
        onPress={onToggle}
        style={styles.accordionHeader}
        activeOpacity={0.8}
      >
        <CustomText
          fontFamily="ROBOTO_bold"
          fontSize={18}
          color={COLORS.MCAT_Black}
        >
          {section.title}
        </CustomText>
        <CustomIcon
          Icon={ICONS.BackArrowIcon}
          height={verticalScale(15)}
          width={verticalScale(15)}
          style={isOpen ? styles.iconOpen : styles.iconClosed}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.accordionContent}>
          <FlatList
            data={section.data}
            keyExtractor={item => item.id}
            renderItem={renderMilestoneItem}
            columnWrapperStyle={styles.columnWrapper}
            numColumns={3}
            scrollEnabled={false}
          />
        </View>
      )}
    </View>
  );
  const [openStates, setOpenStates] = useState<Record<string, boolean>>(
    ACCORDION_SECTIONS.reduce(
      (acc, section) => ({ ...acc, [section.id]: true }),
      {} as Record<string, boolean>,
    ), // Start them all open, matching the visual
  );

  const [globalStatsData, setGlobalStatsData] =
    useState<GlobalStatsResponse | null>(null);

  const [milestonesData, setMilestonesData] =
    useState<StatsProfileResponse | null>(null);

  const toggleMilestones = (id: string) => {
    setOpenStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGetGlobalStats = async () => {
    try {
      const response = await fetchData<GlobalStatsResponse>(
        ENDPOINTS.getGlobalStat,
      );
      if (response.data) {
        setGlobalStatsData(response.data);
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  const handleGetMileStoneData = async () => {
    try {
      const response = await fetchData<StatsProfileResponse>(
        ENDPOINTS.getStatProfile,
      );
      if (response.data) {
        setMilestonesData(response.data);
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  useFocusEffect(
    useCallback(() => {
      handleGetGlobalStats();
      handleGetMileStoneData();
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollCont}
      >
        {/* Header */}
        <View style={styles.header}>
          <CustomIcon
            Icon={ICONS.BackArrowIcon}
            height={20}
            width={20}
            onPress={() => navigation.goBack()}
          />
          <CustomText fontFamily="INTER_extraBold" fontSize={22}>
            My Stats
          </CustomText>
        </View>
        {globalStatsData && milestonesData ? (
          <>
            <View>
              <FlatList
                data={[
                  {
                    name: 'Course Progress',
                    bgColor: '#008E2E',
                    icon: ICONS.CircleIcon,
                    subTitle: `${globalStatsData?.lessons_watched}%`,
                  },
                  {
                    name: 'Total Lessons Watched',
                    icon: ICONS.LessonIcon,
                    bgColor: COLORS.MCAT_Yellow,
                    subTitle: `${globalStatsData?.lessons_watched}/${globalStatsData?.total_lessons}`,
                  },
                  {
                    name: 'Total Questions Completed',
                    icon: ICONS.QuestionBankIcon,
                    bgColor: COLORS.MCAT_Orange,
                    subTitle: `${globalStatsData?.questions_answered}/${globalStatsData?.total_questions}`,
                  },
                  {
                    name: 'Total Flashcards Reviewed',
                    icon: ICONS.FlashCardIcon,
                    bgColor: COLORS.MCAT_Dark_Blue,
                    subTitle: `${globalStatsData?.total_flashcards_mastered}/${globalStatsData?.total_flashcards}`,
                  },
                ]}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.flatlistContent}
                renderItem={({ item }) => (
                  <View
                    style={[styles.statItem, { backgroundColor: item.bgColor }]}
                  >
                    <CustomIcon
                      Icon={item.icon}
                      height={verticalScale(41)}
                      width={verticalScale(41)}
                      style={styles.statIcon}
                    />
                    <CustomText
                      fontSize={16}
                      fontFamily="ROBOTO_regular"
                      color={COLORS.MCAT_White}
                      textAlign="center"
                    >
                      {item.name}
                    </CustomText>
                    <CustomText
                      fontSize={18}
                      fontFamily="ROBOTO_bold"
                      color={COLORS.MCAT_White}
                      textAlign="center"
                    >
                      {item.subTitle}
                    </CustomText>
                  </View>
                )}
              />
            </View>
            {milestonesData &&
              getDynamicSections().map(section => (
                <MilestoneAccordion
                  key={section.id}
                  section={section}
                  isOpen={openStates[section.id] ?? true}
                  onToggle={() => toggleMilestones(section.id)}
                />
              ))}
          </>
        ) : (
          <View
            style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}
          >
            <ActivityIndicator size="large" color={COLORS.MCAT_Dark_Blue} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyStats;

// --- STYLES (Unchanged for compatibility) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: verticalScale(10),
  },
  scrollView: {
    flex: 1,
  },
  scrollCont: {
    gap: verticalScale(20),
    paddingHorizontal: horizontalScale(15),
    paddingBottom: verticalScale(30),
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
  },
  flatlistContent: {
    gap: verticalScale(10),
  },
  columnWrapper: {
    justifyContent: 'flex-start',
    gap: verticalScale(10),
  },
  statItem: {
    width: (wp(100) - horizontalScale(40)) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: verticalScale(30),
    paddingHorizontal: horizontalScale(20),
  },
  statIcon: {
    marginBottom: verticalScale(10),
  },

  accordionContainer: {
    marginTop: verticalScale(20),
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
    borderRadius: 10,
    overflow: 'hidden', // Ensures content respects border radius
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(15),
    paddingHorizontal: horizontalScale(15),
    backgroundColor: COLORS.MCAT_Light_Blue, // Light background for header
  },
  iconClosed: {
    transform: [{ rotate: '270deg' }], // BackArrow pointing right (closed)
    tintColor: COLORS.black,
  },
  iconOpen: {
    transform: [{ rotate: '90deg' }], // BackArrow pointing down (open)
    tintColor: COLORS.black,
  },
  accordionContent: {
    paddingVertical: verticalScale(10),
    borderTopWidth: 1, // Separator line for content
    borderTopColor: COLORS.lightGrey,
  },
  milestoneItem: {
    alignItems: 'center',
    marginVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(5),
  },

  milestoneText: {
    flexShrink: 1,
    textAlign: 'center',
    marginTop: verticalScale(5),
  },
});
