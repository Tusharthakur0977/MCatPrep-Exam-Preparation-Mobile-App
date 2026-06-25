import React, { FC, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import IMAGES from '../../Assets/Images';
import { CustomText } from '../../Components/CustomText';
import PrimaryButton from '../../Components/PrimaryButton';
import {
  setUSerdata,
  setUserPaymentStatus,
} from '../../Redux/Slices/userSlice';
import { useAppDispatch } from '../../Redux/store';
import ENDPOINTS from '../../Services/ApiEndpoints';
import { GetUserAcountAPiResponse } from '../../Services/ApiResponses/GetUserAcountAPiResponse';
import { fetchData } from '../../Services/ApiService';
import { SplashScreenProps } from '../../Typings/route';
import { COLORS } from '../../Utilities/Colors';
import { storeLocalStorageData } from '../../Utilities/Helpers';
import { hp, verticalScale, wp } from '../../Utilities/Metrics';
import STORAGE_KEYS from '../../Utilities/Storage';
import { fetchUserApiData } from '../../Services/UserApiService';
import { SubscriptionResponse } from '../../Services/ApiResponses/SubscriptionApiResponse';
import { setSubscription } from '../../Redux/Slices/SubscriptionDataSlice';
import { AUTH0_AUDIENCE } from '@env';

const Splash: FC<SplashScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const [showLoginButton, setShowLoginButton] = useState(false);
  const { getCredentials, authorize, user, clearSession } = useAuth0();
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use ref to track if getUserDataAndNavigate is currently running
  const isNavigatingRef = useRef(false);

  const handleLogin = async () => {
    try {
      setIsAuthenticating(true);
      const response = await authorize({
        scope: 'openid profile email offline_access api',
        audience: AUTH0_AUDIENCE,
      });

      if (response?.accessToken) {
        await storeLocalStorageData(
          STORAGE_KEYS.AUTH0_TOKEN,
          response?.accessToken,
        );

        // After successful login, the user object will be updated by Auth0Provider
        // and the useEffect will handle navigation
      } else {
        // User canceled the login
        setIsAuthenticating(false);
        Toast.show({
          type: 'info',
          text1: 'Login Canceled',
          text2: 'You can sign in anytime.',
        });
      }
    } catch (error) {
      setIsAuthenticating(false);
      console.log('Login failed with an error:', error);
      Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: 'Something went wrong. Please try again.',
      });
    }
  };

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      // Check for an existing Auth0 session
      const auth0Creds = await getCredentials();

      if (auth0Creds?.accessToken) {
        // Store the token if we have credentials
        await storeLocalStorageData(
          STORAGE_KEYS.AUTH0_TOKEN,
          auth0Creds.accessToken,
        );
        // The user object will be populated by Auth0Provider
        // and the useEffect will handle navigation
      } else {
        // No Auth0 session found, show the login button
        setShowLoginButton(true);
      }
    } catch (error) {
      console.log('Error initializing app:', error);
      // Error getting credentials (e.g., no session), show the login button
      setShowLoginButton(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserDataAndNavigate = async () => {
    // Prevent multiple calls using both state and ref
    if (hasNavigated || isNavigatingRef.current) {
      console.log('Navigation already in progress or completed, skipping...');
      return;
    }

    setLoading(true);

    try {
      isNavigatingRef.current = true;
      setIsLoading(true);
      setHasNavigated(true);

      // ✅ ENSURE TOKEN EXISTS BEFORE API CALL
      const creds = await getCredentials();
      if (!creds?.accessToken) {
        throw new Error('No valid token');
      }

      await storeLocalStorageData(STORAGE_KEYS.AUTH0_TOKEN, creds.accessToken);

      const response = await fetchData<GetUserAcountAPiResponse>(
        ENDPOINTS.getUSerData,
      );

      if (response.data) {
        // Store user data in Redux
        dispatch(setUSerdata(response.data));

        await fetchSubscriptionDetails(response.data.onboarded);
      }
    } catch (error) {
      console.log('Error fetching user data:', error);
      isNavigatingRef.current = false;

      Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: 'Oops! Something went wrong. Please try again.',
      });

      // Clear session and show login button again
      try {
        // await clearSession();
      } catch (clearError) {
        console.log('Error clearing session:', clearError);
      }
      setShowLoginButton(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscriptionDetails = async (isOnBoarded = false) => {
    try {
      const response = await fetchUserApiData<SubscriptionResponse>(
        `${ENDPOINTS.getSubscription}?type=mcat`,
      );

      //  NEW USER (onboarding) — highest priority
      if (!isOnBoarded) {
        dispatch(setSubscription(response.data));
        // navigation.replace('scheduleTimings', { activeTab: 1 });
        navigation.replace('exploreFeatures');
        return;
      }

      if (response.data.status && response.data.status === 'active') {
        dispatch(setSubscription(response.data));
        navigation.replace('mainStack', {
          screen: 'bottomTabStack',
          params: {
            screen: 'homeTab',
            params: {
              screen: 'home',
            },
          },
        });
      } else if (response.data.status && response.data.status === 'expired') {
        dispatch(setSubscription(response.data));
        navigation.replace('scheduleTimings', { activeTab: 4 });
      } else {
        navigation.replace('scheduleTimings', { activeTab: 4 });
      }
    } catch (error) {
      console.log('Soemthing went wrong', error);
      setLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial splash screen timer
  useEffect(() => {
    // Run splash screen for at least 2 seconds
    const timeout = setTimeout(() => {
      setIsSplashComplete(true);
      initializeApp();
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  // Handle user authentication state changes
  useEffect(() => {
    if (user && isSplashComplete && !hasNavigated && !isNavigatingRef.current) {
      getUserDataAndNavigate();
    }
  }, [user, isSplashComplete, hasNavigated]);

  return (
    <ImageBackground
      source={IMAGES.SplahScreen}
      style={{
        height: hp(100),
        width: wp(100),
      }}
    >
      <SafeAreaView
        edges={['bottom', 'left', 'right']}
        style={styles.container}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
            paddingTop:
              insets.top > 0
                ? insets.top + verticalScale(20)
                : verticalScale(40),
            paddingBottom: Platform.select({
              android: insets.bottom > 0 ? verticalScale(0) : verticalScale(20),
            }),
          }}
        >
          <CustomText
            fontSize={35}
            fontFamily="RUBIK_medium"
            textAlign="center"
            color={COLORS.white}
            style={{ marginTop: verticalScale(25) }}
          >
            ALL YOU NEED TO ACHIEVE MCAT SUCCESS
          </CustomText>

          {loading && (
            <ActivityIndicator size="small" color={COLORS.MCAT_White} />
          )}

          <View style={{ alignItems: 'center' }}>
            {showLoginButton && (
              <PrimaryButton
                title="Sign up or Login"
                onPress={handleLogin}
                gradientStyle={{ width: wp(90), alignSelf: 'center' }}
                bgColor={[COLORS.white, COLORS.white]}
                textColor={COLORS.MCAT_Dark_Blue}
                isLoading={isAuthenticating || isLoading}
                disabled={isAuthenticating || isLoading}
              />
            )}

            <Image
              source={IMAGES.BottomLogo}
              style={{ width: wp(40), resizeMode: 'contain' }}
            />
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
