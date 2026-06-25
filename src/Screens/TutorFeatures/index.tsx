import axios from 'axios';
import React, { FC, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import ICONS from '../../Assets/Icons';
import CustomIcon from '../../Components/CustomIcon';
import { CustomText } from '../../Components/CustomText';
import ContactPopup from '../../Components/Modal/ContactPopup';
import PrimaryButton from '../../Components/PrimaryButton';
import TutorSlides from '../../Seeds/TutorSlides';
import { TutoerFeaturesProps } from '../../Typings/route';
import { COLORS } from '../../Utilities/Colors';
import {
  deviceWidth,
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from '../../Utilities/Metrics';

const TutorFeatures: FC<TutoerFeaturesProps> = ({ navigation }) => {
  const flatListRef = React.useRef<FlatList>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);
  const [checked, setChecked] = useState(false);
  const insets = useSafeAreaInsets();
  const { user, getCredentials } = useAuth0();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const advanceSlide = () => {
    setCurrentSlideIndex(prevIndex => {
      const nextSlideIndex = (prevIndex + 1) % TutorSlides.length;
      const offset = nextSlideIndex * deviceWidth;

      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset, animated: true });
      }
      return nextSlideIndex;
    });
  };

  const handleModalSelect = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsModalVisible(true);
  };

  const handleGetStarted = () => {
    setIsModalVisible(false);
    goToNextSlide();
  };

  const updateCurrentSlideIndex = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / deviceWidth);
    setCurrentSlideIndex(currentIndex);

    // Reset the timer when the user manually scrolls
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        advanceSlide();
      }, 3000);
    }
  };

  const goToNextSlide = async () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex != TutorSlides.length) {
      const offset = nextSlideIndex * deviceWidth;

      if (flatListRef.current) {
        flatListRef?.current.scrollToOffset({ offset });
        setCurrentSlideIndex(currentSlideIndex + 1);

        intervalRef.current = setInterval(() => {
          advanceSlide();
        }, 3000);
      }
    } else {
      try {
        // const credentials = await getCredentials();

        // if (credentials && user) {
        //   const accessToken = credentials.accessToken;

        //   const updatedMetadata = {
        //     onboarding: true,
        //   };

        //   await axios.patch(
        //     `https://dev-jydljupm.auth0.com/api/v2/users/${user.sub!}`,
        //     { user_metadata: updatedMetadata },
        //     {
        //       headers: {
        //         Authorization: `Bearer ${accessToken}`,
        //         'Content-Type': 'application/json',
        //       },
        //     },
        //   );

        //   await getCredentials();

        // }

        // TODO: BACKEND CALL AFTER AUTH0 ISSUE FIXED

        navigation.replace('scheduleTimings');
      } catch (error) {
        console.error('Error updating metadata:', error);
      }
    }
  };

  const renderSlides = ({ item }: any) => {
    return (
      <View style={styles.slideContainer}>
        {/* Image */}
        <Image source={item.image} style={styles.slideImage} />

        {/* Title */}
        <View
          style={{
            marginHorizontal: horizontalScale(20),
            gap: verticalScale(5),
            width: wp(75),
            alignSelf: 'center',
          }}
        >
          <CustomText
            fontFamily="ROBOTO_medium"
            fontSize={15}
            color={COLORS.darkBlue}
            textAlign="center"
            style={{ marginTop: verticalScale(10) }}
          >
            {item.title}
          </CustomText>

          {/* Subtitle */}
          <CustomText
            fontFamily="INTER_regular"
            fontSize={12}
            color={COLORS.black}
            textAlign="center"
          >
            {item.subTitle}
          </CustomText>
        </View>
      </View>
    );
  };

  const renderIndicators = () => {
    return (
      <View style={styles.indicatorCont}>
        {TutorSlides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentSlideIndex == index && {
                backgroundColor: COLORS.blue,
                transform: [{ scale: 1.5 }],
              },
            ]}
          />
        ))}
      </View>
    );
  };

  useEffect(() => {
    // Start the interval
    intervalRef.current = setInterval(() => {
      advanceSlide();
    }, 3000); // 3000 milliseconds = 3 seconds

    // Cleanup function to clear the interval when the component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <CustomIcon
        Icon={ICONS.BackArrowIcon}
        height={24}
        width={24}
        style={{ marginLeft: horizontalScale(16) }}
        onPress={() => {
          navigation.goBack();
        }}
      />
      <View style={{ marginVertical: verticalScale(60) }}>
        <FlatList
          ref={flatListRef}
          data={TutorSlides}
          onMomentumScrollEnd={updateCurrentSlideIndex}
          showsHorizontalScrollIndicator={false}
          horizontal
          pagingEnabled
          renderItem={renderSlides}
        />
      </View>

      <View
        style={{ alignItems: 'center', width: '100%', gap: verticalScale(15) }}
      >
        {/* Pagination Dots */}
        {renderIndicators()}

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setChecked(!checked)}
          activeOpacity={0.8}
        >
          <CustomIcon
            Icon={checked ? ICONS.CheckSquareIcon : ICONS.BlankSquare}
            height={20}
            width={20}
          />
          <CustomText fontSize={13} color={COLORS.DarkOrange}>
            I’m Taking the MCAT within A Year
          </CustomText>
        </TouchableOpacity>

        {/* Button */}
        <PrimaryButton
          title={
            // currentSlideIndex === TutorSlides.length - 1
            'GET STARTED'
          }
          onPress={handleModalSelect}
          isFullWidth={true}
          style={{
            paddingVertical: verticalScale(12),
            borderRadius: 25,
            width: wp(90),
          }}
          bgColor={[COLORS.green, COLORS.green]}
          textColor={COLORS.white}
        />
      </View>

      <ContactPopup
        isVisible={isModalVisible}
        setIsVisible={setIsModalVisible}
        onSelect={handleGetStarted}
      />
    </SafeAreaView>
  );
};

export default TutorFeatures;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: verticalScale(10),
  },
  slideContainer: {
    alignItems: 'center',
    width: wp(100),
    paddingHorizontal: horizontalScale(20),
  },
  slideImage: {
    height: hp(25),
    resizeMode: 'contain',
    width: wp(80),
    marginVertical: verticalScale(20),
  },
  indicatorCont: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: verticalScale(10),
  },
  indicator: {
    height: verticalScale(8),
    width: verticalScale(8),
    backgroundColor: COLORS.grey,
    marginHorizontal: horizontalScale(5),
    borderRadius: 100,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(15),
    gap: horizontalScale(5),
  },
});
