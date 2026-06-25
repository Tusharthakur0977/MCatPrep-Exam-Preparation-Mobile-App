import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import { SafeAreaView } from 'react-native-safe-area-context';
import FONTS from '../../Assets/Fonts';
import ICONS from '../../Assets/Icons';
import BlueBubbleContainer from '../../Components/BlueBubbleContainer';
import CustomIcon from '../../Components/CustomIcon';
import { CustomText } from '../../Components/CustomText';
import PrimaryButton from '../../Components/PrimaryButton';
import { ProfileScreenProps } from '../../Typings/route';
import { COLORS } from '../../Utilities/Colors';
import { horizontalScale, verticalScale, wp } from '../../Utilities/Metrics';
import { deleteLocalStorageData } from '../../Utilities/Helpers';
import STORAGE_KEYS from '../../Utilities/Storage';
import { useAppDispatch, useAppSelector } from '../../Redux/store';
import { fetchData } from '../../Services/ApiService';
import ENDPOINTS from '../../Services/ApiEndpoints';
import { UserScheduleSettings } from '../../Services/ApiResponses/UserScheduleSettingsApiResponse';
import { useFocusEffect } from '@react-navigation/native';
import { setUSerdata } from '../../Redux/Slices/userSlice';
import { GetUserAcountAPiResponse } from '../../Services/ApiResponses/GetUserAcountAPiResponse';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

const Profile: FC<ProfileScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { userData } = useAppSelector(state => state.user);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [expandedYoutube, setExpandedYoutube] = useState(false);
  const { clearSession } = useAuth0();
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [userScheduleData, setuserScheduleData] =
    useState<UserScheduleSettings | null>(null);

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

  const profileOptions = [
    { id: 1, title: 'My Account', Icon: ICONS.UserIcon, route: 'myAccount' },
    {
      id: 2,
      title: 'Notifications',
      Icon: ICONS.NotificactionIcon,
      value: notificationEnabled ? 'ON' : 'OFF',
    },
    {
      id: 3,
      title: 'Test Date',
      Icon: ICONS.CalendarIcon,
      value: userData?.mcat_test_date ? userData.mcat_test_date : '',
      route: 'testDate',
    },
    {
      id: 4,
      title: 'Study Time Per Day',
      Icon: ICONS.AlarmIcon,
      value: `${userScheduleData?.hours ? userScheduleData.hours : ''} hours`,
      route: 'studyTime',
    },
    {
      id: 5,
      title: 'Question Of The Day',
      Icon: ICONS.AlarmIcon,
      route: 'dailyNotification',
      value: userData?.qotd && userData.qotd !== null ? 'ON' : 'OFF',
    },
    {
      id: 6,
      title: 'Bookmarked Videos',
      Icon: ICONS.BookmarksIcon,
      route: 'bookmarkedVideos',
    },
    { id: 7, title: 'Feedback', Icon: ICONS.FeedbackIcon, route: 'feedback' },
    { id: 8, title: 'Logout', Icon: ICONS.LogOutIcon, route: 'studyTime' },
    {
      id: 9,
      title: 'Privacy Policy',
      Icon: ICONS.PrivacyPolicyicon,
      link: 'https://www.medschoolcoach.com/privacy-policy/',
    },
    {
      id: 10,
      title: 'Terms And Conditions',
      Icon: ICONS.TermsAndConditionsIcon,
      link: 'https://www.medschoolcoach.com/terms-of-service/',
    },
    {
      id: 11,
      title: 'Watch us on YouTube',
      Icon: ICONS.PlayIcon,
    },
    {
      id: 12,
      title: 'Like us on Facebook',
      Icon: ICONS.facebook,
      link: 'https://www.facebook.com/MedSchoolCoach/',
    },
    {
      id: 13,
      title: 'Follow us on Instagram',
      Icon: ICONS.instagram,
      link: 'https://www.instagram.com/medschoolcoach/?hl=en',
    },
  ];

  const handleOptionPress = (item: (typeof profileOptions)[0]) => {
    if (item.title === 'Logout') {
      setLogoutVisible(true);
    } else if (item.title === 'Notifications') {
      navigation.navigate('mainStack', { screen: 'notification' });
    } else if (item.link) {
      Linking.openURL(item.link);
    } else if (item.route) {
      navigation.navigate(item.route as any);
    }
  };

  const hadnleLogOut = async () => {
    try {
      await deleteLocalStorageData(STORAGE_KEYS.AUTH0_TOKEN);
      await clearSession({ federated: true });
      // Optional: Navigate to a public screen (e.g., login screen)
      navigation.replace('splash');
    } catch (e) {
      console.log('Log out failed', e);
    }
  };

  const getUserData = async () => {
    try {
      const response = await fetchData<GetUserAcountAPiResponse>(
        ENDPOINTS.getUSerData,
      );

      if (response.data) {
        dispatch(setUSerdata(response.data));
      }
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
        setuserScheduleData(response.data);
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  useFocusEffect(
    useCallback(() => {
      handleGetUserScheduleSettings();
      getUserData();
      checkNotificationPermission().then(enabled => {
        setNotificationEnabled(enabled);
      });
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollCont}
      >
        {/* Header */}
        <View>
          <CustomText
            fontFamily="INTER_extraBold"
            fontSize={22}
            color={COLORS.blueBlack}
          >
            Profile
          </CustomText>

          {/* Options List */}
          <View style={styles.optionsList}>
            {profileOptions.map(item => {
              return (
                <View key={item.id}>
                  {item.title === 'Watch us on YouTube' ? (
                    <View style={styles.optionRow}>
                      <CustomIcon Icon={item.Icon} height={25} width={25} />
                      {/* Make the text clickable to open main link */}
                      <TouchableOpacity
                        onPress={() =>
                          Linking.openURL(
                            'https://www.youtube.com/medschoolcoach',
                          )
                        }
                        activeOpacity={0.8}
                      >
                        <CustomText
                          fontFamily="ROBOTO_regular"
                          fontSize={14}
                          color="#102B42"
                        >
                          {item.title}
                        </CustomText>
                      </TouchableOpacity>

                      {/* Arrow to toggle expand */}
                      <TouchableOpacity
                        onPress={() => setExpandedYoutube(prev => !prev)}
                        style={{ marginLeft: 'auto' }}
                        activeOpacity={0.8}
                      >
                        <CustomIcon
                          Icon={
                            expandedYoutube
                              ? ICONS.ArrowUpBlue
                              : ICONS.BlueDropdown
                          }
                          height={20}
                          width={20}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleOptionPress(item)}
                      style={styles.optionRow}
                      activeOpacity={0.6}
                    >
                      <CustomIcon Icon={item.Icon} height={20} width={20} />
                      <CustomText
                        fontFamily="ROBOTO_regular"
                        fontSize={15}
                        color="#102B42 "
                      >
                        {item.title}
                      </CustomText>
                      {item.value && (
                        <CustomText
                          fontFamily="ROBOTO_regular"
                          fontSize={14}
                          style={styles.optionValue}
                        >
                          {item.value}
                        </CustomText>
                      )}
                    </TouchableOpacity>
                  )}
                  {/* 🟢 Dropdown for YouTube */}
                  {item.title === 'Watch us on YouTube' && expandedYoutube && (
                    <View
                      style={{
                        marginLeft: horizontalScale(25),
                        gap: verticalScale(20),
                        marginBottom: verticalScale(10),
                      }}
                    >
                      {[
                        {
                          title: 'MCAT Mnemonics',
                          url: 'https://www.youtube.com/playlist?list=PLlwXx7KyNSmohIdKvbkXsraX1ukx4uSWY',
                        },
                        {
                          title: 'MCAT Flashcards',
                          url: 'https://www.youtube.com/playlist?list=PLlwXx7KyNSmrfGQtPkAg4A4DNpzfMpS1Z',
                        },
                        {
                          title: 'Pre-Med Secrets',
                          url: 'https://www.youtube.com/playlist?list=PLlwXx7KyNSmr5itfOXm1DcQyheVXf_NhH',
                        },
                      ].map((subItem, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => Linking.openURL(subItem.url)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 10,
                            marginVertical: verticalScale(10),
                          }}
                          activeOpacity={0.8}
                        >
                          <CustomIcon
                            Icon={ICONS.PlayIcon}
                            height={25}
                            width={25}
                          />
                          <CustomText fontFamily="ROBOTO_regular" fontSize={14}>
                            {subItem.title}
                          </CustomText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Invite Banner */}
          <View
            style={{
              width: wp(95),
              alignSelf: 'center',
            }}
          >
            <BlueBubbleContainer
              mainStyle={{
                borderRadius: 10,
                padding: 10,
              }}
              contentStyle={{
                flexDirection: 'row',
                paddingVertical: verticalScale(10),
              }}
            >
              <View style={{ width: '55%', zIndex: 100 }}>
                <CustomText
                  color={COLORS.MCAT_White}
                  fontSize={19}
                  fontFamily="ROBOTO_bold"
                  textAlign="center"
                >
                  Studying is Better Together
                </CustomText>
                <CustomText
                  color={COLORS.MCAT_White}
                  fontFamily="ROBOTO_bold"
                  textAlign="center"
                  fontSize={14.6}
                >
                  Give your friends MCAT Prep and we'll send you a
                </CustomText>
                <CustomText
                  color={COLORS.MCAT_White}
                  fontFamily="ROBOTO_bold"
                  textAlign="center"
                  fontSize={26}
                >
                  $100 Amazon Gift Card
                </CustomText>
                <PrimaryButton
                  bgColor={['white', 'white']}
                  onPress={() => {
                    navigation.navigate('mainStack', {
                      screen: 'buddies',
                      params: { showForm: true },
                    });
                  }}
                  title="Invite a Friend"
                  textColor={COLORS.MCAT_Dark_Blue}
                  textStyle={{
                    fontFamily: FONTS.ROBOTO_bold,
                  }}
                  style={{
                    paddingVertical: verticalScale(10),
                  }}
                  gradientStyle={{
                    width: '80%',
                    alignSelf: 'center',
                    marginTop: verticalScale(10),
                  }}
                  isFullWidth={false}
                  textSize={15}
                />
              </View>
              <CustomIcon
                Icon={ICONS.illustrationCropped}
                height={200}
                width={170}
                style={{}}
              />
            </BlueBubbleContainer>
          </View>
        </View>
      </ScrollView>
      {/* Logout Modal */}
      <Modal
        visible={logoutVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CustomText
              fontFamily="INTER_bold"
              fontSize={18}
              style={{ marginBottom: 20 }}
            >
              Are you sure you want to logout?
            </CustomText>
            <View style={styles.modalActions}>
              <Pressable
                style={[
                  styles.modalButton,
                  { backgroundColor: COLORS.MCAT_Grey },
                ]}
                onPress={() => setLogoutVisible(false)}
              >
                <CustomText
                  fontFamily="INTER_bold"
                  fontSize={16}
                  style={{ color: COLORS.white }}
                >
                  Cancel
                </CustomText>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  { backgroundColor: COLORS.MCAT_Green },
                ]}
                onPress={hadnleLogOut}
              >
                <CustomText
                  fontFamily="INTER_bold"
                  fontSize={16}
                  style={{ color: COLORS.white }}
                >
                  Logout
                </CustomText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.MCAT_White,
    paddingTop: verticalScale(10),
  },
  scrollView: {
    flex: 1,
  },
  scrollCont: {
    gap: verticalScale(20),
    paddingHorizontal: horizontalScale(15),
    paddingBottom: verticalScale(70),
  },
  optionsList: {
    marginTop: verticalScale(20),
    marginHorizontal: horizontalScale(15),
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(25),
    marginVertical: verticalScale(25),
  },
  optionValue: {
    marginLeft: 'auto',
    color: COLORS.MCAT_Green,
  },
  inviteBanner: {
    height: verticalScale(225),
    width: '100%',
    resizeMode: 'cover',
    borderRadius: 5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 25,
    width: '80%',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: horizontalScale(20),
    marginTop: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 5,
  },
});
