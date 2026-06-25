import React, { FC } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { COLORS } from '../../Utilities/Colors';
import { CustomText } from '../../Components/CustomText';
import CustomIcon from '../../Components/CustomIcon';
import ICONS from '../../Assets/Icons';
import {
  horizontalScale,
  hp,
  responsiveFontSize,
  verticalScale,
} from '../../Utilities/Metrics';
import { QuestionBankProps } from '../../Typings/route';
import PrimaryButton from '../../Components/PrimaryButton';
import { useAppSelector } from '../../Redux/store';
import PremiumGuard from '../../Components/PremiumGuard';

const QuestionBank: FC<QuestionBankProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const { questionsData } = useAppSelector(state => state.questionsData);

  // Helper function to get icon based on subject name
  const getSubjectIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('psychology') || lowerName.includes('psych')) {
      return ICONS.psychologyIcon;
    } else if (
      lowerName.includes('biochemistry') ||
      lowerName.includes('biochem')
    ) {
      return ICONS.biologyIcon;
    } else if (lowerName.includes('biology') || lowerName.includes('bio')) {
      return ICONS.biologyIcon;
    } else if (lowerName.includes('chemistry') || lowerName.includes('chem')) {
      return ICONS.chemistTubesIcon;
    } else if (lowerName.includes('physics')) {
      return ICONS.psychologyIcon;
    } else if (lowerName.includes('sociology') || lowerName.includes('soc')) {
      return ICONS.psychologyIcon;
    }
    return ICONS.biologyIcon; // Default icon
  };

  // Helper function to get color based on subject name
  const getSubjectColor = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('psychology') || lowerName.includes('sociology')) {
      return '#FF8B67';
    } else if (
      lowerName.includes('biochemistry') ||
      lowerName.includes('biology')
    ) {
      return '#2196F3';
    } else if (
      lowerName.includes('chemistry') ||
      lowerName.includes('physics')
    ) {
      return '#145FD6';
    }
    return '#2196F3'; // Default color
  };

  // Transform Redux subjects to match the UI format
  const subjects =
    questionsData?.flatMap(section =>
      section.subjects
        .filter(subjects => subjects.amount_of_new_questions > 0)
        .map(subject => ({
          id: subject.id,
          name: subject.name,
          count: subject.amount_of_new_questions, // Using amount_of_videos as question count
          color: getSubjectColor(subject.name),
          icon: getSubjectIcon(subject.name),
        })),
    ) || [];

  return (
    <PremiumGuard>
      <SafeAreaView
        style={styles.container}
        edges={['bottom', 'left', 'right']}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop:
                insets.top > 0
                  ? insets.top + verticalScale(10)
                  : verticalScale(20),
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <CustomIcon Icon={ICONS.WhiteLeftArrow} height={20} width={20} />
          </TouchableOpacity>
          <CustomText
            fontFamily="INTER_extraBold"
            fontSize={24}
            color={COLORS.MCAT_White}
          >
            Question Bank
          </CustomText>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Review by status */}
          <CustomText fontFamily="INTER_extraBold" style={styles.sectionTitle}>
            Review by status
          </CustomText>
          <View style={styles.statusContainer}>
            <PrimaryButton
              title="New questions"
              onPress={() => {
                navigation.navigate('questionList', {
                  type: 'questions',
                  subject: 'New questions',
                });
              }}
              bgColor={['#145ED8', '#145ED8']}
              textFont="INTER_bold"
              textSize={responsiveFontSize(16)}
            />
            <PrimaryButton
              title="Correctly answered questions"
              onPress={() => {
                navigation.navigate('questionList', {
                  type: 'questions',
                  subject: 'Correctly answered questions',
                });
              }}
              bgColor={['#145ED8', '#145ED8']}
              textFont="INTER_bold"
              textSize={responsiveFontSize(16)}
            />
            <PrimaryButton
              title="Incorrectly answered questions"
              onPress={() => {
                navigation.navigate('questionList', {
                  type: 'questions',
                  subject: 'Incorrectly answered questions',
                });
              }}
              bgColor={['#145ED8', '#145ED8']}
              textFont="INTER_bold"
              textSize={responsiveFontSize(16)}
            />
            <PrimaryButton
              title="Flagged questions"
              onPress={() => {
                navigation.navigate('questionList', {
                  type: 'questions',
                  subject: 'Flagged questions',
                });
              }}
              bgColor={[COLORS.MCAT_Dark_Blue, COLORS.MCAT_Dark_Blue]}
              textFont="INTER_bold"
              textSize={responsiveFontSize(16)}
            />
          </View>

          {/* Pick Subject with Background Image */}
          <CustomText fontFamily="INTER_extraBold" style={styles.sectionTitle}>
            Pick Subject
          </CustomText>
          <View style={styles.subjectGrid}>
            {subjects.length > 0 ? (
              subjects.map(item => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  style={[styles.subjectCard, { backgroundColor: item.color }]}
                  onPress={() => {
                    navigation.navigate('mainStack', {
                      screen: 'questionList',
                      params: {
                        subject: item.name,
                        subjectId: item.id,
                        type: 'questions',
                      },
                    });
                  }}
                >
                  <CustomIcon
                    Icon={item.icon}
                    height={verticalScale(110)}
                    width={verticalScale(110)}
                    style={{ position: 'absolute' }}
                  />
                  <View style={styles.textContainer}>
                    <CustomText
                      fontFamily="INTER_bold"
                      fontSize={22}
                      color={COLORS.MCAT_White}
                      textAlign="center"
                    >
                      {item.name}
                    </CustomText>
                    <CustomText
                      fontFamily="INTER_medium"
                      fontSize={14}
                      color={COLORS.MCAT_White}
                    >
                      {item.count} questions
                    </CustomText>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View
                style={{ width: '100%', paddingVertical: verticalScale(20) }}
              >
                <CustomText
                  fontFamily="INTER_medium"
                  fontSize={16}
                  color={COLORS.darkBlue}
                  textAlign="center"
                >
                  No subjects available
                </CustomText>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </PremiumGuard>
  );
};

export default QuestionBank;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(30),
    gap: horizontalScale(15),
    backgroundColor: COLORS.MCAT_Dark_Blue,
  },
  statusContainer: {
    marginTop: verticalScale(10),
    paddingHorizontal: horizontalScale(16),
    gap: verticalScale(10),
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(16),
    marginTop: verticalScale(10),
  },
  subjectCard: {
    width: '48%',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    gap: verticalScale(5),
    marginBottom: verticalScale(10),
    height: hp(20),
    position: 'relative',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.3,
    borderRadius: 5,
  },
  textContainer: { alignItems: 'center', zIndex: 1, gap: verticalScale(5) },
  sectionTitle: {
    marginTop: verticalScale(15),
    paddingHorizontal: horizontalScale(16),
    color: COLORS.black,
  },
});
