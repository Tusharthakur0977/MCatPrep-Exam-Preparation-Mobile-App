import React, { FC, useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ICONS from '../../Assets/Icons';
import IMAGES from '../../Assets/Images';
import CustomIcon from '../../Components/CustomIcon';
import CustomPicker from '../../Components/CustomPIcker';
import { CustomText } from '../../Components/CustomText';
import PrimaryButton from '../../Components/PrimaryButton';
import { StudyTimeScreenProps } from '../../Typings/route';
import { COLORS } from '../../Utilities/Colors';
import {
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from '../../Utilities/Metrics';
import { fetchData, postData } from '../../Services/ApiService';
import ENDPOINTS from '../../Services/ApiEndpoints';
import { useFocusEffect } from '@react-navigation/native';
import { UserScheduleSettings } from '../../Services/ApiResponses/UserScheduleSettingsApiResponse';

const StudyTime: FC<StudyTimeScreenProps> = ({ navigation }) => {
  const [selectedHours, setSelectedHours] = useState<any | string>('');
  const [completionDate, setCompletionDate] = useState<string | null>(null);
  const [estimatedDays, setEstimatedDays] = useState<number | null>(null);

  const formatHours = (value: any) => {
    if (value === null || value === undefined) return 0;

    const str = value.toString();
    return Number(str.replace(/\D/g, '')) || 0;
  };

  const getCompletionEstimate = async (hours: number) => {
    try {
      const estimateResponse = await fetchData<Record<string, number>>(
        `${ENDPOINTS.getScheduleEstimate}isHour=true`,
      );

      if (estimateResponse.data && estimateResponse.data[hours.toString()]) {
        const days = estimateResponse.data[hours.toString()];
        setEstimatedDays(days);
        // Calculate completion date
        const today = new Date();
        const completion = new Date(today);
        completion.setDate(today.getDate() + days);
        setCompletionDate(completion.toISOString().split('T')[0]);
      }
    } catch (error) {
      console.log(error, 'Error fetching completion estimate');
    }
  };

  const handleUpdateScheduleHours = async () => {
    if (!selectedHours) {
      return;
    }
    try {
      const data = {
        hours: selectedHours,
      };
      const response = await postData(ENDPOINTS.createStudySchedule, data);
      await getCompletionEstimate(selectedHours);
      navigation.goBack();
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  const handleGetUserScheduleSettings = async () => {
    try {
      const response = await fetchData<UserScheduleSettings>(
        `${ENDPOINTS.userScheduleSettings}?isHour=true`,
      );

      if (response.data) {
        const { hours, length, end_date } = response.data;

        const formattedHours = formatHours(hours);

        setSelectedHours(formattedHours); // Prefill picker
        setEstimatedDays(length); // Set estimated days
        setCompletionDate(end_date); // Set completion date
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  useEffect(() => {
    handleGetUserScheduleSettings();
  }, []);

  useEffect(() => {
    if (selectedHours) {
      getCompletionEstimate(selectedHours);
    }
  }, [selectedHours]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollCont,
          {
            paddingBottom:
              completionDate && estimatedDays
                ? verticalScale(50)
                : verticalScale(80),
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <CustomIcon
            Icon={ICONS.BackArrowIcon}
            height={20}
            width={20}
            onPress={() => navigation.goBack()}
          />
          {/* <CustomText fontFamily="INTER_extraBold" fontSize={22}>
            Set Your Study Time
          </CustomText> */}
        </View>
        <View style={styles.contentContainer}>
          <Image
            source={IMAGES.Illustration2}
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
              How much time do you want to spend studying?
            </CustomText>
            <CustomText
              fontFamily="INTER_medium"
              textAlign="center"
              fontSize={13}
            >
              By setting how much time you want to spend per day studying, we
              are able to pace your learning schedule to help you be more
              successful.
            </CustomText>
            <CustomPicker
              value={selectedHours} // <-- prefill from API
              onValuesChange={hours => {
                console.log('onValueChange', hours);

                setSelectedHours(formatHours(hours));
              }}
            />
          </View>

          <View style={styles.buttonContainer}>
            <PrimaryButton
              onPress={async () => {
                handleUpdateScheduleHours();
              }}
              title="CONFIRM"
            />
          </View>

          {completionDate && estimatedDays && (
            <View style={styles.completionContainer}>
              <CustomText
                fontFamily="INTER_medium"
                fontSize={13}
                textAlign="center"
                color={COLORS.MCAT_Black}
              >
                At {selectedHours} hours per day, you will complete the course
                in approximately {estimatedDays} days.
              </CustomText>
              <CustomText
                fontFamily="ROBOTO_semiBold"
                fontSize={14}
                textAlign="center"
                color={COLORS.MCAT_Dark_Blue}
                style={styles.completionDateText}
              >
                Estimated completion:{' '}
                {new Date(completionDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </CustomText>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudyTime;

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
    width: wp(80),
  },
  titleText: {
    width: wp(80),
  },
  buttonContainer: {
    gap: verticalScale(15),
  },
  completionContainer: {
    marginTop: verticalScale(10),
    paddingHorizontal: horizontalScale(20),
    gap: verticalScale(10),
    // backgroundColor: 'red',
  },
  completionDateText: {
    marginTop: verticalScale(5),
  },
});
