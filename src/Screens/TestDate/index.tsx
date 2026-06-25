import React, { FC, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ICONS from '../../Assets/Icons';
import IMAGES from '../../Assets/Images';
import CustomIcon from '../../Components/CustomIcon';
import { CustomText } from '../../Components/CustomText';
import PrimaryButton from '../../Components/PrimaryButton';
import ScheduleCalendar from '../../Components/ScheduleCalendar';
import { TestDateScreenProps } from '../../Typings/route';
import { COLORS } from '../../Utilities/Colors';
import {
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from '../../Utilities/Metrics';
import Toast from 'react-native-toast-message';
import { fetchData, patchData } from '../../Services/ApiService';
import ENDPOINTS from '../../Services/ApiEndpoints';
import { GetUserAcountAPiResponse } from '../../Services/ApiResponses/GetUserAcountAPiResponse';

const TestDate: FC<TestDateScreenProps> = ({ navigation }) => {
  const [isCalendar, setIsCalendar] = useState(false);
  const [selectedTestDate, setSelectedTestDate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getUserData = async () => {
    try {
      const response = await fetchData<GetUserAcountAPiResponse>(
        ENDPOINTS.getUSerData,
      );

      if (response.data) {
        setSelectedTestDate(response.data.mcat_test_date);
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  const handleSaveCalendarData = async (date: any = false) => {
    try {
      setIsLoading(true);
      if (date === false) {
        // User clicked "REMOVE TEST DATE" button - send null
        const response = await patchData(ENDPOINTS.completeOnboarding, {
          mcatTestDate: null,
        });

        setSelectedTestDate(null);
        Toast.show({
          type: 'success',
          text1: 'Test Date Removed',
          text2: 'Your test date has been removed successfully.',
        });
      } else {
        // User selected a date from calendar - send the date
        const response = await patchData(ENDPOINTS.completeOnboarding, {
          mcatTestDate: date,
        });

        setSelectedTestDate(date);
        Toast.show({
          type: 'success',
          text1: 'Test Date Updated',
          text2: 'Your test date has been saved successfully.',
        });
      }
    } catch (error: any) {
      console.error('Error updating test date:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: error?.message || 'Failed to update test date.Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

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
            Select Your Test Date
          </CustomText>
        </View>
        <View style={styles.contentContainer}>
          <Image
            source={IMAGES.Illustration1}
            style={styles.illustrationImage}
          />
          <View style={styles.textContainer}>
            <CustomText
              color={COLORS.MCAT_Black}
              fontFamily="ROBOTO_semiBold"
              textAlign="center"
              fontSize={22}
              style={styles.titleText}
            >
              When are you taking the test?
            </CustomText>
            <CustomText
              fontFamily="INTER_medium"
              textAlign="center"
              fontSize={13}
              style={styles.subtitleText}
            >
              By setting a test date, we are able to give you helpful
              suggestions and reminders about your upcoming test.
            </CustomText>
          </View>

          <View style={styles.buttonContainer}>
            <PrimaryButton
              onPress={() => {
                setIsCalendar(true);
              }}
              title="SELECT TEST DATE"
            />

            <PrimaryButton
              isFullWidth={false}
              onPress={() => handleSaveCalendarData(false)}
              bgColor={['transparent', 'transparent']}
              title={
                selectedTestDate
                  ? `REMOVE TEST DATE ${selectedTestDate}`
                  : 'I DONT HAVE A TEST DATE YET'
              }
              textColor={COLORS.grey}
              textSize={12}
              textStyle={styles.underlineText}
              disabled={isLoading}
            />
          </View>

          <ScheduleCalendar
            isModalVisible={isCalendar}
            closeModal={() => setIsCalendar(false)}
            onPressApply={async selectedDate => {
              setSelectedTestDate(selectedDate);
              setIsCalendar(false);
              handleSaveCalendarData(selectedDate);
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TestDate;

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
    paddingBottom: verticalScale(80),
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  illustrationImage: {
    height: hp(30),
    resizeMode: 'contain',
    width: wp(50),
    borderRadius: verticalScale(10),
  },
  textContainer: {
    gap: verticalScale(20),
    alignItems: 'center',
    flex: 1,
  },
  titleText: {
    width: wp(50),
  },
  subtitleText: {
    width: wp(80),
  },
  buttonContainer: {
    gap: verticalScale(15),
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
});
