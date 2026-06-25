import React, { FC, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import ICONS from '../../Assets/Icons';
import BlueBubbleContainer from '../../Components/BlueBubbleContainer';
import CustomIcon from '../../Components/CustomIcon';
import { CustomText } from '../../Components/CustomText';
import FlashCardsList from '../../Components/FlashCardsList';
import ExplainationRbsheet from '../../Components/Modal/ExplainationRbSheet';
import GestureCard from '../../Components/Modal/GestureCard';
import { setFlashCardGuideShown } from '../../Redux/Slices/initialSlice';
import { useAppDispatch, useAppSelector } from '../../Redux/store';
import ENDPOINTS from '../../Services/ApiEndpoints';
import {
  GetQuesitonOfDayApiResponse,
  Question,
} from '../../Services/ApiResponses/GetQuesitonOfDayApiResponse';
import { GetQuestionsBySubjectsApiResponse } from '../../Services/ApiResponses/GetQuestionsBySubjectsApiResponse';
import {
  Root as GetFlashcardsApiResponse,
  Item as FlashcardItem,
} from '../../Services/ApiResponses/GetFlashcardsUsingSubjectApiResponse';
import { deleteData, fetchData, postData } from '../../Services/ApiService';
import { QuestionListProps } from '../../Typings/route';
import { COLORS } from '../../Utilities/Colors';
import { RBSheetRef } from '../../Utilities/Helpers';
import { horizontalScale, verticalScale } from '../../Utilities/Metrics';
import { replaceGreekLetters } from '../../Utilities/GreekLetters';
import RenderHTML from 'react-native-render-html';
import PremiumGuard from '../../Components/PremiumGuard';

const optionLetters = ['A', 'B', 'C', 'D'];

const QuestionList: FC<QuestionListProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const refRBSheet = useRef<RBSheetRef>(null);
  const exRefRBSheet = useRef<RBSheetRef>(null);
  const { subject, type, subjectId } = route.params;
  const { hasGuideBeenShown } = useAppSelector(state => state.initial);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [explanationData, setExplanationData] = useState<{
    correct: string;
    text: string;
  }>({
    correct: '',
    text: '',
  });

  // 💡 NEW STATE: Array of question IDs that have been saved/bookmarked
  const [savedQuestionIds, setSavedQuestionIds] = useState<string[]>([]);

  // State for API questions
  const [apiQuestions, setApiQuestions] = useState<any[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  // Pagination state for subject-based questions
  const [currentOffset, setCurrentOffset] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const QUESTIONS_PER_PAGE = 5;

  // Timer state for tracking time spent on each question
  const [timeSpent, setTimeSpent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<any[]>([]);
  // Flashcard state
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(false);
  const [flashcardOffset, setFlashcardOffset] = useState(0);
  const [totalFlashcards, setTotalFlashcards] = useState(0);
  const [isLoadingMoreFlashcards, setIsLoadingMoreFlashcards] = useState(false);
  const FLASHCARDS_PER_PAGE = 10;

  const { width } = useWindowDimensions();

  // Determine which questions to use
  const activeQuestions = apiQuestions || [];

  // 💡 NEW HANDLER: Toggles the save state for the current question
  const handleSaveToggle = async () => {
    const currentQId = activeQuestions[currentIndex].id;
    const isAlreadySaved = savedQuestionIds.includes(currentQId);

    // Optimistic UI update
    setSavedQuestionIds(prev =>
      isAlreadySaved
        ? prev.filter(id => id !== currentQId)
        : [...prev, currentQId],
    );

    // API call
    if (isAlreadySaved) {
      await handleRemoveFavorites(currentQId);
    } else {
      await handleAddFavorites(currentQId);
    }
  };

  // 💡 HELPER: Check if the current question is saved
  const isCurrentQuestionSaved = savedQuestionIds.includes(
    activeQuestions[currentIndex]?.id || '',
  );

  // 💡 HELPER: Determine which save icon to show
  const saveIcon = isCurrentQuestionSaved
    ? ICONS.SaveIcon
    : ICONS.HollowSaveIco;
  // NOTE: Assuming ICONS.SaveSolidIcon is the filled/solid version of the icon

  const handleOptionSelect = async (i: number) => {
    if (showAnswer) return;

    const currentQuestion = activeQuestions[currentIndex];
    const isCorrect = i === currentQuestion.answer;

    setSelectedOption(i);
    setShowAnswer(true);

    // Track correctness
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    } else {
      setIncorrectCount(prev => prev + 1);
    }

    // Store answered question (for summary screen)
    setAnsweredQuestions(prev => [
      ...prev,
      {
        ...currentQuestion,
        selectedOption: i,
        isCorrect,
      },
    ]);

    // Submit answer to API (only for subject-based questions with IDs)
    if (activeQuestions[currentIndex]?.id) {
      // Pass the selected option to submitAnswer
      const currentQuestion = activeQuestions[currentIndex];
      const selectedAnswerLetter = ['A', 'B', 'C', 'D'][i];

      try {
        const response = await postData(ENDPOINTS.submitAnswer, {
          question_id: currentQuestion.id,
          selected_answer: selectedAnswerLetter,
          time_spent: timeSpent.toString(),
          confidence: 'medium',
        });

        console.log('Answer submission response:', response);
      } catch (error) {
        console.error('Error submitting answer:', error);
      }
    }
  };

  const handleNext = async () => {
    if (!showAnswer) return;

    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowAnswer(false);

      // Check if we need to load more questions (when reaching last question)
      // Only for subject-based questions, not for "Questions of the Day"
      if (
        subject !== 'Questions of the Day' &&
        currentIndex + 1 === activeQuestions.length - 1 &&
        apiQuestions.length < totalQuestions &&
        !isLoadingMore
      ) {
        console.log('Loading more questions...');
        const nextOffset = currentOffset + QUESTIONS_PER_PAGE;
        await getQuestionsUsingSubjects(nextOffset, true);
      }
    } else {
      // Check if there are more questions available to load
      if (
        subject !== 'Questions of the Day' &&
        apiQuestions.length < totalQuestions &&
        !isLoadingMore
      ) {
        console.log('Loading more questions at the end...');
        const nextOffset = currentOffset + QUESTIONS_PER_PAGE;
        await getQuestionsUsingSubjects(nextOffset, true);

        // Move to the next question after loading
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
        setShowAnswer(false);
      } else {
        // No more questions, go back
        navigation.navigate('mainStack', {
          screen: 'questionSummary',
          params: {
            total: activeQuestions.length,
            correct: correctCount,
            incorrect: incorrectCount,
            questions: answeredQuestions,
            subjectId: subjectId!,
            status: subject,
            subject: subject,
          },
        });
      }
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedOption(null);
      setShowAnswer(false);
    } else {
      navigation.goBack();
    }
  };

  const progress = ((currentIndex + 1) / activeQuestions.length) * 100;

  const renderQuestionsUI = () => {
    // Show loading state while fetching questions
    if (isLoadingQuestions) {
      return (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color={COLORS.MCAT_White} />
          <CustomText
            fontFamily="INTER_medium"
            fontSize={16}
            color={COLORS.MCAT_White}
            style={{ marginTop: verticalScale(10) }}
          >
            Loading questions...
          </CustomText>
        </View>
      );
    }

    // Show message if no questions available
    if (activeQuestions.length === 0) {
      return (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <CustomText
            fontFamily="INTER_bold"
            fontSize={18}
            color={COLORS.MCAT_White}
            style={{ textAlign: 'center' }}
          >
            No questions available
          </CustomText>
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Progress */}
          <View style={{ marginVertical: verticalScale(25) }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {/* Timer - Left side */}
              <View style={{ flex: 1 }}>
                <CustomText
                  fontFamily="INTER_medium"
                  fontSize={12}
                  color={COLORS.MCAT_White}
                  style={{ opacity: 0.8 }}
                >
                  {Math.floor(timeSpent / 60)}:
                  {(timeSpent % 60).toString().padStart(2, '0')}
                </CustomText>
              </View>

              {/* Progress - Center */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <CustomText
                  fontFamily="INTER_bold"
                  fontSize={14}
                  color={COLORS.MCAT_White}
                  style={{ textAlign: 'center' }}
                >
                  {currentIndex + 1}/{activeQuestions.length}
                </CustomText>
                {isLoadingMore && (
                  <ActivityIndicator size="small" color={COLORS.MCAT_White} />
                )}
              </View>

              {/* Empty space for balance - Right side */}
              <View style={{ flex: 1 }} />
            </View>
            <View style={styles.progressBackground}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <View style={styles.divider} />
          </View>

          {/* Question */}
          {/* <CustomText
            fontFamily="INTER_bold"
            fontSize={20}
            color={COLORS.MCAT_White}
            style={{ marginVertical: verticalScale(10) }}
          >
            {activeQuestions[currentIndex].question}
          </CustomText> */}

          <RenderHTML
            contentWidth={width - horizontalScale(40)}
            source={{
              html:
                activeQuestions[currentIndex]?.html_stem ||
                activeQuestions[currentIndex]?.question ||
                '',
            }}
            baseStyle={{
              fontSize: 16,
              fontFamily: 'Inter-Regular',
              color: 'white',
            }}
          />

          {/* Options */}
          {activeQuestions[currentIndex].options.map(
            (opt: string, i: number) => {
              const isCorrect = i === activeQuestions[currentIndex].answer;
              let bgColor = COLORS.MCAT_White;
              let icon: any = null;

              if (showAnswer) {
                if (isCorrect) {
                  bgColor = COLORS.GreenShade;
                  icon = ICONS.CheckCircle;
                } else if (selectedOption === i && !isCorrect) {
                  bgColor = COLORS.DarkOrange;
                  icon = ICONS.CrossCircle;
                }
              } else if (selectedOption === i) {
                bgColor = COLORS.grey;
              }

              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.optionBox, { backgroundColor: bgColor }]}
                  onPress={() => handleOptionSelect(i)}
                  disabled={showAnswer}
                >
                  <RenderHTML
                    contentWidth={width - horizontalScale(60)}
                    source={{ html: `${optionLetters[i]}. ${opt}` || '' }}
                    baseStyle={{
                      fontSize: 14,
                      color: COLORS.MCAT_Dark_Blue,
                    }}
                  />
                  {icon && <CustomIcon Icon={icon} height={20} width={20} />}
                </TouchableOpacity>
              );
            },
          )}
        </View>
        {/* Next/Finish Button */}
        <View style={styles.footerContainer}>
          {/* Top Row (Save + Explanation) */}
          {showAnswer && (
            <View style={styles.actionRow}>
              {/* 💡 UPDATED: Added onPress handler to the Save button */}
              <TouchableOpacity
                style={styles.actionItem}
                activeOpacity={0.8}
                onPress={handleSaveToggle}
              >
                {/* 💡 UPDATED: Dynamic icon based on save state */}
                <CustomIcon
                  Icon={saveIcon}
                  height={22}
                  width={22}
                  // 💡 Optional: Change icon color if saved
                />
                <CustomText
                  fontFamily="INTER_medium"
                  fontSize={12}
                  color={COLORS.MCAT_White}
                >
                  {isCurrentQuestionSaved ? 'Unsave' : 'Save'}
                </CustomText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionItem}
                activeOpacity={0.8}
                onPress={() => {
                  const currentQ = activeQuestions[currentIndex];
                  const correctLetter = optionLetters[currentQ.answer];
                  setExplanationData({
                    correct: `${correctLetter} is correct.`,
                    text: currentQ.explanation,
                  });
                  exRefRBSheet.current?.open();
                }}
              >
                <CustomIcon Icon={ICONS.Explaination} height={22} width={22} />
                <CustomText
                  fontFamily="INTER_medium"
                  fontSize={12}
                  color={COLORS.MCAT_White}
                >
                  Explanation
                </CustomText>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.nextBtn, { opacity: showAnswer ? 1 : 0.5 }]}
            onPress={handleNext}
            disabled={!showAnswer}
          >
            <CustomText
              fontFamily="INTER_bold"
              fontSize={16}
              color={COLORS.darkBlue}
            >
              {currentIndex === activeQuestions.length - 1
                ? 'Finish'
                : 'Next Question'}
            </CustomText>
            <CustomIcon Icon={ICONS.blueArrow} height={20} width={20} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Helper function to transform API question to local format
  const transformApiQuestion = (apiQuestion: Question) => {
    // Convert answer letter (A, B, C, D) to index (0, 1, 2, 3)
    const answerMap: { [key: string]: number } = {
      A: 0,
      B: 1,
      C: 2,
      D: 3,
    };

    return {
      id: apiQuestion.id,
      question: replaceGreekLetters(apiQuestion.stem),
      options: [
        replaceGreekLetters(apiQuestion.choice_a),
        replaceGreekLetters(apiQuestion.choice_b),
        replaceGreekLetters(apiQuestion.choice_c),
        replaceGreekLetters(apiQuestion.choice_d),
      ],
      answer: answerMap[apiQuestion.answer] ?? 0,
      explanation: replaceGreekLetters(apiQuestion.explanation),
    };
  };

  const getquestionOfTheDay = async () => {
    try {
      setIsLoadingQuestions(true);
      const response = await fetchData<GetQuesitonOfDayApiResponse>(
        ENDPOINTS.questionOfTheDay,
      );

      if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        // Transform API questions to local format
        const transformedQuestions = response.data.map(transformApiQuestion);
        setApiQuestions(transformedQuestions);
      } else {
        Toast.show({
          type: 'info',
          text1: 'No Questions Available',
          text2: 'Using default questions.',
        });
      }
    } catch (error) {
      console.error('Error fetching question of the day:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Load Questions',
        text2: 'Using default questions.',
      });
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const getQuestionsUsingSubjects = async (
    offset: number = 0,
    append: boolean = false,
  ) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoadingQuestions(true);
      }

      let endpoint = '';

      if (subjectId) {
        endpoint = `${ENDPOINTS.getQuestionsUsingSubjects}${subjectId}&status=${subject}&limit=${QUESTIONS_PER_PAGE}&offset=${offset}`;
      } else {
        if (subject === 'Flagged questions') {
          endpoint = `questions/favorites`;
        } else {
          endpoint = `${ENDPOINTS.getQuestionsUsingSubjects}&status=${subject}&limit=${QUESTIONS_PER_PAGE}&offset=${offset}`;
        }
      }

      const response = await fetchData<GetQuestionsBySubjectsApiResponse>(
        `${endpoint}`,
      );

      console.log('RESEPOSNE', response);

      if (
        response.data &&
        response.data.items &&
        Array.isArray(response.data.items) &&
        response.data.items.length > 0
      ) {
        // Transform API questions to local format
        const transformedQuestions =
          response.data.items.map(transformApiQuestion);

        if (append) {
          // Append new questions to existing ones
          setApiQuestions(prev => [...prev, ...transformedQuestions]);
        } else {
          // Replace with new questions (initial load)
          setApiQuestions(transformedQuestions);
        }

        // Update pagination state
        setCurrentOffset(offset);
        setTotalQuestions(response.data.total);
      } else if (response.data && Array.isArray(response.data)) {
        const transformedQuestions = response.data.map(transformApiQuestion);

        if (append) {
          setApiQuestions(prev => [...prev, ...transformedQuestions]);
        } else {
          setApiQuestions(transformedQuestions);
        }

        setCurrentOffset(offset);
        setTotalQuestions(response.data.length);
      } else {
        if (!append) {
          Toast.show({
            type: 'info',
            text1: 'No Questions Available',
            text2: 'Using default questions.',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching questions by subject:', error);
      if (!append) {
        Toast.show({
          type: 'error',
          text1: 'Failed to Load Questions',
          text2: 'Using default questions.',
        });
      }
    } finally {
      if (append) {
        setIsLoadingMore(false);
      } else {
        setIsLoadingQuestions(false);
      }
    }
  };

  // Get flashcards by subject with pagination
  const getFlashcardsBySubject = async (
    offset: number = 0,
    append: boolean = false,
  ) => {
    try {
      if (append) {
        setIsLoadingMoreFlashcards(true);
      } else {
        setIsLoadingFlashcards(true);
      }

      let endpoint = '';

      if (
        subject === 'positive' ||
        subject === 'neutral' ||
        subject === 'negative'
      ) {
        endpoint = `/flashcards?status=${subject}&limit=${FLASHCARDS_PER_PAGE}&offset=${offset}`;
      } else if (subjectId) {
        endpoint = `${ENDPOINTS.flashCardByQuestion}&subject_id=${subjectId}&limit=${FLASHCARDS_PER_PAGE}&offset=${offset}`;
      }

      const response = await fetchData<GetFlashcardsApiResponse>(endpoint);

      if (
        response.data &&
        response.data.items &&
        Array.isArray(response.data.items) &&
        response.data.items.length > 0
      ) {
        // Transform API flashcards to component format
        const transformedFlashcards = response.data.items.map(
          (item: FlashcardItem) => ({
            id: item.id,
            front: {
              title: item.front || 'Flashcard',
              text: item.front || '',
              image: item.front_image || null,
            },
            back: {
              title: 'Definition',
              text: item.definition || 'No definition available',
              example: item.example || null,
              image: item.definition_image || null,
              exampleImage: item.example_image || null,
            },
          }),
        );

        if (append) {
          // Append new flashcards to existing ones
          setFlashcards(prev => [...prev, ...transformedFlashcards]);
        } else {
          // Replace flashcards (initial load)
          setFlashcards(transformedFlashcards);
        }

        // Update pagination state
        setFlashcardOffset(offset);
        setTotalFlashcards(response.data.count || 0);
      } else {
        if (!append) {
          // Set empty array only on initial load - the FlashCardsList component will show empty state
          setFlashcards([]);
          console.log('No flashcards found for this subject');
        }
      }
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Load Flashcards',
        text2: 'Please try again later.',
      });
    } finally {
      if (append) {
        setIsLoadingMoreFlashcards(false);
      } else {
        setIsLoadingFlashcards(false);
      }
    }
  };

  // Handle loading more flashcards
  const handleLoadMoreFlashcards = () => {
    // Check if we have more flashcards to load
    if (flashcards.length < totalFlashcards && !isLoadingMoreFlashcards) {
      const nextOffset = flashcardOffset + FLASHCARDS_PER_PAGE;
      getFlashcardsBySubject(nextOffset, true);
    }
  };

  const handleFetchFavorites = async () => {
    try {
      const response = await fetchData(ENDPOINTS.getFavorites);
      if (Array.isArray(response?.data)) {
        const ids = response.data.map((item: any) => item.id);
        setSavedQuestionIds(ids);
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  const handleAddFavorites = async (ids: string | string[]) => {
    try {
      const data = {
        ids: Array.isArray(ids) ? ids : [ids],
      };
      const response = await postData(ENDPOINTS.addFavorites, data);
      if (response.status === 204) {
        handleFetchFavorites();
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  const handleRemoveFavorites = async (ids: string | string[]) => {
    try {
      const data = { ids: Array.isArray(ids) ? ids : [ids] };
      const response = await deleteData(ENDPOINTS.removeFavorites, data);
      if (response.status === 204) handleFetchFavorites();
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  // Check if this is "Questions of the Day" (free content)
  const isQuestionsOfTheDay =
    subject === 'Questions of the Day' || type === 'questions';
  // Start timer when question loads
  useEffect(() => {
    // Reset timer for new question
    setTimeSpent(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    // Cleanup timer on unmount or question change
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentIndex]);

  // Stop timer when answer is shown
  useEffect(() => {
    if (showAnswer && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [showAnswer]);

  useEffect(() => {
    if (type === 'flashCard' && !hasGuideBeenShown) {
      const timeoutId = setTimeout(() => {
        refRBSheet.current?.open();
        dispatch(setFlashCardGuideShown());
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [type, hasGuideBeenShown, dispatch]);

  useEffect(() => {
    // Reset pagination state when subject changes
    setCurrentOffset(0);
    setTotalQuestions(0);
    setApiQuestions([]);
    setFlashcards([]);
    setFlashcardOffset(0);
    setTotalFlashcards(0);
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowAnswer(false);

    if (type === 'flashCard') {
      // Fetch flashcards for flashcard type
      getFlashcardsBySubject(0, false);
    } else if (subject === 'Questions of the Day') {
      // Fetch question of the day
      getquestionOfTheDay();
    } else {
      // Fetch questions by subject
      getQuestionsUsingSubjects(0, false);
    }
    handleFetchFavorites();
  }, [subject, type]);

  const Content = (
    <BlueBubbleContainer mainStyle={{ flex: 1 }} contentStyle={{ flex: 1 }}>
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <CustomIcon Icon={ICONS.WhiteLeftArrow} height={24} width={24} />
            </TouchableOpacity>

            <CustomText
              fontFamily="INTER_bold"
              fontSize={22}
              color={COLORS.MCAT_White}
            >
              {subject || ''}
            </CustomText>

            {type === 'flashCard' && (
              <TouchableOpacity onPress={() => refRBSheet.current?.open()}>
                <CustomIcon
                  Icon={ICONS.FilledQuestionMark}
                  height={20}
                  width={20}
                />
              </TouchableOpacity>
            )}
          </View>

          {type === 'flashCard' ? (
            isLoadingFlashcards ? (
              <ActivityIndicator size="large" color={COLORS.MCAT_White} />
            ) : (
              <FlashCardsList
                flashcards={flashcards}
                onLoadMore={handleLoadMoreFlashcards}
                isLoadingMore={isLoadingMoreFlashcards}
              />
            )
          ) : (
            renderQuestionsUI()
          )}
        </View>

        {/* Bottom Sheets */}
        <GestureCard ref={refRBSheet} />

        <ExplainationRbsheet
          ref={exRefRBSheet}
          explanation={explanationData.text}
          correctAnswer={explanationData.correct}
        />
      </SafeAreaView>
    </BlueBubbleContainer>
  );

  return isQuestionsOfTheDay ? Content : <PremiumGuard>{Content}</PremiumGuard>;
};

export default QuestionList;

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    paddingVertical: verticalScale(20),
    paddingHorizontal: horizontalScale(15),
  },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(15),
  },
  progressBackground: {
    height: verticalScale(7),
    backgroundColor: COLORS.fadeText,
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: verticalScale(10),
    marginHorizontal: horizontalScale(10),
  },
  progressFill: {
    height: verticalScale(7),
    backgroundColor: COLORS.MCAT_White,
    borderRadius: 10,
  },
  divider: {
    borderBottomWidth: 0.5,
    borderColor: COLORS.MCAT_Light_Blue,
    marginTop: verticalScale(25),
  },
  optionBox: {
    borderRadius: 8,
    padding: verticalScale(14),
    marginVertical: verticalScale(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextBtn: {
    backgroundColor: COLORS.MCAT_White,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    flexDirection: 'row',
    gap: horizontalScale(10),
    justifyContent: 'center',
  },
  footerContainer: {
    paddingVertical: verticalScale(15),
    justifyContent: 'flex-end',
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: horizontalScale(25),
    marginBottom: verticalScale(20),
  },

  actionItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
