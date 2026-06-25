import React, { FC } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomText } from '../../Components/CustomText';
import PrimaryButton from '../../Components/PrimaryButton';
import { QuestionSummaryProps } from '../../Typings/route';
import { COLORS } from '../../Utilities/Colors';
import { horizontalScale, verticalScale } from '../../Utilities/Metrics';

const QuestionSummary: FC<QuestionSummaryProps> = ({ navigation, route }) => {
  const { total, correct, incorrect, questions, subjectId, status, subject } =
    route.params;

  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <CustomText fontSize={24} fontFamily="ROBOTO_bold" style={styles.title}>
          Quiz Complete!
        </CustomText>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <CustomText
              fontSize={48}
              fontFamily="ROBOTO_bold"
              color={COLORS.MCAT_Green}
            >
              {percentage}%
            </CustomText>
            <CustomText fontSize={14} fontFamily="ROBOTO_bold">
              Score
            </CustomText>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <CustomText
                fontSize={32}
                fontFamily="ROBOTO_bold"
                color={COLORS.MCAT_Green}
              >
                {correct}
              </CustomText>
              <CustomText fontSize={12} fontFamily="ROBOTO_regular">
                Correct
              </CustomText>
            </View>
          </View>
          <View style={styles.statItem}>
            <CustomText
              fontSize={32}
              fontFamily="ROBOTO_bold"
              color={COLORS.MCAT_Orange}
            >
              {incorrect}
            </CustomText>
            <CustomText fontSize={12} fontFamily="ROBOTO_regular">
              Incorrect
            </CustomText>
          </View>
          <View style={styles.statItem}>
            <CustomText fontSize={32} fontFamily="ROBOTO_bold">
              {total}
            </CustomText>
            <CustomText fontSize={12} fontFamily="ROBOTO_regular">
              Total
            </CustomText>
          </View>
          <View style={styles.buttonsContainer}>
            {subject !== 'Questions of the Day' && (
              <PrimaryButton
                title="Review Incorrect"
                onPress={() => {
                  navigation.navigate('mainStack', {
                    screen: 'questionList',
                    params: {
                      questions: questions.filter((q: any) => !q.isCorrect),
                      reviewMode: true,
                      subject: status,
                      subjectId: subjectId,
                    },
                  });
                }}
                bgColor={[COLORS.MCAT_Dark_Blue, COLORS.MCAT_Dark_Blue]}
                style={styles.button}
              />
            )}
            <PrimaryButton
              title="Done"
              onPress={() =>
                navigation.replace('mainStack', {
                  screen: 'bottomTabStack',
                  params: {
                    screen: 'homeTab',
                    params: {
                      screen: 'home',
                    },
                  },
                })
              }
              bgColor={[COLORS.lightGrey, COLORS.lightGrey]}
              textColor={COLORS.black}
              style={styles.button}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    padding: horizontalScale(20),
    alignItems: 'center',
  },
  title: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(40),
  },
  statsContainer: {
    width: '100%',
    marginBottom: verticalScale(40),
  },
  statBox: {
    alignItems: 'center',
    marginBottom: verticalScale(30),
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: {
    alignItems: 'center',
  },
  buttonsContainer: {
    width: '100%',
    gap: verticalScale(15),
    marginTop: verticalScale(30),
  },
  button: {
    width: '100%',
  },
});
export default QuestionSummary;
