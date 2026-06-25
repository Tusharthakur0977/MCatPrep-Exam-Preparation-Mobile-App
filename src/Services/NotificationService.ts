import notifee, { AndroidImportance, TriggerType } from '@notifee/react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { Platform } from 'react-native';

const NOTIFICATION_MESSAGES = [
  {
    title: 'We think we can stump you 🚀',
    body: 'Can you solve these questions of the day?',
  },
  {
    title: 'Practice makes perfect 🥇',
    body: 'Get some in with these questions of the day',
  },
  {
    title: 'Your dreams are only a few steps away 🏃',
    body: 'These questions may help you get there faster',
  },
  {
    title: 'Hey, wanna try cracking this nut? 🌰',
    body: 'It only takes a few minutes',
  },
  {
    title: 'Feeling the MCAT blues?☔',
    body: 'Here are new questions to cheer you up',
  },
  {
    title: "Today's challenge is here! 🌟",
    body: 'See if these questions stump you',
  },
  {
    title: 'Want to test your MCAT mettle? 📈',
    body: "Try answering today's questions now",
  },
  {
    title: "Let's rock today's questions 🏋",
    body: "Don't worry,you can do it!",
  },
  { title: 'Another challenge for you ⛳', body: 'Can you solve it?' },
  { title: 'Hello, future doctor 󰞯', body: 'Wanna try a quick challenge' },
  {
    title: "How's the practice going? 🧗",
    body: 'Add thesequestions to your progress',
  },
  {
    title: 'Searching for more practice? ✅',
    body: "We've gotjust what you need",
  },
  {
    title: "We've got some new questions for you 🎁",
    body: 'Answer them like a pro',
  },
  {
    title: "You're getting there 🚣",
    body: 'Try these questions to take another step',
  },
  { title: "How's your day going? ☀", body: 'Maybe a littlepractice can help' },
];

// Shuffle notifications (iOS limit is 64 scheduled notifications)

const shuffleNotifications = () => {
  const numberOfScheduledDays = 64;
  const currentNotifications = NOTIFICATION_MESSAGES.length;
  const numberOfIterations = Math.floor(
    numberOfScheduledDays / currentNotifications,
  );

  let aggregateList = [...NOTIFICATION_MESSAGES];
  aggregateList.sort(() => Math.random() - 0.5);

  for (let i = 0; i < numberOfIterations - 1; i++) {
    const newList = [...NOTIFICATION_MESSAGES];
    newList.sort(() => Math.random() - 0.5);
    aggregateList = aggregateList.concat(newList);
  }

  return aggregateList.slice(0, numberOfScheduledDays);
};

// Request notification permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      const authStatus = await PushNotificationIOS.requestPermissions({
        alert: true,
        badge: true,
        sound: true,
      });
      return authStatus.alert === true;
    } else {
      // Android 13+ requires runtime permission
      const settings = await notifee.requestPermission();
      return settings.authorizationStatus >= 1; // 1 = authorized, 2 = provisional
    }
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// Get initial scheduling date from hour (0-23)

const getInitialSchedulingDate = (hour: number): Date => {
  if (hour === 24) {
    hour = 0;
  }

  const now = new Date();
  const scheduledTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    0,
    0,
    0,
  );

  // If the time has already passed today, schedule for tomorrow

  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  return scheduledTime;
};

// Schedule daily question notifications

export const scheduleDailyQuestionNotifications = async (
  qotdTime: string,
): Promise<void> => {
  try {
    // Cancel existing notifications first
    await cancelAllNotifications();
    // Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return;
    }
    // Parse hour from QoD time format (HHMMSS)
    const hour = parseInt(qotdTime.substring(0, 2), 10);
    const initialDate = getInitialSchedulingDate(hour);
    // Get shuffled notifications
    const notifications = shuffleNotifications();
    // Schedule notifications
    let scheduledDate = new Date(initialDate);
    for (let i = 0; i < notifications.length; i++) {
      const notification = notifications[i];
      const randomId = Math.floor(Math.random() * 10000);
      // Only schedule if date is in the future
      if (scheduledDate > new Date()) {
        if (Platform.OS === 'ios') {
          // iOS: Use PushNotificationIOS
          PushNotificationIOS.scheduleLocalNotification({
            fireDate: scheduledDate.toISOString(),
            alertTitle: notification.title,
            alertBody: notification.body,
            userInfo: {
              type: 'qotd',
              id: randomId,
            },
            repeatInterval: 'day',
          });
        } else {
          // Android: Use notifee
          await notifee.createTriggerNotification(
            {
              id: randomId.toString(),
              title: notification.title,
              body: notification.body,
              android: {
                channelId: 'qotd-channel',
                importance: AndroidImportance.HIGH,
                pressAction: {
                  id: 'default',
                },
              },
              data: {
                type: 'qotd',
              },
            },
            {
              type: TriggerType.TIMESTAMP,
              timestamp: scheduledDate.getTime(),
              repeatFrequency: 1, // Daily
            },
          );
        }
      }
      // Move to next day
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }
    console.log(`Scheduled ${notifications.length} daily question
notifications
`);
  } catch (error) {
    console.error('Error scheduling notifications:', error);
    throw error;
  }
};
// Cancel all notifications
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.cancelAllLocalNotifications();
    } else {
      await notifee.cancelAllNotifications();
    }
    console.log('Cancelled all notifications');
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
};
// Create notification channel (Android only, call once on appstart)
export const createNotificationChannel = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'qotd-channel',
      name: 'Daily Questions',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });
  }
};
