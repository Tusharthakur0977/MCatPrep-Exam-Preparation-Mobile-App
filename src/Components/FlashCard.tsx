import React, { forwardRef, useImperativeHandle } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { runOnJS, scheduleOnRN } from 'react-native-worklets';
import { replaceGreekLetters } from '../Utilities/GreekLetters';
import { horizontalScale, hp, verticalScale, wp } from '../Utilities/Metrics';
import { CustomText } from './CustomText';

const CARD_WIDTH = wp(80);
const CARD_HEIGHT = hp(60);
const SWIPE_THRESHOLD = 150;

const FlashCard = forwardRef(
  ({ item, onSwipe, index, totalCards }: any, ref) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const rotationY = useSharedValue(0);

    const isTopCard = index === 0;
    const panGesture = Gesture.Pan()
      .onUpdate(event => {
        'worklet';
        if (!isTopCard) return;
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      })
      .onEnd(event => {
        'worklet';
        if (!isTopCard) return;

        const isSwipedLeft = event.translationX < -SWIPE_THRESHOLD;
        const isSwipedRight = event.translationX > SWIPE_THRESHOLD;
        const isSwipedDown = event.translationY > SWIPE_THRESHOLD;
        let swipeDirection = '';

        if (isSwipedLeft || isSwipedRight || isSwipedDown) {
          if (isSwipedLeft) {
            swipeDirection = 'negative';
          } else if (isSwipedRight) {
            swipeDirection = 'positive';
          } else if (isSwipedDown) {
            swipeDirection = 'neutral';
          }
          const offScreenX = isSwipedLeft ? -CARD_WIDTH * 2 : CARD_WIDTH * 2;
          const offScreenY = isSwipedDown ? CARD_HEIGHT * 2 : translateY.value;
          translateX.value = withTiming(offScreenX, {}, () => {
            scheduleOnRN(onSwipe, swipeDirection);
          });
          translateY.value = withTiming(offScreenY);
        } else {
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
        }
      });

    useImperativeHandle(ref, () => ({
      swipeLeft: () => {
        if (!isTopCard) return;
        translateX.value = withTiming(-CARD_WIDTH * 2, {}, () => {
          scheduleOnRN(onSwipe, 'negative');
        });
      },
      swipeRight: () => {
        if (!isTopCard) return;
        translateX.value = withTiming(CARD_WIDTH * 2, {}, () => {
          scheduleOnRN(onSwipe, 'positive');
        });
      },
      swipeDown: () => {
        if (!isTopCard) return;
        translateY.value = withTiming(CARD_HEIGHT * 2, {}, () => {
          scheduleOnRN(onSwipe, 'neutral');
        });
      },
    }));

    const tapGesture = Gesture.Tap().onEnd(() => {
      'worklet';
      if (!isTopCard) return;
      rotationY.value = withTiming(rotationY.value === 0 ? 180 : 0, {
        duration: 500,
      });
    });

    const [directionLabel, setDirectionLabel] = React.useState('');

    useDerivedValue(() => {
      let d = '';
      const DIRECTION_THRESHOLD = SWIPE_THRESHOLD / 4;
      if (
        translateY.value > DIRECTION_THRESHOLD &&
        Math.abs(translateY.value) > Math.abs(translateX.value)
      ) {
        d = 'DOWN';
      } else if (translateX.value > DIRECTION_THRESHOLD) {
        d = 'RIGHT';
      } else if (translateX.value < -DIRECTION_THRESHOLD) {
        d = 'LEFT';
      }
      runOnJS(setDirectionLabel)(d);
      return d;
    });

    const animatedContainerStyle = useAnimatedStyle(() => {
      const swipeRotation = isTopCard ? translateX.value / 20 : 0;
      const staticTilt = isTopCard
        ? 0
        : (index % 2 === 1 ? -9 : 9) / (index + 1);
      const translateYOffset = interpolate(index, [0, 1, 2, 3], [0, 1, 2, 3]);
      const zIndex = totalCards - index;

      return {
        zIndex,
        transform: [
          { perspective: 1000 },
          { translateX: isTopCard ? translateX.value : 0 },
          {
            translateY: isTopCard
              ? translateY.value + translateYOffset
              : translateYOffset,
          },
          { rotate: `${swipeRotation + staticTilt}deg` },
        ],
      };
    });

    const frontSideStyle = useAnimatedStyle(() => {
      return {
        transform: [{ rotateY: `${rotationY.value}deg` }],
        backfaceVisibility: 'hidden',
      };
    });

    const backSideStyle = useAnimatedStyle(() => {
      return {
        transform: [{ rotateY: `${rotationY.value + 180}deg` }],
        backfaceVisibility: 'hidden',
      };
    });

    return (
      <GestureDetector gesture={Gesture.Simultaneous(panGesture, tapGesture)}>
        <Animated.View
          style={[styles.flashcardContainer, animatedContainerStyle]}
        >
          {/* Front of the Card */}
          <Animated.View style={[styles.cardSide, frontSideStyle]}>
            <LinearGradient
              colors={
                directionLabel === 'LEFT'
                  ? ['#ffc8a6a7', '#ff80319e']
                  : directionLabel === 'RIGHT'
                  ? ['#009d7b46', '#009d7bb1']
                  : directionLabel === 'DOWN'
                  ? ['#ffb74a49', '#ffb74aae']
                  : ['transparent', 'transparent']
              }
              style={styles.gradientBanner}
            >
              <CustomText fontSize={12} fontFamily="ROBOTO_medium">
                {directionLabel === 'LEFT'
                  ? 'Negative confidence'
                  : directionLabel === 'RIGHT'
                  ? 'Positive confidence'
                  : directionLabel === 'DOWN'
                  ? 'Neutral confidence'
                  : ''}
              </CustomText>
            </LinearGradient>

            <View style={styles.contentContainer}>
              {item.front.image && (
                <Image
                  source={{ uri: item.front.image }}
                  style={styles.frontImage}
                  resizeMode="contain"
                />
              )}

              <View style={styles.textBlock}>
                <CustomText
                  fontSize={20}
                  fontFamily="ROBOTO_bold"
                  textAlign="left"
                >
                  {item.front.title}
                </CustomText>
                {item.front.text && (
                  <CustomText
                    fontSize={12}
                    fontFamily="INTER_regular"
                    textAlign="left"
                  >
                    {replaceGreekLetters(item.front.text)}
                  </CustomText>
                )}
              </View>
            </View>
          </Animated.View>

          {/* Back of the Card */}
          <Animated.View
            style={[styles.cardSide, styles.cardBack, backSideStyle]}
          >
            <LinearGradient
              colors={
                directionLabel === 'LEFT'
                  ? ['#ffc8a6a7', '#ff80319e']
                  : directionLabel === 'RIGHT'
                  ? ['#009d7b46', '#009d7bb1']
                  : directionLabel === 'DOWN'
                  ? ['#ffb74a49', '#ffb74aae']
                  : ['transparent', 'transparent']
              }
              style={styles.gradientBanner}
            >
              <CustomText fontSize={12} fontFamily="ROBOTO_medium">
                {directionLabel === 'LEFT'
                  ? 'Negative confidence'
                  : directionLabel === 'RIGHT'
                  ? 'Positive confidence'
                  : directionLabel === 'DOWN'
                  ? 'Neutral confidence'
                  : ''}
              </CustomText>
            </LinearGradient>

            <View style={styles.contentContainer}>
              {item.back.image && (
                <Image
                  source={{ uri: item.back.image }}
                  style={styles.cardImage}
                  resizeMode="contain"
                />
              )}

              <View style={styles.textBlock}>
                <CustomText
                  fontFamily="ROBOTO_bold"
                  fontSize={20}
                  textAlign="left"
                >
                  {replaceGreekLetters(item.front.title)}
                </CustomText>
                {item.back.text && (
                  <CustomText
                    fontSize={12}
                    fontFamily="INTER_regular"
                    textAlign="left"
                  >
                    {replaceGreekLetters(item.back.text)}
                  </CustomText>
                )}
              </View>

              {/* Example Section */}
              {item.back.example && (
                <View style={styles.exampleSection}>
                  {item.back.exampleImage && (
                    <Image
                      source={{ uri: item.back.exampleImage }}
                      style={styles.cardImage}
                      resizeMode="contain"
                    />
                  )}
                  <CustomText
                    fontFamily="ROBOTO_bold"
                    fontSize={16}
                    textAlign="left"
                    style={{ marginTop: verticalScale(10) }}
                  >
                    Example
                  </CustomText>
                  <CustomText
                    fontSize={12}
                    fontFamily="INTER_regular"
                    textAlign="left"
                  >
                    {replaceGreekLetters(item.back.example)}
                  </CustomText>
                </View>
              )}
            </View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    );
  },
);

export default FlashCard;

const styles = StyleSheet.create({
  flashcardContainer: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: 'transparent',
  },
  cardSide: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
  },
  cardBack: {
    backgroundColor: 'white',
  },
  gradientBanner: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingVertical: verticalScale(40),
    paddingHorizontal: horizontalScale(30),
    gap: verticalScale(20),
  },
  centerIcon: {
    alignSelf: 'center',
  },
  textBlock: {
    gap: verticalScale(10),
  },
  cardImage: {
    width: '100%',
    height: 75,
    borderRadius: 10,
    alignSelf: 'center',
  },
  frontImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    alignSelf: 'center',
  },
  exampleSection: {
    marginTop: verticalScale(15),
    paddingTop: verticalScale(15),
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: verticalScale(8),
  },
});
