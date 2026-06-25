import axios from 'axios';
import React, { FC, useEffect } from 'react';
import {
  BackHandler,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import LinearGradient from 'react-native-linear-gradient';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import ICONS from '../../Assets/Icons';
import CustomIcon from '../../Components/CustomIcon';
import { CustomText } from '../../Components/CustomText';
import PrimaryButton from '../../Components/PrimaryButton';
import OnBoardingSlides, { SlideType } from '../../Seeds/Onbaording';
import { ExploreFeaturesScreenProps } from '../../Typings/route';
import { COLORS } from '../../Utilities/Colors';
import {
  deviceWidth,
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from '../../Utilities/Metrics';

const ExploreFeatures: FC<ExploreFeaturesScreenProps> = ({ navigation }) => {
  const flatListRef = React.useRef<FlatList>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);
  const insets = useSafeAreaInsets();
  const totalSlides = OnBoardingSlides.length;

  const updateCurrentSlideIndex = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / deviceWidth);
    setCurrentSlideIndex(currentIndex);
  };

  const goToNextSlide = async () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex != OnBoardingSlides.length) {
      const offset = nextSlideIndex * deviceWidth;

      if (flatListRef.current) {
        flatListRef?.current.scrollToOffset({ offset });
        setCurrentSlideIndex(currentSlideIndex + 1);
      }
    } else {
      try {
        navigation.replace('scheduleTimings', {});
      } catch (error) {
        console.error('Error updating metadata:', error);
      }
    }
  };

  const goToPreviousSlide = () => {
    const prevSlideIndex = currentSlideIndex - 1;
    if (prevSlideIndex >= 0) {
      const offset = prevSlideIndex * deviceWidth;
      if (flatListRef.current) {
        flatListRef?.current.scrollToOffset({ offset, animated: true });
      }
      return true; // Indicate that we handled the back button press
    }
    return false; // Let the default back action (exit app) happen
  };

  const renderSlides = ({
    item,
    index,
  }: {
    item: SlideType;
    index: number;
  }) => {
    return (
      <View key={item.id + index} style={styles.slideContainer}>
        <View
          style={{
            flex: 1,
            gap: verticalScale(30),
            justifyContent: 'space-evenly',
          }}
        >
          <View style={styles.slideTextCont}>
            <CustomText
              color={COLORS.MCAT_Black}
              fontFamily="RUBIK_medium"
              textAlign="center"
              fontSize={19}
            >
              {item?.text1}
              <CustomText
                color={COLORS.green}
                fontSize={19}
                fontFamily="RUBIK_medium"
              >
                {item?.text2}
              </CustomText>
              <CustomText
                color={COLORS.MCAT_Black}
                fontSize={19}
                fontFamily="RUBIK_medium"
                textAlign="center"
              >
                {item?.text3}
              </CustomText>
            </CustomText>
          </View>
          <Image source={item?.image} style={styles.slideImage} />
        </View>
        {item.quote?.title && (
          <LinearGradient
            colors={['#81b1ff3e', '#81b1ff1c', 'rgba(221, 227, 235, 0)']}
            style={{
              width: wp(90),
              borderRadius: 10,
              opacity: index === 2 ? 0 : 1,
            }}
          >
            <View
              style={{ padding: verticalScale(10), gap: verticalScale(10) }}
            >
              <View style={{ width: '100%' }}>
                <CustomIcon
                  Icon={ICONS.QuotesSign}
                  style={{ position: 'absolute' }}
                  height={verticalScale(18)}
                  width={verticalScale(14)}
                />
                <CustomText
                  textAlign="center"
                  fontSize={14}
                  fontFamily="RUBIK_semiBold"
                >
                  {item.quote?.title}
                </CustomText>
              </View>
              <CustomText
                fontSize={11}
                fontFamily="RUBIK_italic"
                textAlign="center"
                style={{ paddingHorizontal: horizontalScale(20) }}
              >
                {item.quote?.subTitle}
              </CustomText>
            </View>
          </LinearGradient>
        )}
      </View>
    );
  };

  const renderIndicators = () => {
    return (
      <View style={styles.indicatorCont}>
        {OnBoardingSlides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentSlideIndex == index && {
                backgroundColor: COLORS.darkBlue,
                transform: [{ scale: 1.5 }],
              },
            ]}
          />
        ))}
      </View>
    );
  };

  useEffect(() => {
    // Only apply BackHandler logic on Android
    if (Platform.OS === 'android') {
      const handleBackPress = () => {
        if (currentSlideIndex > 0) {
          // If not on the first slide, move to the previous slide
          goToPreviousSlide();
          return true; // Consume the event, don't exit the app
        }

        // If on the first slide, let it fall through to default behavior,
        // which typically exits the app. Alternatively, explicitly call BackHandler.exitApp()

        // return false; // Default behavior on the first screen (exits app)
        BackHandler.exitApp(); // Explicitly exit app on the first slide
        return true; // Returning true here consumes the event to prevent further listeners
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackPress,
      );

      // Clean up the listener when the component unmounts or currentSlideIndex changes
      return () => backHandler.remove();
    }
  }, [currentSlideIndex, totalSlides]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          paddingTop: insets.top + verticalScale(20),
        },
      ]}
    >
      <FlatList
        ref={flatListRef}
        data={OnBoardingSlides}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        showsHorizontalScrollIndicator={false}
        horizontal
        pagingEnabled
        renderItem={renderSlides}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          paddingHorizontal: horizontalScale(20),
        }}
      >
        {renderIndicators()}
        <PrimaryButton
          title={currentSlideIndex === 2 ? 'GET STARTED' : 'NEXT'}
          onPress={goToNextSlide}
          isFullWidth={false}
          isArrowIcon={currentSlideIndex !== 2}
          style={{
            paddingVertical: verticalScale(10),
            paddingHorizontal: verticalScale(currentSlideIndex === 2 ? 30 : 18),
          }}
          gradientStyle={{
            borderWidth: 1,
            borderColor: currentSlideIndex === 2 ? 'transparent' : '#D0D5E7',
            borderRadius: 20,
          }}
          bgColor={
            currentSlideIndex === 2
              ? [COLORS.green, COLORS.green]
              : ['transparent', 'transparent']
          }
          textColor={currentSlideIndex === 2 ? COLORS.white : COLORS.voilet}
          textSize={16}
        />
      </View>
    </SafeAreaView>
  );
};

export default ExploreFeatures;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    paddingVertical: verticalScale(20),
    gap: verticalScale(50),
  },

  slideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: wp(100),
    gap: verticalScale(40),
    paddingBottom: verticalScale(50),
  },

  slideImage: {
    height: hp(30),
    resizeMode: 'contain',
    width: wp(90),
    borderRadius: verticalScale(10),
  },

  slideTextCont: {
    gap: verticalScale(10),
    alignItems: 'center',
    width: wp(90),
  },

  subtitle: {
    color: COLORS.white,
    textAlign: 'center',
    maxWidth: wp(60),
  },

  title: {
    color: COLORS.white,
    marginTop: 20,
  },

  buttonCont: {
    paddingVertical: verticalScale(10),
    width: wp(100),
    alignItems: 'center',
    gap: verticalScale(10),
  },

  skipText: {
    textDecorationLine: 'underline',
  },

  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
  },

  indicatorCont: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: verticalScale(10),
  },

  indicator: {
    height: verticalScale(9),
    width: verticalScale(9),
    backgroundColor: COLORS.lightBlue,
    marginHorizontal: horizontalScale(5),
    borderRadius: 100,
  },

  exploreDoneImage: {
    height: hp(50),
    resizeMode: 'contain',
    width: wp(85),
    borderRadius: verticalScale(10),
  },
});
