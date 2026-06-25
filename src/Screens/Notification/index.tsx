import React, { FC, useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ICONS from '../../Assets/Icons';
import IMAGES from '../../Assets/Images';
import CustomIcon from '../../Components/CustomIcon';
import { CustomText } from '../../Components/CustomText';
import PrimaryButton from '../../Components/PrimaryButton';
import {
  DailyNotificationScreenProps,
  NotificationsProps,
} from '../../Typings/route';
import { COLORS } from '../../Utilities/Colors';
import {
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from '../../Utilities/Metrics';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { useFocusEffect } from '@react-navigation/native';
import { putData } from '../../Services/ApiService';
import ENDPOINTS from '../../Services/ApiEndpoints';

const Notifications: FC<NotificationsProps> = ({ navigation }) => {
  const [selectedTime, setSelectedTime] = useState<any>(null);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  const checkNotificationPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'ios') {
        return new Promise(resolve => {
          PushNotificationIOS.checkPermissions(permissions => {
            const enabled =
              permissions.alert === true ||
              permissions.badge === true ||
              permissions.sound === true;

            resolve(enabled);
          });
        });
      }

      // ANDROID
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          return granted;
        }

        // Android < 13 → notifications enabled by default
        return true;
      }

      return false;
    } catch (error) {
      console.log('Permission check error', error);
      return false;
    }
  };

  console.log('IS', notificationEnabled);

  const requestNotificationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await PushNotificationIOS.requestPermissions({
          alert: true,
          badge: true,
          sound: true,
        });

        // iOS returns an object { alert: boolean, badge: boolean, sound: boolean }
        const granted =
          authStatus.alert === true ||
          authStatus.badge === true ||
          authStatus.sound === true;

        if (granted) {
          console.log('iOS notification permission granted');
          await handleSaveNotificationOption();
        } else {
          console.log('iOS notification permission denied');
          Alert.alert(
            'Notifications Disabled',
            'Please enable notifications in Settings to receive updates.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Open Settings',
                onPress: () => {
                  Linking.openSettings();
                },
              },
            ],
          );
        }

        return;
      }

      // ANDROID
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );

        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Android notification permission granted');
          await handleSaveNotificationOption();
        } else {
          console.log('Android notification permission denied');
        }

        return;
      }

      // Android < 13 → permission is granted by default
      if (Platform.OS === 'android' && Platform.Version < 33) {
        await handleSaveNotificationOption();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const handleSaveNotificationOption = async () => {
    try {
      const updateScheduleSettings = await putData(
        ENDPOINTS.updateNotificationSettings,
        {
          push_notifications: true,
          email_notifications: true,
          study_reminders: false,
          question_of_the_day: false,
          weekly_progress: false,
        },
      );
      navigation.goBack();
    } catch (error) {
      console.error('Error updating metadata:', error);
    }
  };

  const handleOffNotification = async () => {
    try {
      // First update backend to disable notifications
      await putData(ENDPOINTS.updateNotificationSettings, {
        push_notifications: false,
        email_notifications: false,
        study_reminders: false,
        question_of_the_day: false,
        weekly_progress: false,
      });

      // Show alert with option to go to settings
      Alert.alert(
        'Turn Off Notifications',
        'To completely disable notifications, please turn them off in your device settings.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              // User cancelled, just update state
              // setNotificationEnabled(false);
              navigation.goBack();
            },
          },
          {
            text: 'Go to Settings',
            onPress: () => {
              // Update state and navigate back
              // setNotificationEnabled(false);

              // Open device settings
              Linking.openSettings().catch(err => {
                console.error('Failed to open settings:', err);
                Alert.alert(
                  'Error',
                  'Could not open settings. Please open it manually.',
                );
              });

              navigation.goBack();
            },
          },
        ],
        { cancelable: false },
      );
    } catch (error) {
      console.error('Error disabling notifications:', error);
      Alert.alert(
        'Error',
        'Failed to update notification settings. Please try again.',
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkNotificationPermission().then(enabled => {
        setNotificationEnabled(enabled);
      });
    }, []),
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <ScrollView
        horizontal={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
        }}
        alwaysBounceHorizontal={false}
        bounces={false}
        scrollEnabled
      >
        <View
          style={{
            flex: 1,
            paddingVertical: verticalScale(30),
          }}
        >
          <Image
            source={IMAGES.Bubblebackground}
            style={{ height: hp(20), width: wp(100) }}
          />

          <View
            style={{
              position: 'absolute',
              width: wp(100),
              alignItems: 'center',
              gap: verticalScale(20),
              // top: -verticalScale(10),
              zIndex: 10,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: '#FFFFFFA6',
                // backgroundColor: 'red',
                justifyContent: 'space-between',
                width: wp(90),
                padding: verticalScale(10),
                borderRadius: 10,
                zIndex: 1000,
              }}
            >
              <View style={{ gap: verticalScale(2) }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: horizontalScale(5),
                  }}
                >
                  <CustomIcon
                    Icon={ICONS.AppLogo}
                    height={verticalScale(19)}
                    width={verticalScale(19)}
                  />
                  <CustomText
                    fontSize={12}
                    fontFamily="RUBIK_regular"
                    color={'#838383'}
                  >
                    MCAT PREP APP
                  </CustomText>
                </View>
                <CustomText fontSize={14} fontFamily="RUBIK_bold">
                  Another challenge for you ⛳
                </CustomText>
                <CustomText fontSize={14} fontFamily="RUBIK_regular">
                  Can you solve it?
                </CustomText>
              </View>
              <View
                style={{
                  gap: verticalScale(5),
                  alignItems: 'flex-end',
                }}
              >
                <CustomText
                  fontSize={12}
                  fontFamily="RUBIK_regular"
                  color={'#838383'}
                >
                  3m ago
                </CustomText>
                <CustomIcon
                  Icon={ICONS.NotificationImage}
                  height={verticalScale(35)}
                  width={verticalScale(35)}
                />
              </View>
            </View>

            <View
              style={{
                width: wp(90),
                padding: verticalScale(10),
                borderRadius: 10,
                backgroundColor: COLORS.MCAT_White,
                gap: verticalScale(10),
              }}
            >
              <CustomIcon Icon={ICONS.QuotesSign} width={18} height={14} />

              <CustomText
                fontFamily="RUBIK_semiBold"
                fontSize={24}
                style={{
                  paddingHorizontal: horizontalScale(30),
                }}
              >
                Students who follow a study plan are{' '}
                <CustomText
                  fontFamily="RUBIK_semiBold"
                  fontSize={24}
                  color={COLORS.MCAT_Dark_Blue}
                >
                  1.5 times
                </CustomText>{' '}
                more likely to score in the{' '}
                <CustomText
                  fontFamily="RUBIK_semiBold"
                  fontSize={24}
                  color={COLORS.MCAT_Dark_Blue}
                >
                  top 25%
                </CustomText>{' '}
                on the MCAT than those who do not
              </CustomText>
            </View>
            <CustomText
              textAlign="center"
              fontSize={13}
              fontFamily="RUBIK_regular"
              style={{
                paddingHorizontal: horizontalScale(50),
                marginTop: verticalScale(40),
              }}
            >
              With notifications enabled, we can keep you updated on your
              progress and help you stay on track.
            </CustomText>
          </View>

          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
            }}
          >
            <View
              style={{
                gap: verticalScale(15),
                paddingHorizontal: horizontalScale(15),
              }}
            >
              <PrimaryButton
                onPress={async () => {
                  if (notificationEnabled) {
                    navigation.goBack();
                  } else {
                    await requestNotificationPermission();
                  }
                }}
                title="I’M READY"
              />

              <PrimaryButton
                isFullWidth={false}
                onPress={handleOffNotification}
                bgColor={['transparent', 'transparent']}
                title="I DON’T WANT NOTIFICATIONS"
                textColor={COLORS.grey}
                textSize={12}
                textStyle={{
                  textDecorationLine: 'underline',
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    paddingTop: verticalScale(20),
    // paddingHorizontal: horizontalScale(15),
    paddingBottom: verticalScale(40),
  },
  backIcon: {
    alignSelf: 'flex-start',
    marginBottom: verticalScale(20),
  },
  buttonContainer: {
    gap: verticalScale(20),
  },
  scrollCont: {
    gap: verticalScale(20),
    paddingHorizontal: horizontalScale(15),
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
  },
});
