import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ICONS from '../../Assets/Icons';
import CustomIcon from '../../Components/CustomIcon';
import { CustomText } from '../../Components/CustomText';
import PrimaryButton from '../../Components/PrimaryButton';
import { COLORS } from '../../Utilities/Colors';
import { horizontalScale, hp, verticalScale } from '../../Utilities/Metrics';
import Svg, { Circle, G } from 'react-native-svg';
import CustomDropdown from '../../Components/CustomDropdown';
import { fetchData } from '../../Services/ApiService';
import ENDPOINTS from '../../Services/ApiEndpoints';
import { flashCardStatsResponse } from '../../Services/ApiResponses/FlashCardStatsApiResponse';
import { QuestionsStatsResponse } from '../../Services/ApiResponses/QuestionsStatsApiResponse';
import { GlobalStatsResponse } from '../../Services/ApiResponses/GlobalStatsApiResponse';
import { ScheduleResponse } from '../../Services/ApiResponses/ScheduleApiResponse';
import { useFocusEffect } from '@react-navigation/native';

type LegendItemProps = {
  color: string;
  label: string;
  percentage: any;
};

const Progress = ({ navigation }: any) => {
  const [courseProgressLoading, setCourseProgressLoading] = useState(false);
  const [flashCardLoading, setFlashCardLoading] = useState(false);
  const [questionCardLoading, setQuestionCardLoading] = useState(false);
  const [flashCardData, setFlashCardData] = useState<
    flashCardStatsResponse | any
  >(null);
  const [questionsData, setQuestionsData] = useState<
    QuestionsStatsResponse | any
  >(null);
  const [globalStatsData, setGlobalStatsData] =
    useState<GlobalStatsResponse | null>(null);
  const [scheduleData, setScheduleData] = useState<ScheduleResponse | null>(
    null,
  );
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedQuestion, setSelectedQuestion] = useState('All');
  const [isSubjectDropdownVisible, setSubjectDropdownVisible] = useState(false);
  const [isQuestionDropdownVisible, setQuestionDropdownVisible] =
    useState(false);
  const radius = 60;
  const strokeWidth = 15;
  const circumference = 2 * Math.PI * radius;

  const positive = flashCardData?.[selectedSubject]?.positive ?? 0;
  const neutral = flashCardData?.[selectedSubject]?.neutral ?? 0;
  const negative = flashCardData?.[selectedSubject]?.negative ?? 0;
  const attempted = flashCardData?.[selectedSubject]?.attempted ?? 0;

  const totals = positive + neutral + negative + attempted || 1;

  const data = [
    {
      percentage: positive / totals,
      color: COLORS.MCAT_Green,
    },
    {
      percentage: neutral / totals,
      color: COLORS.DarkOrange,
    },
    {
      percentage: negative / totals,
      color: 'orange',
    },
    {
      percentage: attempted / totals,
      color: COLORS.lightGrey,
    },
  ];

  const rawCorrect = questionsData?.[selectedQuestion]?.correct ?? 0;
  const rawWrong = questionsData?.[selectedQuestion]?.wrong ?? 0;
  const rawAttempted = questionsData?.[selectedQuestion]?.attempted ?? 0;

  const total = rawCorrect + rawWrong + rawAttempted || 1;

  const data1 = [
    { percentage: rawWrong / total, color: COLORS.DarkOrange },
    { percentage: rawCorrect / total, color: COLORS.MCAT_Green },
    { percentage: rawAttempted / total, color: COLORS.lightGrey },
  ];

  const subjectOptions = flashCardData
    ? Object.keys(flashCardData).map(key => ({
        label: key,
        value: key,
      }))
    : [];

  const questionOptions = questionsData
    ? Object.keys(questionsData).map(key => ({
        label: key,
        value: key,
      }))
    : [];

  const LegendItem: FC<LegendItemProps> = ({ color, label, percentage }) => (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={{ gap: verticalScale(5) }}>
        <CustomText
          fontSize={12}
          fontFamily="ROBOTO_regular"
          color={COLORS.fadeGrey}
        >
          {label}
        </CustomText>
        <CustomText fontSize={12} fontFamily="ROBOTO_bold">
          {percentage}
        </CustomText>
      </View>
    </View>
  );

  const handleFetchFlashCardStats = async () => {
    try {
      setFlashCardLoading(true);
      const response = await fetchData<flashCardStatsResponse>(
        `${ENDPOINTS.getFlashCardStats}subject=${selectedSubject}`,
      );
      if (response.data) {
        setFlashCardData(response.data);
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
      setFlashCardLoading(false);
    } finally {
      setFlashCardLoading(false);
    }
  };

  const handleGetQuestionsStats = async () => {
    try {
      setQuestionCardLoading(true);
      const response = await fetchData<QuestionsStatsResponse>(
        `${ENDPOINTS.getQuestionsStats}subject=${selectedQuestion}`,
      );
      if (response.data) {
        setQuestionsData(response.data);
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
      setQuestionCardLoading(false);
    } finally {
      setQuestionCardLoading(false);
    }
  };

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

  const handleGetGlobalStats = async () => {
    try {
      setCourseProgressLoading(true);
      const response = await fetchData<GlobalStatsResponse>(
        ENDPOINTS.getGlobalStat,
      );
      if (response.data) {
        setGlobalStatsData(response.data);
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
      setCourseProgressLoading(false);
    } finally {
      setCourseProgressLoading(false);
    }
  };

  const getCorrectQuestionData =
    questionsData?.[selectedQuestion]?.correct ?? 0;

  const getWrongQuestionData = questionsData?.[selectedQuestion]?.wrong ?? 0;

  const getAttemptedQuestionData =
    questionsData?.[selectedQuestion]?.attempted ?? 0;

  const getFlashCardPostiveData =
    flashCardData?.[selectedSubject]?.positive ?? 0;

  const getFlashCardNegativeData =
    flashCardData?.[selectedSubject]?.negative ?? 0;

  const getFlashCardNeutralData =
    flashCardData?.[selectedSubject]?.neutral ?? 0;

  const getFlashCardAttemptData =
    flashCardData?.[selectedSubject]?.attempted ?? 0;

  const totalFlashcards = globalStatsData?.total_flashcards ?? 0;
  const attemptedPercentage = getFlashCardAttemptData ?? 0;

  // convert percentage to count
  const attemptedCount = Math.round(
    (attemptedPercentage / 100) * totalFlashcards,
  );
  const unviewedFlashCards = totalFlashcards - attemptedCount;

  const unansweredFlashCardPercentage =
    totalFlashcards > 0
      ? Math.round((unviewedFlashCards / totalFlashcards) * 100)
      : 0;

  const getAttemptedQuestionPercentage = getAttemptedQuestionData ?? 0;
  const totalQuestionLeft = globalStatsData?.total_questions ?? 0;

  const attemptedQuestions = Math.round(
    (getAttemptedQuestionPercentage / 100) * totalQuestionLeft,
  );

  const unansweredQuestion = totalQuestionLeft - attemptedQuestions;

  const unansweredPercentage =
    totalQuestionLeft > 0
      ? Math.round((unansweredQuestion / totalQuestionLeft) * 100)
      : 0;

  console.log('UNANSWERED %', unansweredPercentage);

  useFocusEffect(
    useCallback(() => {
      handleGetQuestionsStats();
      handleFetchFlashCardStats();
      handleGetScheduleStats();
      handleGetGlobalStats();
    }, [selectedQuestion, selectedSubject]),
  );

  const start: any = new Date(scheduleData?.start_date!);
  const end: any = new Date(scheduleData?.actual_completion_date!);

  // Difference in milliseconds
  const diffMs = end - start;

  // Convert to days
  const getLeftDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const getDaysLeft = (actualCompletionDate: any) => {
    const today: any = new Date();
    const completionDate: any = new Date(actualCompletionDate);

    const diffMs = completionDate - today; // reverse order for days left
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return days < 0 ? 0 : days; // prevent negative values
  };

  const daysLeft = getDaysLeft(scheduleData?.actual_completion_date);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollCont}
        nestedScrollEnabled={true}
      >
        <View style={styles.tutorCard}>
          <CustomIcon
            Icon={ICONS.TeacherIcon}
            height={verticalScale(53)}
            width={verticalScale(53)}
          />

          <View style={styles.tutorTextContent}>
            <CustomText fontSize={12} fontFamily="ROBOTO_bold">
              Get help from a Tutor
            </CustomText>
            <CustomText fontSize={12} fontFamily="ROBOTO_regular">
              Need 1-1 time with 99th percentile tutors?
            </CustomText>
          </View>

          <PrimaryButton
            isFullWidth={false}
            bgColor={['#145fd730', '#145fd737']}
            title="Learn more"
            textColor={COLORS.MCAT_Dark_Blue}
            textSize={12}
            onPress={() =>
              navigation.navigate('mainStack', {
                screen: 'tutoerFeatures',
              })
            }
            style={styles.tutorButton}
            gradientStyle={styles.tutorButtonGradient}
          />
        </View>

        <View style={styles.sectionContainer}>
          <CustomText fontSize={15} fontFamily="ROBOTO_bold">
            Course Progress
          </CustomText>
          {globalStatsData?.course_progress &&
          globalStatsData?.course_progress > 0 ? (
            <View style={{ gap: verticalScale(20) }}>
              <View style={styles.progressBox}>
                <CustomText fontSize={12} fontFamily="ROBOTO_bold">
                  {`You have completed ${globalStatsData?.course_progress}% of the course`}
                </CustomText>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${globalStatsData?.course_progress!}%` },
                    ]}
                  />
                </View>
                <View style={{ marginTop: verticalScale(10) }}>
                  <CustomText
                    fontSize={12}
                    fontFamily="ROBOTO_bold"
                    textAlign="left"
                  >
                    You Are Behind Your Schedule
                  </CustomText>

                  <View style={styles.scheduleRow}>
                    <CustomText
                      fontSize={12}
                      fontFamily="ROBOTO_regular"
                      color={COLORS.fadeGrey}
                    >
                      Estimated Completion:{' '}
                      <CustomText
                        fontFamily="ROBOTO_bold"
                        fontSize={12}
                        color={COLORS.blueBlack}
                      >
                        {scheduleData?.actual_completion_date}
                      </CustomText>
                    </CustomText>
                    <CustomText
                      fontSize={12}
                      fontFamily="ROBOTO_bold"
                      color={COLORS.fadeGrey}
                    >
                      Days left:{' '}
                      <CustomText
                        fontFamily="ROBOTO_bold"
                        fontSize={12}
                        color={COLORS.blueBlack}
                      >
                        {getLeftDays} Days
                      </CustomText>
                    </CustomText>
                  </View>
                </View>

                <View style={styles.progressTrack}>
                  <View
                    style={[styles.behindFill, { width: `${daysLeft!}` }]}
                  />
                </View>
              </View>
              <PrimaryButton
                isFullWidth={false}
                bgColor={[COLORS.DarkBlue, COLORS.DarkBlue]}
                title="View my schedule"
                textColor={COLORS.MCAT_White}
                textSize={13}
                onPress={() =>
                  navigation.navigate('learnTab', { initialTab: 'Schedule' })
                }
                style={{ paddingVertical: verticalScale(16) }}
                gradientStyle={styles.tutorButtonGradient}
              />
            </View>
          ) : (
            <View style={styles.progressCard}>
              {!courseProgressLoading ? (
                <>
                  <CustomIcon
                    Icon={ICONS.FadedBookIcon}
                    height={verticalScale(47)}
                    width={verticalScale(47)}
                  />
                  <CustomText fontSize={12} fontFamily="ROBOTO_regular">
                    You haven't watched any videos yet
                  </CustomText>
                  <PrimaryButton
                    isFullWidth={false}
                    bgColor={[COLORS.MCAT_Dark_Blue, COLORS.MCAT_Dark_Blue]}
                    title="GET STARTED"
                    textSize={9}
                    onPress={() => {
                      navigation.navigate('learnTab', {
                        initialTab: 'Courses',
                      });
                    }}
                    style={styles.progressButton}
                    gradientStyle={styles.progressButtonGradient}
                  />
                </>
              ) : (
                <View style={styles.progressCardLoading}>
                  <ActivityIndicator
                    size="large"
                    color={COLORS.MCAT_Dark_Blue}
                  />
                </View>
              )}
            </View>
          )}
        </View>

        {flashCardData && flashCardData?.All?.attempted > 0 ? (
          <View style={styles.practiceSection}>
            <CustomText fontSize={15} fontFamily="ROBOTO_bold">
              Practice
            </CustomText>

            <View style={styles.practiceCard}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <CustomText
                  fontSize={12}
                  fontFamily="ROBOTO_bold"
                  textAlign="left"
                >
                  Flashcards
                </CustomText>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: horizontalScale(15),
                  }}
                >
                  <CustomText
                    fontFamily="ROBOTO_medium"
                    fontSize={10}
                    color={COLORS.fadeGrey}
                  >
                    Subject:
                  </CustomText>
                  <CustomText
                    fontFamily="ROBOTO_medium"
                    fontSize={10}
                    color={COLORS.fadeGrey}
                  >
                    {selectedSubject}
                  </CustomText>

                  <TouchableOpacity
                    onPress={() => {
                      setSubjectDropdownVisible(!isSubjectDropdownVisible);
                      setQuestionDropdownVisible(false);
                    }}
                  >
                    <CustomIcon
                      Icon={ICONS.filterIcon}
                      height={18}
                      width={18}
                    />
                  </TouchableOpacity>

                  {isSubjectDropdownVisible && (
                    <CustomDropdown
                      selectedValue={selectedSubject}
                      options={subjectOptions}
                      onSelect={value => {
                        setSelectedSubject(value);
                        setSubjectDropdownVisible(false);
                      }}
                    />
                  )}
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={styles.practiceContentWithChart}>
                  <View style={styles.legendSection}>
                    <LegendItem
                      color={COLORS.green}
                      label="Positive Confidence"
                      percentage={`${getFlashCardPostiveData}%`}
                    />
                    <LegendItem
                      color={COLORS.MCAT_Yellow}
                      label="Neutral Confidence"
                      percentage={`${getFlashCardNeutralData}%`}
                    />
                    <LegendItem
                      color={COLORS.MCAT_Orange}
                      label="Negative Confidence"
                      percentage={`${getFlashCardNegativeData}%`}
                    />
                    {/* <LegendItem
                      color={COLORS.lightGrey}
                      label="Unviewed"
                      percentage="12.5%"
                    /> */}
                    <LegendItem
                      color={COLORS.lightGrey}
                      label="Unviewed"
                      percentage={`${unansweredFlashCardPercentage}%`}
                    />
                  </View>
                </View>
                <View style={styles.chartSection}>
                  <View
                    style={{ alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Svg width={160} height={160}>
                      <G rotation="70" originX="80" originY="80">
                        {
                          data.reduce(
                            (acc, slice, index) => {
                              const startOffset = acc.totalOffset;
                              const arcLength =
                                circumference * slice.percentage;

                              const circle = (
                                <Circle
                                  key={index}
                                  cx="80"
                                  cy="80"
                                  r={radius}
                                  stroke={slice.color}
                                  strokeWidth={strokeWidth}
                                  strokeDasharray={`${arcLength} ${
                                    circumference - arcLength
                                  }`}
                                  strokeDashoffset={-startOffset}
                                  strokeLinecap="round"
                                  fill="transparent"
                                />
                              );

                              acc.totalOffset += arcLength;
                              acc.items.push(circle);
                              return acc;
                            },
                            { totalOffset: 0, items: [] },
                          ).items
                        }
                      </G>
                    </Svg>
                  </View>
                  <View style={styles.chartCenterText}>
                    <CustomText fontSize={16} fontFamily="ROBOTO_bold">
                      {globalStatsData?.total_flashcards}
                    </CustomText>
                    <CustomText fontSize={10} fontFamily="ROBOTO_regular">
                      Total Flashcards
                    </CustomText>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  navigation.navigate('flashcard');
                }}
                style={styles.practiceLink}
              >
                <CustomText
                  fontSize={12}
                  fontFamily="ROBOTO_bold"
                  color={COLORS.MCAT_Dark_Blue}
                  style={{ textDecorationLine: 'underline' }}
                >
                  Practice Flashcards
                </CustomText>
                <CustomIcon Icon={ICONS.blueArrow} height={18} width={18} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.practiceSection}>
            <CustomText fontSize={15} fontFamily="ROBOTO_bold">
              Practice
            </CustomText>
            <View style={styles.practiceCard}>
              <CustomText
                fontSize={12}
                fontFamily="ROBOTO_bold"
                textAlign="left"
              >
                Flashcards
              </CustomText>
              <View style={styles.practiceContent}>
                {!flashCardLoading ? (
                  <>
                    <CustomIcon
                      Icon={ICONS.FadedFlashIcon}
                      height={verticalScale(47)}
                      width={verticalScale(47)}
                    />
                    <CustomText fontSize={12} fontFamily="ROBOTO_regular">
                      You haven’t completed any flashcards yet
                    </CustomText>

                    <PrimaryButton
                      isFullWidth={false}
                      bgColor={[COLORS.MCAT_Dark_Blue, COLORS.MCAT_Dark_Blue]}
                      title="TRY FLASHCARDS"
                      textSize={9}
                      onPress={() => {
                        navigation.navigate('flashcard');
                      }}
                      style={styles.practiceButton}
                      gradientStyle={styles.practiceButtonGradient}
                    />
                  </>
                ) : (
                  <View style={styles.practiceCardLoading}>
                    <ActivityIndicator
                      size="large"
                      color={COLORS.MCAT_Dark_Blue}
                    />
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {questionsData && questionsData?.All?.attempted > 0 ? (
          <View style={styles.practiceCard}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <CustomText
                fontSize={12}
                fontFamily="ROBOTO_bold"
                textAlign="left"
              >
                Question Bank
              </CustomText>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: horizontalScale(15),
                }}
              >
                <CustomText
                  fontFamily="ROBOTO_medium"
                  fontSize={10}
                  color={COLORS.fadeGrey}
                >
                  Subject:
                </CustomText>
                <CustomText
                  fontFamily="ROBOTO_medium"
                  fontSize={10}
                  color={COLORS.fadeGrey}
                >
                  {selectedQuestion}
                </CustomText>
                <TouchableOpacity
                  onPress={() => {
                    setQuestionDropdownVisible(!isQuestionDropdownVisible);
                    setSubjectDropdownVisible(false);
                  }}
                >
                  <CustomIcon Icon={ICONS.filterIcon} height={18} width={18} />
                </TouchableOpacity>

                {isQuestionDropdownVisible && (
                  <CustomDropdown
                    selectedValue={selectedQuestion}
                    options={questionOptions}
                    onSelect={value => {
                      setSelectedQuestion(value);
                      setQuestionDropdownVisible(false);
                    }}
                  />
                )}
              </View>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.percentageList}>
                <LegendItem
                  color={COLORS.MCAT_Green}
                  label="Correctly Answered Questions"
                  percentage={`${getCorrectQuestionData}%`}
                />
                <LegendItem
                  color="#E74C3C"
                  label="Incorrectly Answered Questions"
                  percentage={`${getWrongQuestionData}%`}
                />
                {/* <LegendItem
                  color={COLORS.lightGrey}
                  label="Unanswered Questions"
                  percentage="70%"
                /> */}
                <LegendItem
                  color={COLORS.lightGrey}
                  label="Unanswered questions"
                  percentage={`${unansweredPercentage}%`}
                />
              </View>
              <View style={styles.chartSection}>
                <View
                  style={{ alignItems: 'center', justifyContent: 'center' }}
                >
                  <Svg width={160} height={160}>
                    <G rotation="60" originX="80" originY="80">
                      {
                        data1.reduce(
                          (acc, slice, index) => {
                            const startOffset = acc.totalOffset;
                            const arcLength = circumference * slice.percentage;

                            const circle = (
                              <Circle
                                key={index}
                                cx="80"
                                cy="80"
                                r={radius}
                                stroke={slice.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${arcLength} ${
                                  circumference - arcLength
                                }`}
                                strokeDashoffset={-startOffset}
                                strokeLinecap="round"
                                fill="transparent"
                              />
                            );

                            acc.totalOffset += arcLength;
                            acc.items.push(circle);
                            return acc;
                          },
                          { totalOffset: 0, items: [] },
                        ).items
                      }
                    </G>
                  </Svg>
                </View>
                <View style={styles.chartCenterText}>
                  <CustomText fontSize={16} fontFamily="ROBOTO_bold">
                    {globalStatsData &&
                      globalStatsData?.total_questions -
                        globalStatsData?.questions_answered}
                  </CustomText>
                  <CustomText fontSize={10} fontFamily="ROBOTO_regular">
                    Questions Left
                  </CustomText>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('questionBank');
              }}
              style={styles.practiceLink}
              activeOpacity={0.8}
            >
              <CustomText
                fontSize={12}
                fontFamily="ROBOTO_bold"
                color={COLORS.MCAT_Dark_Blue}
                style={{ textDecorationLine: 'underline' }}
                numberOfLines={1}
              >
                View Question Bank
              </CustomText>
              <CustomIcon Icon={ICONS.blueArrow} height={18} width={18} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.practiceCard}>
            <CustomText fontSize={12} fontFamily="ROBOTO_bold" textAlign="left">
              Question Bank
            </CustomText>
            <View style={styles.practiceContent}>
              {!questionCardLoading ? (
                <>
                  <CustomIcon
                    Icon={ICONS.FadedInformationIcon}
                    height={verticalScale(47)}
                    width={verticalScale(47)}
                  />
                  <CustomText fontSize={12} fontFamily="ROBOTO_regular">
                    You haven’t completed any questions yet
                  </CustomText>

                  <PrimaryButton
                    isFullWidth={false}
                    bgColor={[COLORS.MCAT_Dark_Blue, COLORS.MCAT_Dark_Blue]}
                    title="SEE QUESTIONS"
                    textSize={9}
                    onPress={() => {
                      navigation.navigate('questionBank');
                    }}
                    style={styles.practiceButton}
                    gradientStyle={styles.practiceButtonGradient}
                  />
                </>
              ) : (
                <View style={styles.practiceCardLoading}>
                  <ActivityIndicator
                    size="large"
                    color={COLORS.MCAT_Dark_Blue}
                  />
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Progress;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(20),
  },
  scrollView: {
    flexGrow: 1,
  },
  scrollCont: {
    gap: verticalScale(20),
    paddingHorizontal: horizontalScale(15),
    paddingBottom: verticalScale(70),
  },
  tutorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: horizontalScale(10),
    backgroundColor: COLORS.white,
    padding: verticalScale(20),
    borderRadius: 10,
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 30px -3px',
  },
  tutorTextContent: {
    flexShrink: 1,
  },
  tutorButton: {
    paddingVertical: verticalScale(5),
    paddingHorizontal: horizontalScale(20),
  },
  tutorButtonGradient: {
    borderRadius: 100,
  },
  sectionContainer: {
    gap: verticalScale(10),
  },
  progressCard: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: horizontalScale(10),
    backgroundColor: COLORS.white,
    padding: verticalScale(20),
    borderRadius: 10,
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 30px -3px',
  },
  progressCardLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: verticalScale(20),
    borderRadius: 10,
  },
  progressButton: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(20),
  },
  progressButtonGradient: {
    borderRadius: 100,
  },
  practiceSection: {
    gap: verticalScale(20),
  },
  practiceCard: {
    justifyContent: 'space-between',
    gap: horizontalScale(20),
    backgroundColor: COLORS.white,
    padding: verticalScale(10),
    borderRadius: 10,
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 30px -3px',
  },
  practiceCardLoading: {
    justifyContent: 'center',
    padding: verticalScale(10),
    borderRadius: 10,
    minHeight: hp(13.2),
  },
  practiceContent: {
    gap: horizontalScale(10),
    alignItems: 'center',
    paddingBottom: verticalScale(20),
  },
  practiceButton: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(20),
  },
  practiceButtonGradient: {
    borderRadius: 100,
  },
  progressBox: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: verticalScale(15),
    gap: verticalScale(10),
  },
  progressTrack: {
    height: verticalScale(10),
    backgroundColor: COLORS.lightGrey,
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: horizontalScale(5),
  },
  progressFill: {
    height: verticalScale(10),
    borderRadius: 10,
    backgroundColor: COLORS.MCAT_Green,
  },
  behindFill: {
    height: verticalScale(10),
    borderRadius: 10,
    backgroundColor: COLORS.MCAT_Orange,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(10),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: horizontalScale(10),
    marginBottom: verticalScale(20),
  },
  chartSection: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  chartCenterText: {
    position: 'absolute',
    alignItems: 'center',
  },
  legendSection: {
    marginLeft: verticalScale(10),
  },
  practiceLink: {
    flexDirection: 'row',
    gap: horizontalScale(5),
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  practiceContentWithChart: {
    flexDirection: 'row',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  progressRing: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageList: {
    flex: 1,
    marginLeft: 15,
  },
});
