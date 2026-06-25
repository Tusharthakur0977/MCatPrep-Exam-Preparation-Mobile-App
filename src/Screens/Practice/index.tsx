import React, { FC, useEffect, useState } from 'react';
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
import { COLORS } from '../../Utilities/Colors';
import { horizontalScale, verticalScale } from '../../Utilities/Metrics';
import { PracticeProps } from '../../Typings/route';
import { fetchData } from '../../Services/ApiService';
import ENDPOINTS from '../../Services/ApiEndpoints';
import { useAppSelector } from '../../Redux/store';
import { Item } from '../../Services/ApiResponses/GetSubjectsApiResponse';
import { Root } from '../../Services/ApiResponses/GetFlashcardsUsingSubjectApiResponse';
import { GetQuestionsBySubjectsApiResponse } from '../../Services/ApiResponses/GetQuestionsBySubjectsApiResponse';
import PremiumGuard from '../../Components/PremiumGuard';

const subjects = [
  { id: '1', name: 'Biochemistry', icon: ICONS.Biochemistry },
  { id: '2', name: 'Biology', icon: ICONS.Biology },
  { id: '3', name: 'General Chemistry', icon: ICONS.GeneralChemistry },
  { id: '4', name: 'Organic Chemistry', icon: ICONS.OrganicChemistry },
  { id: '5', name: 'Physics', icon: ICONS.Physics },
  { id: '6', name: 'Psychology', icon: ICONS.Psycology },
  { id: '7', name: 'Sociology', icon: ICONS.Sociology },
];

const Practice: FC<PracticeProps> = ({ navigation }) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const { subjects: reduxSubjects } = useAppSelector(
    state => state.contentData,
  );
  const [flashCard, setFlashCard] = useState<any>(null);
  const [questions, setQuestions] = useState<any>(null);

  const visibleSubjects = reduxSubjects?.items?.slice(2);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visibleSubjects?.length && !selectedId) {
      const firstVisible = visibleSubjects[0];
      setSelectedId(firstVisible.id);
      handleFetchFlashCards(firstVisible.id);
      handleFetchQuestions(firstVisible.id);
    }
  }, [visibleSubjects, selectedId]);

  const renderItem = ({ item }: { item: Item }) => {
    const isSelected = selectedId === item.id;

    const handlePress = () => {
      setSelectedId(item.id);

      const selectedSubject = reduxSubjects?.items?.find(
        subject => subject.id === item.id,
      );

      // navigation.navigate('mainStack', {
      //   screen: 'questionList',
      //   params: {
      //     subjectId: item.id,
      //     subject: selectedSubject?.name,
      //     type: 'questions',
      //   },
      // });
    };

    const getIcons =
      item.name === 'Biochemistry'
        ? ICONS.Biochemistry
        : item.name === 'Biology'
        ? ICONS.Biology
        : item.name === 'General Chemistry'
        ? ICONS.GeneralChemistry
        : item.name === 'Organic Chemistry'
        ? ICONS.OrganicChemistry
        : item.name === 'Physics'
        ? ICONS.Physics
        : item.name === 'Psychology'
        ? ICONS.Psycology
        : item.name === 'Sociology'
        ? ICONS.Sociology
        : ICONS.Biochemistry;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: isSelected ? COLORS.MCAT_Green : COLORS.white },
          { borderColor: isSelected ? COLORS.MCAT_Green : COLORS.grey },
        ]}
        onPress={() => {
          handlePress();
          handleFetchFlashCards(item.id);
          handleFetchQuestions(item.id);
        }}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: isSelected ? COLORS.white : undefined },
            { borderColor: isSelected ? COLORS.white : COLORS.grey },
          ]}
        >
          <CustomIcon Icon={getIcons} height={30} width={30} />
        </View>
        <CustomText
          fontFamily="ROBOTO_bold"
          fontSize={12}
          style={[
            styles.cardText,
            { color: isSelected ? COLORS.white : COLORS.black },
          ]}
        >
          {item.name}
        </CustomText>
      </TouchableOpacity>
    );
  };

  const handleFetchFlashCards = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetchData<Root>(
        `${ENDPOINTS.flashCardByQuestion}${id}&limit=1`,
      );
      if (response.data) {
        setFlashCard(response.data);
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchQuestions = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetchData<GetQuestionsBySubjectsApiResponse>(
        `${ENDPOINTS.getQuestionsUsingSubjects}${id}&limit=1`,
      );
      if (response.data) {
        setQuestions(response.data);
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          backgroundColor: COLORS.MCAT_White,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.MCAT_Dark_Blue} />
      </View>
    );
  }

  return (
    <PremiumGuard>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: horizontalScale(15),
            paddingBottom: verticalScale(50),
            backgroundColor: COLORS.white,
            boxShadow: '0px 1px 0px rgba(43, 42, 42, 0.1)',
          }}
        >
          <CustomText
            fontFamily="INTER_extraBold"
            fontSize={22}
            color={COLORS.blueBlack}
          >
            Practice
          </CustomText>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollCont}
        >
          <View style={styles.contentWrapper}>
            {/* Subjects row */}
            <View>
              <FlatList
                data={visibleSubjects}
                bounces={false}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.subjectList}
              />
            </View>

            {/* Buttons */}
            <View>
              <TouchableOpacity
                onPress={() => {
                  const selectedSubject = reduxSubjects?.items?.find(
                    subject => subject.id === selectedId,
                  );

                  navigation.navigate('mainStack', {
                    screen: 'questionList',
                    params: {
                      subject: selectedSubject?.name!,
                      type: 'flashCard',
                      subjectId: selectedSubject?.id || '1',
                    },
                  });
                }}
                style={[
                  styles.button,
                  { backgroundColor: COLORS.MCAT_Dark_Blue },
                ]}
              >
                <CustomText
                  fontFamily="ROBOTO_bold"
                  fontSize={15}
                  style={styles.buttonText}
                >
                  {flashCard && flashCard.count} Flashcards
                </CustomText>
                <CustomIcon Icon={ICONS.RightIcon} height={20} width={20} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  const selectedSubject = reduxSubjects?.items?.find(
                    subject => subject.id === selectedId,
                  );

                  navigation.navigate('mainStack', {
                    screen: 'questionList',
                    params: {
                      subject: selectedSubject?.name!,
                      type: 'questions',
                      subjectId: selectedSubject?.id || '1',
                    },
                  });
                }}
                style={[styles.button, { backgroundColor: COLORS.MCAT_Orange }]}
              >
                <CustomText
                  fontFamily="ROBOTO_bold"
                  fontSize={15}
                  style={styles.buttonText}
                >
                  {questions && questions.total} Questions
                </CustomText>
                <CustomIcon Icon={ICONS.RightIcon} height={20} width={20} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </PremiumGuard>
  );
};

export default Practice;

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
    paddingBottom: verticalScale(70),
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    gap: verticalScale(40),
  },
  card: {
    width: horizontalScale(90),
    height: verticalScale(170),
    borderRadius: 50,
    marginRight: horizontalScale(15),
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: verticalScale(10),
  },
  iconCircle: {
    height: 70,
    width: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cardText: {
    marginTop: verticalScale(30),
    textAlign: 'center',
  },
  subjectList: {
    paddingBottom: verticalScale(10),
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(15),
    paddingHorizontal: horizontalScale(20),
    borderRadius: 8,
    marginBottom: verticalScale(15),
  },
  buttonText: {
    color: COLORS.white,
  },
});
