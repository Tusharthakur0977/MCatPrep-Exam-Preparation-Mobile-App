import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import React, { FC, useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ICONS from '../Assets/Icons';
import { COLORS } from '../Utilities/Colors';
import {
  horizontalScale,
  isAndroid,
  verticalScale,
  wp,
} from '../Utilities/Metrics';
import CustomIcon from './CustomIcon';
import { CustomText } from './CustomText';
import IMAGES from '../Assets/Images';

type Tab = {
  name: string;
  icon: any;
  activIcon?: any;
  route: string;
};

const tabs: Tab[] = [
  {
    name: 'Home',
    icon: ICONS.HomeInActiveIcon,
    activIcon: ICONS.HomeActiveIcon,
    route: 'homeTab',
  },
  {
    name: 'Progress',
    icon: ICONS.ProgressInActiveIcon,
    activIcon: ICONS.ProgressActiveIcon,
    route: 'progressTab',
  },
  {
    name: 'Learn',
    icon: ICONS.LearnInActiveIcon,
    activIcon: ICONS.LearnActiveIcon,
    route: 'learnTab',
  },
  {
    name: 'Practice',
    image: IMAGES.Practice,
    activIcon: ICONS.PracticeFilledIcon,
    route: 'practiceTab',
  },
  {
    name: 'Profile',
    icon: ICONS.ProfileInActiveIcon,
    activIcon: ICONS.ProfileActiveIcon,
    route: 'profileTab',
  },
];

const BottomTabBar: FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  const currentRoute = state.routes[state.index].name;

  const handleTabPress = useCallback(
    (tab: Tab) => {
      if (currentRoute !== tab.route) {
        if (['journalTab', 'bondTab', 'profileTab'].includes(tab.route)) {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: tab.route,
                  state: { routes: [{ name: tab.route.replace('Tab', '') }] },
                },
              ],
            }),
          );
        } else {
          navigation.navigate(tab.route as never);
        }
      }
    },
    [navigation, currentRoute],
  );

  const renderTab = useCallback(
    ({ item }: { item: Tab }) => {
      const isActive = currentRoute === item.route;

      return (
        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleTabPress(item)}
          activeOpacity={0.7}
        >
          <View
            style={{
              borderRadius: verticalScale(40),
              alignItems: 'center',
              paddingHorizontal: horizontalScale(10),
              paddingVertical: verticalScale(5),
            }}
          >
            {item.name === 'Practice' && !isActive ? (
              <Image source={item.image} style={{ height: 20, width: 20 }} />
            ) : (
              <CustomIcon
                Icon={isActive && item.activIcon ? item.activIcon : item.icon}
                height={20}
                width={20}
              />
            )}
          </View>

          <CustomText
            fontSize={12}
            fontFamily={'ROBOTO_medium'}
            color={isActive ? COLORS.MCAT_Dark_Blue : '#757575'}
          >
            {item.name}
          </CustomText>
        </TouchableOpacity>
      );
    },
    [handleTabPress, currentRoute],
  );

  // useEffect(() => {
  //   const showSub = Keyboard.addListener('keyboardDidShow', () =>
  //     setKeyboardVisible(true),
  //   );
  //   const hideSub = Keyboard.addListener('keyboardDidHide', () =>
  //     setKeyboardVisible(false),
  //   );
  //   return () => {
  //     showSub.remove();
  //     hideSub.remove();
  //   };
  // }, []);

  // // Hide tab bar only on specific screens like chat
  // if (isKeyboardVisible && currentRoute === 'chats') {
  //   return null;
  // }

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom:
            verticalScale(isAndroid ? 10 : insets.bottom > 0 ? 0 : 10) +
            insets.bottom,
        },
      ]}
    >
      <FlatList
        data={tabs}
        renderItem={renderTab}
        keyExtractor={item => item.route}
        horizontal
        bounces={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContent}
      />
    </View>
  );
};

export default BottomTabBar;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.MCAT_White,
    paddingTop: verticalScale(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // borderTopLeftRadius: verticalScale(15),
    // borderTopRightRadius: verticalScale(15),
    position: 'absolute',
    bottom: 0,
    boxShadow: '0px -2px 4px rgba(206, 195, 195, 0.1)',
  },
  tabWrapper: {
    flex: 1,
  },
  tabContent: {
    flexGrow: 1,
    justifyContent: 'space-around',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    alignSelf: 'center',
    zIndex: 99,
    gap: verticalScale(5),
    width: wp(100) / 7,
  },
});
