import { ActivityIndicator, View } from 'react-native';
import { useAppSelector } from '../Redux/store';
import { useEffect, useState } from 'react';
import { COLORS } from '../Utilities/Colors';
import { useNavigation } from '@react-navigation/native';

interface PremiumGuardProps {
  children: React.ReactNode;
}

const PremiumGuard: React.FC<PremiumGuardProps> = ({ children }) => {
  const navigation = useNavigation();
  const { data: subscription } = useAppSelector(state => state.subscription);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, [subscription]);

  const checkSubscription = () => {
    setIsChecking(false);
    // If no subscription data, redirect to subscription screen
    if (!subscription) {
      navigation.replace('scheduleTimings', { activeTab: 4 });
      return;
    }
    // Check if user has active subscription OR is in free trial
    const isActive = subscription.status === 'active';
    const isInFreeTrial =
      subscription.trial_ends_at &&
      new Date(subscription.trial_ends_at) > new Date();
    // If subscription is not active AND not in free trial,
    if (!isActive && !isInFreeTrial) {
      navigation.replace('scheduleTimings', { activeTab: 4 });
      return;
    }
  };

  // Show loading while checking
  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.MCAT_Dark_Blue} />
      </View>
    );
  }

  // Check if user has active subscription OR is in free trial
  const isActive = subscription?.status === 'active';
  const isInFreeTrial =
    subscription?.trial_ends_at &&
    new Date(subscription.trial_ends_at) > new Date();

  // Only render children if subscription is active OR user is in free trial

  if (isActive || isInFreeTrial) {
    return <>{children}</>;
  }

  // If subscription check fails, return null (user will be redirected)

  return null;
};
export default PremiumGuard;
