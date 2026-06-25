import { AUTH0_CLIENT_ID, AUTH_DOMAIN } from '@env';
import notifee from '@notifee/react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import React, { useEffect } from 'react';
import { Appearance, LogBox, StatusBar } from 'react-native';
import { Auth0Provider } from 'react-native-auth0';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { endConnection, initConnection } from 'react-native-iap';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import NetworkLogger from './src/Components/NetworkLogger';
import Routes from './src/Routes';
import { createNotificationChannel } from './src/Services/NotificationService';
import { COLORS } from './src/Utilities/Colors';
import toastConfig from './src/Utilities/ToastConfigs';

Appearance.setColorScheme('light');
LogBox.ignoreAllLogs();
const App = () => {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // 1. Initialize the connection
    const initializeIAP = async () => {
      try {
        const result = await initConnection();
        // 2. Set the state only upon success
      } catch (error) {
        console.error('[IAP Error] initConnection failed:', error);
      }
    };

    initializeIAP();
    // Cleanup: Disconnect when the component unmounts
    return () => {
      endConnection();
      console.log('IAP Connection ended.');
    };
  }, []);

  // Call once on app start (Android only, but safe to call on iOS)
  useEffect(() => {
    createNotificationChannel();
  }, []);

  useEffect(() => {
    const notificationListener: any = PushNotificationIOS.addEventListener(
      'notification',
      notification => {
        if (notification.getData().type === 'qotd') {
          // Navigate to Question of the Day screen
          // Add navigation logic here
        }
      },
    );
    return () => {
      notificationListener.remove();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === 1 && detail.notification?.data?.type === 'qotd') {
        // Navigate to Question of the Day screen
        // Add navigation logic here
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Auth0Provider domain={AUTH_DOMAIN} clientId={AUTH0_CLIENT_ID}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.MCAT_White}
        />
        <Routes />
        <Toast
          config={toastConfig}
          visibilityTime={4000}
          autoHide={true}
          topOffset={insets.top + 20}
        />
        {__DEV__ && <NetworkLogger />}
      </Auth0Provider>
    </GestureHandlerRootView>
  );
};

export default App;
