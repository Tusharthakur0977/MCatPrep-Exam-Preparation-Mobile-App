import PushNotificationIOS from '@react-native-community/push-notification-ios';
import React, { FC, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import * as RNIap from 'react-native-iap';
import {
  ErrorCode,
  fetchProducts,
  ProductSubscriptionAndroid,
  ProductSubscriptionIOS,
  useIAP,
} from 'react-native-iap';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import ICONS from '../../Assets/Icons';
import IMAGES from '../../Assets/Images';
import CustomIcon from '../../Components/CustomIcon';
import CustomPicker from '../../Components/CustomPIcker';
import { CustomText } from '../../Components/CustomText';
import PremiumGuard from '../../Components/PremiumGuard';
import PrimaryButton from '../../Components/PrimaryButton';
import ScheduleCalendar from '../../Components/ScheduleCalendar';
import { setSubscription } from '../../Redux/Slices/SubscriptionDataSlice';
import { useAppDispatch, useAppSelector } from '../../Redux/store';
import ENDPOINTS from '../../Services/ApiEndpoints';
import { PriceData } from '../../Services/ApiResponses/ProductApiResponse';
import { SubscriptionResponse } from '../../Services/ApiResponses/SubscriptionApiResponse';
import { patchData, postData, putData } from '../../Services/ApiService';
import {
  fetchUserApiData,
  postUserApiData,
} from '../../Services/UserApiService';
import { ScheduleTimingScreenProps } from '../../Typings/route';
import { COLORS } from '../../Utilities/Colors';
import {
  deleteLocalStorageData,
  storeLocalStorageData,
} from '../../Utilities/Helpers';
import {
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from '../../Utilities/Metrics';
import STORAGE_KEYS from '../../Utilities/Storage';
import {
  ANDROID_PRODUCT_ID_ANNUAL,
  ANDROID_PRODUCT_ID_MONTHLY,
  IOS_PRODUCT_ID_ANNUAL,
  IOS_PRODUCT_ID_MONTHLY,
} from '@env';

const premiumFeatures = [
  {
    icon: ICONS.ft1,
    title: 'Recorded lectures on all MCAT topics',
    subTitle:
      'Get access to hundreds of videos taught by professionals in the top 1% to get you MCAT ready.',
  },
  {
    icon: ICONS.ft2,
    title: 'Brush up concepts with flashcards',
    subTitle:
      '2000+ flashcards with our spaced repetition algorithm to help you quickly up your game',
  },
  {
    icon: ICONS.ft3,
    title: 'Test your knowledge with question banks',
    subTitle:
      'Explore our comprehensive question bank to help you cross the finish line',
  },
];

const testiMonialsData = [
  {
    name: 'Andrea Espinosa',
    description:
      'Very easy to use, the app itself assigns you around 30 minutes worth of content review videos a day and keeps you on track for the MCAT!',
  },
  {
    name: 'James Carter',
    description:
      'The practice questions and detailed explanations helped me identify my weak areas and improve my MCAT score significantly!',
  },
  {
    name: 'Sofia Patel',
    description:
      'I love the personalized study plans and progress tracking. This app made studying for the MCAT feel manageable and effective!',
  },
];

const SLIDES = [
  {
    id: 1,
    image: IMAGES.feature1,
    title: 'Recorded lectures on all MCAT topics',
    description:
      'Get access to hundreds of videos taught by 99th percentile MCAT scorers to get you MCAT ready.',
  },
  {
    id: 2,
    image: IMAGES.feature1,
    title: 'Personalized study plan',
    description:
      'Follow a personalized MCAT study plan designed specifically for your schedule.',
  },
  {
    id: 3,
    image: IMAGES.feature1,
    title: 'Track your progress',
    description:
      'Stay on top of your prep with detailed progress tracking and analytics.',
  },
];

const flashCardBanner = [
  {
    id: '1',
    images: IMAGES.MCAT_BAnnerImage,
    heading: 'Flashcards to brush up your concepts',
    description:
      '2000+ flashcards with our spaced repitition algorithm to help you quickly step up your game.',
  },
  {
    id: '2',
    images: IMAGES.MCAT_BAnnerImage,
    heading: 'Flashcards to brush up your concepts',
    description:
      '2000+ flashcards with our spaced repitition algorithm to help you quickly step up your game.',
  },
  {
    id: '3',
    images: IMAGES.MCAT_BAnnerImage,
    heading: 'Flashcards to brush up your concepts',
    description:
      '2000+ flashcards with our spaced repitition algorithm to help you quickly step up your game.',
  },
];

const productIds = [IOS_PRODUCT_ID_MONTHLY, IOS_PRODUCT_ID_ANNUAL];
const androidProductIds = [
  ANDROID_PRODUCT_ID_MONTHLY,
  ANDROID_PRODUCT_ID_ANNUAL,
];

const ScheduleTimings: FC<ScheduleTimingScreenProps> = ({
  navigation,
  route,
}) => {
  const activeTab = route.params?.activeTab || 1;
  const [activeIndex, setActiveIndex] = useState(1);
  const [isCalendar, setIsCalendar] = useState(false);
  const [selectedTestDate, setSelectedTestDate] = useState<any>(null);
  const [selectedTimeHours, setSelectedTimeHours] = useState(4);
  const [priceLoader, setPriceLoader] = useState(false);
  const flatListRef = React.useRef<FlatList>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isPriceData, setIsPriceData] = useState<PriceData[]>([]);
  const [isCheckOutLoading, setIsCheckOutLoading] = useState(false);
  const [inAppSubscriptionList, setInAppSubscriptionList] = useState<any | []>(
    [],
  );
  const { clearSession } = useAuth0();
  const [freeTrialData, setFreeTrialData] = useState<string | null>('');
  const { userData } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  const { data } = useAppSelector(state => state.subscription);
  const [loader, setLoader] = useState(false);

  const {
    requestPurchase,
    restorePurchases,
    connected,
    verifyPurchase,
    finishTransaction,
  } = useIAP({
    onPurchaseSuccess: async purchase => {
      try {
        // Always finish transaction first
        await finishTransaction({ purchase, isConsumable: false });
        if (Platform.OS === 'ios') {
          setTimeout(() => {
            validateIOSReceipt();
          }, 3000);
        } else {
          // Android can validate immediately
          await validatePurchase(purchase);
        }
      } catch (error) {
        console.log('ERORR', error);
        // Finish transaction even on error to prevent stuck pending transactions
      } finally {
        setIsCheckOutLoading(false);
      }
    },
    onPurchaseError: async error => {
      // Always show the loading state is finished
      setIsCheckOutLoading(false);

      console.error('IAP Purchase Failed:', error.code, error.message);

      const isItemAlreadyOwnedError = error.message === 'Item is already owned';

      if (Platform.OS === 'android' && isItemAlreadyOwnedError) {
        setTimeout(() => {
          Alert.alert(
            'Subscription Already Active',
            'This subscription is currently active on your device. It is linked to a different Google Play account on this device (likely the one used by your original app account). Please ensure you are logged into the correct Google Play Store account, or switch your account within the Play Store settings to buy it again from this account.',
            [
              {
                text: 'Got It',
              },
              {
                text: 'Manage Play Accounts',
                onPress: async () => {
                  await RNIap.deepLinkToSubscriptions({
                    skuAndroid: error.productId,
                    packageNameAndroid: 'com.htd.medschoolcoach', // Your app's package name
                  });
                },
              },
            ],
          );
        }, 400);
        return;
      } else if (
        error.code === 'developer-error' &&
        error.message === 'Invalid arguments provided to the API'
      ) {
        setTimeout(() => {
          Alert.alert(
            'Subscription Conflict Detected',
            'This device has a recently cancelled subscription linked to a **different** Google Play account. Please ensure the correct account is logged into the Play Store, or wait for the existing subscription to fully expire to make a new purchase.',
            [
              {
                text: 'Got It',
              },
              {
                text: 'Manage Play Accounts',
                onPress: async () => {
                  await RNIap.deepLinkToSubscriptions({
                    skuAndroid: error.productId,
                    packageNameAndroid: 'com.htd.medschoolcoach', // Your app's package name
                  });
                },
              },
            ],
          );
        }, 400);
        return;
      } else if (error.code !== ErrorCode.UserCancelled) {
        // Default error handling for all other genuine errors
        Alert.alert('Error', error.message);
      }
    },
  });

  const validateIOSReceipt = async () => {
    try {
      await RNIap.requestReceiptRefreshIOS();

      // Give Apple time to update receipt (sandbox especially)
      await new Promise<void>(resolve => setTimeout(resolve, 2000));

      const receipt = await RNIap.getReceiptIOS();

      await postUserApiData(ENDPOINTS.subscriptionReceiptIos, {
        receipt_token: receipt,
      });

      fetchSubscriptionDetails();
    } catch (err) {
      console.log('iOS receipt validation failed', err);
    }
  };

  const validatePurchase = async (purchase: RNIap.Purchase) => {
    try {
      setLoader(true);
      if (Platform.OS === 'ios') {
        await RNIap.requestReceiptRefreshIOS();

        const receipt = await RNIap.getReceiptIOS();

        try {
          const data = { receipt_token: receipt };
          const resposne = await postUserApiData(
            ENDPOINTS.subscriptionReceiptIos,
            data,
          );
          if (resposne.data) {
            fetchSubscriptionDetails();

            await finishTransaction({
              purchase,
              isConsumable: false,
            });
          }
        } catch (error: any) {
          console.log('Something went wrong Ios', error);
          const message = error?.message ?? '';
          if (message.toLowerCase().includes('already associated')) {
            Alert.alert(
              'Apple ID Linked to Another Account',
              error.message,
              [
                {
                  text: 'Login with That Account',
                  onPress: async () => {
                    await deleteLocalStorageData(STORAGE_KEYS.AUTH0_TOKEN);
                    await clearSession({ federated: true });
                    // Optional: Navigate to a public screen (e.g., login screen)
                    navigation.replace('splash');
                  },
                },
                { text: 'Got It' },
              ],
              { cancelable: true },
            );
          }
        }
      }
      if (Platform.OS === 'android') {
        if (purchase && purchase.purchaseToken) {
          try {
            const data = {
              receipt_token: purchase.purchaseToken,
              product_id: purchase.productId,
            };
            const resposne = await postUserApiData(
              ENDPOINTS.subscriptionReceiptAndroid,
              data,
            );

            console.log('VALIDATE Android ----', resposne);

            if (resposne.data) {
              fetchSubscriptionDetails();
              await finishTransaction({
                purchase,
                isConsumable: false,
              });
            }
          } catch (error: any) {
            console.log('Something went wrong android', error);
            const message = error?.message ?? '';

            if (
              Platform.OS === 'android' &&
              message.toLowerCase().includes('already associated')
            ) {
              Alert.alert(
                'Purchase Linked to Another Account',
                message,
                [
                  {
                    text: 'Login with That Account',
                    onPress: async () => {
                      await deleteLocalStorageData(STORAGE_KEYS.AUTH0_TOKEN);
                      await clearSession({ federated: true });
                      navigation.replace('splash');
                    },
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                ],
                { cancelable: true },
              );
              return;
            }
          }
        }
      }
    } catch (error) {
      console.error('Validation failed:', error);
      setLoader(false);

      try {
        await finishTransaction({
          purchase,
          isConsumable: false,
        });
      } catch (e) {
        console.log('finishTransaction error:', e);
      }
    } finally {
      setLoader(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      console.log('Restoring purchases...');

      // Fetch all available purchases
      const purchases = await RNIap.getAvailablePurchases();

      if (!purchases || purchases.length === 0) {
        console.log('No purchases to restore');
        Alert.alert('No Purchases', 'There are no purchases to restore.');
        return;
      }

      for (const purchase of purchases) {
        console.log('RSTORE --->PURCAHES', purchase);

        // iOS: restore only non-consumed & valid receipts
        if (Platform.OS === 'ios' && purchase.purchaseToken) {
          await validatePurchase(purchase);
        }

        // Android: restore subscriptions only
        if (
          Platform.OS === 'android' &&
          purchase.purchaseToken &&
          purchase.productId
        ) {
          await validatePurchase(purchase);
        }
      }

      console.log('Restore completed successfully');
    } catch (error) {
      console.error('Restore purchases failed:', error);
    }
  };

  const updateCurrentSlideIndex = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(
      contentOffsetX / (wp(100) - verticalScale(40)),
    );
    setCurrentSlideIndex(currentIndex);
  };

  const renderStepper = () => {
    return (
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          gap: horizontalScale(10),
          paddingHorizontal: horizontalScale(15),
        }}
      >
        <CustomText fontFamily="ROBOTO_medium" color={COLORS.MCAT_Grey}>
          {activeIndex}/3
        </CustomText>

        <View
          style={{
            flex: 1,
            height: verticalScale(10),
            backgroundColor: COLORS.MCAT_Light_Blue,
            borderRadius: 10,
            flexDirection: 'row',
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.darkBlue,
              flex: activeIndex === 1 ? 0.33 : activeIndex === 2 ? 0.67 : 1,
              borderRadius: 10,
            }}
          />
        </View>
      </View>
    );
  };

  const renderCalendarView = () => {
    const handleSaveCalendarData = async (date: any = false) => {
      try {
        setActiveIndex(2);
        // }
      } catch (error) {
        console.error('Error updating metadata:', error);
      }
    };

    return (
      <View
        style={{
          paddingHorizontal: horizontalScale(15),
          alignItems: 'center',
          paddingBottom: verticalScale(30),
        }}
      >
        <Image source={IMAGES.Illustration1} style={styles.illustrationImage} />
        <View style={{ gap: verticalScale(20), alignItems: 'center', flex: 1 }}>
          <CustomText
            color={COLORS.MCAT_Black}
            fontFamily="INTER_bold"
            textAlign="center"
            fontSize={22}
            style={{ width: wp(50) }}
          >
            When are you taking the test?
          </CustomText>
          <CustomText
            fontFamily="INTER_regular"
            textAlign="center"
            fontSize={13}
            color={COLORS.voilet}
            style={{ width: wp(80) }}
          >
            By setting a test date, we are able to give you helpful suggestions
            and reminders about your upcoming test.
          </CustomText>
        </View>

        <View style={{ gap: verticalScale(15) }}>
          <PrimaryButton
            onPress={() => {
              setIsCalendar(true);
            }}
            title="SELECT TEST DATE"
            textFont="ROBOTO_bold"
            textSize={16}
          />

          <PrimaryButton
            isFullWidth={false}
            onPress={handleSaveCalendarData}
            bgColor={['transparent', 'transparent']}
            title="I DONT HAVE A TEST DATE YET"
            textColor={COLORS.grey}
            textSize={12}
            textStyle={{
              textDecorationLine: 'underline',
            }}
          />
        </View>

        <ScheduleCalendar
          isModalVisible={isCalendar}
          closeModal={() => setIsCalendar(false)}
          onPressApply={async selectedDate => {
            setSelectedTestDate(selectedDate);
            setIsCalendar(false);
            handleSaveCalendarData(selectedDate);
            setActiveIndex(2);
          }}
        />
      </View>
    );
  };

  const renderTimeView = () => {
    const handleSaveStudyTime = async (time: any = false) => {
      const hour = parseInt(time, 10);
      setSelectedTimeHours(hour);
    };

    return (
      <View
        style={{
          paddingHorizontal: horizontalScale(15),
          alignItems: 'center',
          paddingBottom: verticalScale(30),
        }}
      >
        <Image source={IMAGES.Illustration2} style={styles.illustrationImage} />
        <View style={{ gap: verticalScale(20), alignItems: 'center', flex: 1 }}>
          <CustomText
            color={COLORS.MCAT_Black}
            fontFamily="INTER_bold"
            textAlign="center"
            fontSize={22}
            style={{ width: wp(80) }}
          >
            How much time do you want to spend studying?
          </CustomText>
          <CustomText
            fontFamily="INTER_regular"
            textAlign="center"
            fontSize={13}
            color={COLORS.voilet}
          >
            By setting how much time you want to spend per day studying, we are
            able to pace your learning schedule to help you be more successful.
          </CustomText>
          <CustomPicker
            onValuesChange={hours => {
              handleSaveStudyTime(hours);
            }}
          />
        </View>

        <View style={{ gap: verticalScale(15) }}>
          <PrimaryButton
            onPress={async () => {
              try {
                const createScheduleTime = await postData(
                  ENDPOINTS.createStudySchedule,
                  {
                    hours: selectedTimeHours,
                  },
                );

                if (createScheduleTime) {
                  setActiveIndex(activeIndex + 1);
                }
              } catch (error) {
                console.log(error);
              }
            }}
            title="CONFIRM"
          />

          {selectedTestDate && (
            <CustomText
              fontFamily="INTER_medium"
              textAlign="center"
              fontSize={12}
              color={COLORS.darkBlue}
            >
              Your expected completion date is {selectedTestDate}
            </CustomText>
          )}
        </View>
      </View>
    );
  };

  const renderNotificationView = () => {
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
            await handleSaveNotificationOption(true);
          } else {
            console.log('iOS notification permission denied');
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
            await handleSaveNotificationOption(true);
          } else {
            console.log('Android notification permission denied');
          }

          return;
        }

        // Android < 13 → permission is granted by default
        if (Platform.OS === 'android' && Platform.Version < 33) {
          await handleSaveNotificationOption(true);
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    };

    const handleSaveNotificationOption = async (
      getNotification: boolean = false,
    ) => {
      if (getNotification) {
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

          if (updateScheduleSettings) {
            setActiveIndex(activeIndex + 1);
          }
        } catch (error) {
          console.error('Error updating metadata:', error);
        }
      } else {
        setActiveIndex(activeIndex + 1);
      }
    };
    return (
      <View style={{ flex: 1 }}>
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
            top: -verticalScale(20),
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#FFFFFFA6',
              justifyContent: 'space-between',
              width: wp(90),
              padding: verticalScale(10),
              borderRadius: 10,
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
            With notifications enabled, we can keep you updated on your progress
            and help you stay on track.
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
              onPress={() => requestNotificationPermission()}
              title="I’M READY"
            />

            <PrimaryButton
              isFullWidth={false}
              onPress={handleSaveNotificationOption}
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
    );
  };

  const renderSlides = ({
    item,
    index,
  }: {
    item: { name: string; description: string };
    index: number;
  }) => {
    return (
      <View key={item.name + index} style={styles.slideContainer}>
        <View style={styles.slideTextCont}>
          <CustomText
            color={COLORS.black}
            fontFamily="RUBIK_semiBold"
            textAlign="center"
            fontSize={14}
          >
            {item?.name}
          </CustomText>
          <CustomText
            color={COLORS.black}
            fontFamily="RUBIK_italic"
            textAlign="center"
            fontSize={10}
          >
            {item?.description}
          </CustomText>
        </View>
      </View>
    );
  };

  const formatAndroidTrialText = (period?: string | any) => {
    if (!period) return '';

    const normalized = period.toUpperCase(); // 👈 important

    const match = normalized.match(/P(\d+)([DWMY])/);
    if (!match) return '';

    let length = Number(match[1]);
    let unit = match[2];

    // Handle Android returning P7D instead of P1W
    if (unit === 'D' && length % 7 === 0) {
      length = length / 7;
      unit = 'W';
    }

    const unitMap: Record<string, string> = {
      D: 'DAY',
      W: 'WEEK',
      M: 'MONTH',
      Y: 'YEAR',
    };

    const label = unitMap[unit];
    if (!label) return '';

    const finalUnit = length > 1 ? `${label}S` : label;
    return `TRY FREE FOR ${length} ${finalUnit}`;
  };

  useEffect(() => {
    if (!selectedPlan || !inAppSubscriptionList.length) return;

    const subscription = inAppSubscriptionList.find(
      (sub: any) => sub.id === selectedPlan,
    );

    if (!subscription) return;

    const { introductoryPeriod, introductoryPeriodLength } =
      getPriceDetails(subscription);

    if (Platform.OS === 'android') {
      const text = formatAndroidTrialText(introductoryPeriod);
      if (text) {
        requestAnimationFrame(() => {
          setFreeTrialData(text);
        });
      }
      return;
    }

    if (Platform.OS === 'ios') {
      if (introductoryPeriod && introductoryPeriodLength) {
        setFreeTrialData(
          `TRY FREE FOR ${introductoryPeriodLength} ${introductoryPeriod.toUpperCase()}`,
        );
      }
    }
  }, [selectedPlan, inAppSubscriptionList]);

  const handleFetchSubscription = async () => {
    try {
      setPriceLoader(true);

      const subscriptions = await fetchProducts({
        skus:
          Platform.OS === 'ios'
            ? (productIds as string[])
            : (androidProductIds as string[]), // Use the defined productIds
        type: 'subs',
      });

      if (subscriptions && subscriptions?.length > 0) {
        setInAppSubscriptionList(subscriptions);

        const response = await fetchUserApiData<any>(
          `${ENDPOINTS.getPrices}?type=mcat&platform=${Platform.OS}&limit=100`,
        );

        if (response.data.data) {
          let products = response.data.data;
          const searchTerm =
            Platform.OS === 'ios' ? 'pricingchanges' : 'newprice';
          products = products.filter((p: PriceData) =>
            p.plan_id.includes(searchTerm),
          );
          products = products.filter(
            (p: PriceData) =>
              p.plan_id.includes('7daystrial') &&
              !p.plan_id.includes('discount'),
          );
          products = products.filter((p: PriceData) => {
            const planId = p.plan_id.toLowerCase();
            return (
              (planId.includes('month') ||
                planId.includes('annual') ||
                planId.includes('year')) &&
              p.active === 1
            );
          });
          if (products && products.length > 0) {
            setSelectedPlan(products[0].plan_id);
          }

          setIsPriceData(products);
        }
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    } finally {
      setPriceLoader(false);
    }
  };

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await fetchUserApiData<SubscriptionResponse>(
        `${ENDPOINTS.getSubscription}?type=mcat`,
      );

      if (response.data.status && response.data.status === 'active') {
        dispatch(setSubscription(response.data));
        // const completedOnboarding = await patchData(
        //   ENDPOINTS.completeOnboarding,
        // );
        navigation.replace('mainStack', {
          screen: 'bottomTabStack',
          params: {
            screen: 'homeTab',
            params: {
              screen: 'home',
            },
          },
        });
      }
    } catch (error) {
      console.log('Soemthing went wrong');
    }
  };

  const getPriceDetails = (
    subscription: ProductSubscriptionAndroid | ProductSubscriptionIOS,
  ) => {
    if (Platform.OS === 'ios') {
      const iosSubscription = subscription as ProductSubscriptionIOS;

      return {
        mainPrice: iosSubscription.displayPrice,
        introductoryPrice: iosSubscription.introductoryPriceAsAmountIOS,
        introductoryPeriod:
          iosSubscription.introductoryPriceSubscriptionPeriodIOS,
        introductoryPeriodLength:
          iosSubscription.introductoryPriceNumberOfPeriodsIOS,
        currency: iosSubscription.currency,
        purchaseId: iosSubscription.id,
        length: iosSubscription.subscriptionPeriodUnitIOS,
      };
    } else {
      const androidSubscription = subscription as ProductSubscriptionAndroid;

      // Android: Find both introductory and recurring phases
      let mainPrice = androidSubscription.displayPrice;
      let introOffer: { price: string; period: string } | null = null;
      let offerToken: string | undefined = undefined; // New field for Android purchase
      let purchaseId = androidSubscription.id; // Default to main ID

      const offerDetails =
        (androidSubscription.subscriptionOfferDetailsAndroid || [])[0];

      if (offerDetails) {
        const pricingPhases = offerDetails.pricingPhases?.pricingPhaseList;
        offerToken = offerDetails.offerToken; // Get the offer token
        purchaseId = offerDetails.basePlanId; // Use base plan ID

        if (pricingPhases && pricingPhases.length > 0) {
          const introductoryPhase = pricingPhases.find(
            phase => phase.recurrenceMode === 2,
          );

          if (introductoryPhase) {
            introOffer = {
              price: introductoryPhase.formattedPrice,
              period: introductoryPhase.billingPeriod,
            };
          }

          const recurringPhase = pricingPhases.find(
            phase => phase.recurrenceMode === 1,
          );

          if (recurringPhase) {
            mainPrice = recurringPhase.formattedPrice;
          } else {
            mainPrice = pricingPhases[pricingPhases.length - 1].formattedPrice;
          }
        }
      }

      return {
        mainPrice,
        introductoryPrice: introOffer?.price,
        introductoryPeriod: introOffer?.period,
        currency: androidSubscription.currency,
        offerToken, // Added offerToken
        purchaseId, // Added purchaseId (Base Plan ID)
        length: 'Month',
      };
    }
  };

  const renderPlans = () => {
    return (
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={{
          width: wp(100),
        }}
        contentContainerStyle={{
          paddingHorizontal: horizontalScale(20),
          gap: verticalScale(20),
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <CustomText fontSize={32} fontFamily="RUBIK_semiBold">
            Crack the MCAT {'\n'}with{' '}
            <CustomText
              fontSize={32}
              fontFamily="RUBIK_semiBold"
              color={COLORS.darkBlue}
            >
              Premium
            </CustomText>
          </CustomText>
          <TouchableOpacity
            onPress={async () => {
              await storeLocalStorageData(STORAGE_KEYS.IS_SCHEDULED, true);
              navigation.replace('mainStack', {
                screen: 'bottomTabStack',
                params: {
                  screen: 'homeTab',
                  params: {
                    screen: 'home',
                  },
                },
              });
            }}
            style={{
              padding: 10,
              backgroundColor: COLORS.MCAT_White,
              borderRadius: 100,
              boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px',
            }}
          >
            <CustomIcon Icon={ICONS.CrossIcon} height={16} width={16} />
          </TouchableOpacity>
        </View>

        {/* Features List */}
        <View
          style={{
            gap: verticalScale(20),
            paddingHorizontal: horizontalScale(10),
            paddingVertical: verticalScale(10),
            borderRadius: 10,
          }}
        >
          {premiumFeatures.map(item => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: horizontalScale(15),
              }}
              key={item.title}
            >
              <CustomIcon
                Icon={item.icon}
                height={verticalScale(38)}
                width={verticalScale(38)}
              />
              <View
                style={{
                  flex: 1,
                  gap: verticalScale(4),
                }}
              >
                <CustomText
                  fontFamily="RUBIK_bold"
                  fontSize={14}
                  color={COLORS.black}
                  ellipsizeMode="tail"
                >
                  {item.title}
                </CustomText>
                <CustomText fontFamily="RUBIK_regular" fontSize={12}>
                  {item.subTitle}
                </CustomText>
              </View>
            </View>
          ))}
        </View>

        {/* Testimonials */}
        <View
          style={{ position: 'relative', marginVertical: verticalScale(15) }}
        >
          <FlatList
            ref={flatListRef}
            data={testiMonialsData}
            renderItem={renderSlides}
            onMomentumScrollEnd={updateCurrentSlideIndex}
            showsHorizontalScrollIndicator={false}
            horizontal
            pagingEnabled
          />
          <View style={styles.indicatorCont}>
            {testiMonialsData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  currentSlideIndex == index && {
                    backgroundColor: COLORS.darkBlue,
                    transform: [{ scale: 1.3 }],
                  },
                ]}
              />
            ))}
          </View>
          <CustomIcon
            Icon={ICONS.StarIcon}
            height={28}
            width={28}
            style={{
              position: 'absolute',
              top: '70%', // Center vertically
              left: 0, // Center horizontally
              transform: [
                { translateX: -horizontalScale(14) },
                { translateY: -verticalScale(14) },
              ], // Offset by half icon size
              zIndex: 2, // Ensure StarIcon is on top
            }}
          />
          <CustomIcon
            Icon={ICONS.EmojiIcon}
            height={28}
            width={28}
            style={{
              position: 'absolute',
              top: '30%', // Center vertically
              right: -20, // Center horizontally
              transform: [
                { translateX: -horizontalScale(14) },
                { translateY: -verticalScale(14) },
              ], // Offset by half icon size
              zIndex: 2, // Ensure StarIcon is on top
            }}
          />
        </View>

        {/* Plans */}
        {priceLoader ? (
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              alignItems: 'center',
              gap: horizontalScale(10),
            }}
          >
            {/* Loader Box 1 */}
            <View
              style={{
                width: '45%',
                height: hp(11),

                backgroundColor: '#E9EEF8',
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator size="large" color={COLORS.MCAT_Dark_Blue} />
            </View>

            {/* Loader Box 2 */}
            <View
              style={{
                width: '45%',
                height: hp(11),
                backgroundColor: '#E9EEF8',
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator size="large" color={COLORS.MCAT_Dark_Blue} />
            </View>
          </View>
        ) : (
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              alignItems: 'center',
              gap: horizontalScale(10),
            }}
          >
            {isPriceData.map((plan, index) => {
              const selected = selectedPlan === plan.plan_id;

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedPlan(plan.plan_id);
                  }}
                  style={{
                    alignItems: 'center',
                    backgroundColor: '#E9EEF8',
                    paddingTop: verticalScale(20),
                    paddingBottom: verticalScale(10),
                    paddingHorizontal: horizontalScale(15),
                    gap: verticalScale(10),
                    borderWidth: selected ? 2 : 0,
                    borderColor:
                      selected && plan.name === 'Monthly Plan'
                        ? COLORS.MCAT_Dark_Blue
                        : selected && plan.name === 'Annual Plan'
                        ? COLORS.MCAT_Yellow
                        : 'transparent',

                    borderRadius: 10,
                  }}
                >
                  <View
                    style={{
                      backgroundColor:
                        plan.name === 'Monthly Plan'
                          ? COLORS.MCAT_Dark_Blue
                          : COLORS.MCAT_Yellow,
                      paddingVertical: verticalScale(5),
                      paddingHorizontal: horizontalScale(10),
                      position: 'absolute',
                      top: -verticalScale(20),
                      borderRadius: 6,
                      width: '100%',
                      alignSelf: 'center',
                    }}
                  >
                    <CustomText
                      fontSize={10}
                      fontFamily="RUBIK_medium"
                      color={COLORS.white}
                      textAlign="center"
                    >
                      {plan.description}
                    </CustomText>
                  </View>

                  {/* <CustomText
                  fontSize={12}
                  fontFamily="RUBIK_regular"
                  color={COLORS.black}
                >
                  3 days free
                </CustomText> */}
                  <CustomText
                    fontSize={24}
                    fontFamily="RUBIK_semiBold"
                    color={COLORS.black}
                    style={{ marginTop: verticalScale(5) }}
                  >
                    ${(plan.price / 100).toFixed(2)}
                    <CustomText>
                      {' '}
                      <CustomText
                        fontSize={12}
                        fontFamily="RUBIK_regular"
                        color={COLORS.black}
                      >
                        {plan.name === 'Monthly Plan' ? '/ Mo' : '/ Year'}
                      </CustomText>
                    </CustomText>
                  </CustomText>
                  <CustomText
                    fontSize={12}
                    fontFamily="RUBIK_regular"
                    color={COLORS.black}
                  >
                    {plan.name === 'Monthly Plan'
                      ? 'Billed Monthly'
                      : 'Billed Annualy'}
                  </CustomText>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <TouchableOpacity
          style={{
            backgroundColor: COLORS.green,
            paddingVertical: verticalScale(14),
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 30,
          }}
          onPress={async () => {
            const offerToken = getAndroidOfferToken(selectedPlan);
            handleBuySubscription(selectedPlan, offerToken);
          }}
        >
          {loader ? (
            <ActivityIndicator color={COLORS.MCAT_White} size="small" />
          ) : (
            <CustomText
              fontFamily="INTER_semiBold"
              fontSize={13}
              color={COLORS.MCAT_White}
            >
              {freeTrialData ||
              selectedPlan === 'subscription.monthly.newprice.7daystrial'
                ? 'TRY FREE FOR 1 WEEK'
                : 'TRY FREE FOR 1 WEEK'}
            </CustomText>
          )}
        </TouchableOpacity>

        <View style={{ gap: verticalScale(20), alignItems: 'center' }}>
          {/* <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: horizontalScale(5),
            }}
          >
            <CustomIcon Icon={ICONS.BlueTickIcon} height={12} width={12} />
            <CustomText fontSize={11} fontFamily="RUBIK_light">
              You won’t be charged if you cancel within 3 days, try RISK-FREE.
            </CustomText>
          </View> */}
          <CustomText fontSize={11} fontFamily="INTER_light">
            Read more about terms and conditions{' '}
            <CustomText
              fontSize={11}
              fontFamily="INTER_semiBold"
              style={{ textDecorationLine: 'underline' }}
              onPress={() => {}}
            >
              here
            </CustomText>
          </CustomText>

          <PrimaryButton
            isFullWidth={false}
            onPress={() => {
              // setActiveIndex(2);
              handleRestorePurchases();
            }}
            bgColor={['transparent', 'transparent']}
            title="Restore Purchase"
            textColor={COLORS.green}
            textSize={10}
            textStyle={{
              textDecorationLine: 'underline',
            }}
          />
        </View>
      </ScrollView>
    );
  };

  const completeOnboarding = async () => {
    try {
      const completedOnboarding = await patchData(
        ENDPOINTS.completeOnboarding,
        {
          onboarded: true,
          mcatTestDate: selectedTestDate,
          qotd: true,
        },
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleBuySubscription = async (
    planId: string | any,
    offerToken: string,
  ) => {
    setIsCheckOutLoading(true);

    try {
      if (Platform.OS === 'android') {
        if (!offerToken) {
          throw new Error('Missing offer token for Android subscription');
        }

        const androidPayload: RNIap.RequestSubscriptionAndroidProps = {
          skus: [planId],
          obfuscatedAccountIdAndroid: userData?.id,
          obfuscatedProfileIdAndroid: userData?.id,
          subscriptionOffers: [
            {
              sku: planId,
              offerToken: offerToken,
            },
          ],
        };
        await requestPurchase({
          request: {
            android: androidPayload,
          },
          type: 'subs',
        });
      } else {
        await requestPurchase({
          request: {
            ios: {
              sku: planId,
            },
          },
          type: 'subs',
        });
      }
    } catch (err: any) {
      console.warn('requestPurchase failed:', err);
      Alert.alert('Subscription Failed', err.message);
    } finally {
      setIsCheckOutLoading(false);
    }
  };

  const getAndroidOfferToken = (planId: string | null) => {
    if (Platform.OS !== 'android' || !planId) return undefined;

    const subscription = inAppSubscriptionList.find(
      (sub: ProductSubscriptionAndroid) => sub.id === planId,
    );

    if (!subscription?.subscriptionOfferDetailsAndroid?.length) {
      return undefined;
    }

    // Prefer free-trial offer if available
    const trialOffer = subscription.subscriptionOfferDetailsAndroid.find(
      (offer: any) =>
        offer.pricingPhases.pricingPhaseList.some(
          (phase: any) => phase.priceAmountMicros === '0',
        ),
    );

    return (
      trialOffer?.offerToken ??
      subscription.subscriptionOfferDetailsAndroid[0].offerToken
    );
  };

  useEffect(() => {
    if (connected) {
      if (Platform.OS === 'ios') {
        RNIap.clearTransactionIOS()
          .then(() => console.log('Cleared stuck iOS transactions.'))
          .catch(e => console.warn('Failed to clear iOS transactions:', e));
      }

      // loadSubscriptions();

      RNIap.getAvailablePurchases()
        .then(purchases => {
          purchases.forEach(purchase => {
            // console.log('Finishing pending transaction for:', purchase);
            RNIap.finishTransaction({ purchase });
          });
        })
        .catch(e => console.error('Error checking available purchases', e));
    }
  }, [connected]);

  useEffect(() => {
    if (activeIndex === 4) {
      completeOnboarding();
      // getStripePLans();
      handleFetchSubscription();
      data?.status &&
        data.status === 'expired' &&
        Toast.show({
          type: 'error',
          text1: 'Your subscription has expired. Please renew to continue.',
        });
    }
  }, [activeIndex]);

  useEffect(() => {
    if (activeTab) {
      setActiveIndex(activeTab);
    }
  }, [activeTab]);

  return (
    <SafeAreaView style={styles.container}>
      {activeTab !== 4 ? (
        <PremiumGuard>
          {activeIndex < 3 && renderStepper()}
          {activeIndex === 1 && renderCalendarView()}
          {activeIndex === 2 && renderTimeView()}
          {activeIndex === 3 && renderNotificationView()}
          {activeIndex === 4 && renderPlans()}
        </PremiumGuard>
      ) : (
        renderPlans()
      )}
    </SafeAreaView>
  );
};

export default ScheduleTimings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    paddingVertical: verticalScale(20),
    paddingHorizontal: horizontalScale(15),
  },

  illustrationImage: {
    height: hp(30),
    resizeMode: 'contain',
    width: wp(50),
    borderRadius: verticalScale(10),
  },

  slideContainer: {
    alignItems: 'center',
    backgroundColor: '#F3F7FD',
  },
  slideTextCont: {
    gap: verticalScale(10),
    alignItems: 'center',
    width: wp(100) - verticalScale(40),
    paddingHorizontal: horizontalScale(30),
    paddingVertical: verticalScale(10),
  },

  indicatorCont: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: verticalScale(10),
  },

  indicator: {
    height: verticalScale(6),
    width: verticalScale(20),
    backgroundColor: COLORS.lightBlue,
    marginHorizontal: horizontalScale(5),
    borderRadius: 100,
  },

  sectionBMain: {
    paddingHorizontal: horizontalScale(20),
    gap: verticalScale(15),
  },
  priceCardContainer: {
    backgroundColor: '#E9EEF8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(5),
    paddingHorizontal: horizontalScale(5),
    borderRadius: 4,
    alignItems: 'center',
  },
  flashCardTextView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(20),
  },
  slideNumContainer: {
    backgroundColor: '#425457',
    paddingHorizontal: horizontalScale(5),
    paddingVertical: verticalScale(2),
    borderRadius: 6,
  },
  flashCardView: {
    paddingHorizontal: horizontalScale(20),
    gap: verticalScale(20),
    paddingVertical: verticalScale(30),
  },
});
