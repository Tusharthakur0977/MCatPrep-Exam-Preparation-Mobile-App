import React, { FC, memo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import ICONS from '../../Assets/Icons';
import CustomIcon from '../../Components/CustomIcon';
import { CustomText } from '../../Components/CustomText';
import PremiumGuard from '../../Components/PremiumGuard';
import { useAppSelector } from '../../Redux/store';
import { FlashcardProps } from '../../Typings/route';
import { COLORS } from '../../Utilities/Colors';
import { horizontalScale, hp, verticalScale } from '../../Utilities/Metrics';

const Flashcard: FC<FlashcardProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  // Get subjects from Redux

  const { flashCards } = useAppSelector(state => state.flashCardsData);

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
    } else if (lowerName.includes('sociology')) {
      return ICONS.psychologyIcon;
    }
    return ICONS.psychologyIcon; // Default icon
  };

  // Helper function to get color based on subject name
  const getSubjectColor = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('psychology') || lowerName.includes('sociology')) {
      return '#FF8B67';
    } else if (lowerName.includes('biology') || lowerName.includes('biochem')) {
      return '#2196F3';
    } else if (
      lowerName.includes('chemistry') ||
      lowerName.includes('physics')
    ) {
      return '#145FD6';
    }
    return '#2196F3'; // Default color
  };

  // Transform Redux subjects data to UI format
  const subjects =
    flashCards?.flatMap(section =>
      section.subjects
        .filter(subjects => subjects.amount_of_flashcards > 0)
        .map(subject => ({
          id: subject.id,
          name: subject.name,
          count: subject.amount_of_flashcards, // flashcards count
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
            Flashcards
          </CustomText>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Review by status */}
          <CustomText fontFamily="INTER_extraBold" style={styles.sectionTitle}>
            Review by confidence interval
          </CustomText>
          <View style={styles.statusContainer}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('mainStack', {
                  screen: 'questionList',
                  params: {
                    subject: 'positive',
                    type: 'flashCard',
                  },
                });
              }}
              style={[styles.button, styles.greenButton]}
              activeOpacity={0.8}
            >
              <CustomIcon Icon={ICONS.ConfidentIcon} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('mainStack', {
                  screen: 'questionList',
                  params: {
                    subject: 'neutral',
                    type: 'flashCard',
                  },
                });
              }}
              style={[styles.button, styles.yellowButton]}
              activeOpacity={0.8}
            >
              <CustomIcon Icon={ICONS.NeutralIcon} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('mainStack', {
                  screen: 'questionList',
                  params: {
                    subject: 'negative',
                    type: 'flashCard',
                  },
                });
              }}
              style={[styles.button, styles.redButton]}
              activeOpacity={0.8}
            >
              <CustomIcon Icon={ICONS.NegativeIcon} />
            </TouchableOpacity>
          </View>

          {/* Pick Subject with Background Image */}
          <CustomText fontFamily="INTER_extraBold" style={styles.sectionTitle}>
            Pick Subject
          </CustomText>
          <View style={styles.subjectGrid}>
            {subjects.length > 0 ? (
              subjects.map(item => {
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    style={[
                      styles.subjectCard,
                      { backgroundColor: item.color },
                    ]}
                    onPress={() => {
                      navigation.navigate('mainStack', {
                        screen: 'questionList',
                        params: {
                          subject: item.name,
                          subjectId: item.id,
                          type: 'flashCard',
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
                        fontSize={20}
                        color={COLORS.MCAT_White}
                        textAlign="center"
                      >
                        {item.name}
                      </CustomText>
                      <CustomText
                        fontFamily="INTER_regular"
                        fontSize={14}
                        color={COLORS.MCAT_White}
                      >
                        {item.count} flashcards
                      </CustomText>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <CustomText
                  fontFamily="INTER_medium"
                  fontSize={16}
                  color={COLORS.black}
                  style={{ opacity: 0.6 }}
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

export default React.memo(Flashcard);

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
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  button: {
    flex: 1,
    height: verticalScale(50),
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenButton: {
    backgroundColor: '#0F9630',
  },
  yellowButton: {
    backgroundColor: '#FFB94A',
  },
  redButton: {
    backgroundColor: '#FF7C60',
  },
  emptyState: {
    width: '100%',
    paddingVertical: verticalScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
