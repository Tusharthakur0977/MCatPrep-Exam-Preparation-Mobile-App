import React, { FC, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ICONS from '../../Assets/Icons';
import CustomIcon from '../../Components/CustomIcon';
import { CustomText } from '../../Components/CustomText';
import PrimaryButton from '../../Components/PrimaryButton';
import TimeSelector from '../../Components/TimeSelector';
import { DailyNotificationScreenProps } from '../../Typings/route';
import { COLORS } from '../../Utilities/Colors';
import { horizontalScale, verticalScale, wp } from '../../Utilities/Metrics';
import { fetchData, patchData } from '../../Services/ApiService';
import ENDPOINTS from '../../Services/ApiEndpoints';
import Toast from 'react-native-toast-message';
import { GetUserAcountAPiResponse } from '../../Services/ApiResponses/GetUserAcountAPiResponse';
import {
  cancelAllNotifications,
  scheduleDailyQuestionNotifications,
} from '../../Services/NotificationService';

const DailyNotification: FC<DailyNotificationScreenProps> = ({
  navigation,
}) => {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<GetUserAcountAPiResponse | null>(
    null,
  );

  const convertTimeToQotdFormat = (timeString: string): string => {
    const [time, period] = timeString.split(' ');
    const [hours] = time.split(':');
    let hour24 = parseInt(hours, 10);
    // Convert to 24-hour format
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    // Format as HHMMSS (6 digits)
    const hourStr = hour24.toString().padStart(2, '0');
    return `${hourStr}0000`;
  };

  const convertQotdToDisplayTime = (qotd: string | null): string | null => {
    if (!qotd) return null;

    const hour = parseInt(qotd.substring(0, 2), 10);

    if (hour === 6) return '6:00 AM';
    if (hour === 12) return '12:00 PM';
    if (hour === 18) return '6:00 PM';

    return null;
  };

  const handleSave = async () => {
    if (!selectedTime || isLoading) return;
    try {
      setIsLoading(true);
      const qotdTime = convertTimeToQotdFormat(selectedTime);
      await patchData(ENDPOINTS.completeOnboarding, {
        qotd: qotdTime,
      });

      // Schedule local notifications
      await scheduleDailyQuestionNotifications(qotdTime);

      Toast.show({
        type: 'success',
        text1: 'Notification Time Set',
        text2: `Daily questions will be sent at ${selectedTime}`,
      });
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      console.error('Error setting QoD time:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Set Time',
        text2: error.message || 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      await patchData(ENDPOINTS.completeOnboarding, {
        qotd: null,
      });
      // Cancel all scheduled notifications
      await cancelAllNotifications();

      Toast.show({
        type: 'success',
        text1: 'Notifications Disabled',
        text2: 'Daily question notifications have been turned off',
      });
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      console.error('Error disabling QoD notifications:', error);

      Toast.show({
        type: 'error',
        text1: 'Failed to Disable',
        text2: error.message || 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUserData = async () => {
    try {
      const response = await fetchData<GetUserAcountAPiResponse>(
        ENDPOINTS.getUSerData,
      );

      if (response.data) {
        setUserData(response.data);

        const time = convertQotdToDisplayTime(response.data.qotd);
        if (time) {
          setSelectedTime(time);
        }
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <CustomIcon
        Icon={ICONS.BackArrowIcon}
        height={20}
        width={20}
        onPress={() => navigation.goBack()}
        style={styles.backIcon}
      />
      <CustomText
        fontFamily="INTER_semiBold"
        color={COLORS.darkBlue}
        fontSize={20}
      >
        Practice makes perfect.
      </CustomText>
      <CustomText
        fontSize={14}
        fontFamily="INTER_medium"
        textAlign="center"
        style={{ width: wp(80), marginTop: verticalScale(10) }}
      >
        What time do you normally study? We can send you daily questions to help
        you prepare more effectively.
      </CustomText>

      <TimeSelector
        initialTime={selectedTime}
        onValueChange={selectedTime => setSelectedTime(selectedTime)}
      />

      <View style={styles.buttonContainer}>
        <PrimaryButton
          title="SAVE"
          onPress={handleSave}
          textSize={16}
          isLoading={isLoading}
          disabled={!selectedTime || isLoading}
        />

        <PrimaryButton
          isFullWidth={false}
          onPress={handleDisableNotifications}
          bgColor={['transparent', 'transparent']}
          title="I DON'T WANT DAILY NOTIFICATIONS"
          textColor={COLORS.grey}
          textSize={12}
          textStyle={{
            textDecorationLine: 'underline',
          }}
          disabled={isLoading}
        />
      </View>
    </SafeAreaView>
  );
};

export default DailyNotification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    paddingTop: verticalScale(20),
    paddingHorizontal: horizontalScale(15),
    paddingBottom: verticalScale(80),
  },
  backIcon: {
    alignSelf: 'flex-start',
    marginBottom: verticalScale(20),
  },
  buttonContainer: {
    gap: verticalScale(20),
  },
});
