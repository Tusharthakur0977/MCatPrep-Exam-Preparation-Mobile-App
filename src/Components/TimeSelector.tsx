import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../Utilities/Colors';
import { verticalScale, wp } from '../Utilities/Metrics';
import { CustomText } from './CustomText';

const TimeSelector = ({
  onValueChange,
  initialTime,
}: {
  onValueChange: (selctedTime: string) => void;
  initialTime?: string | null;
}) => {
  const [time, setTime] = useState('12:00 PM');
  const [sliderValue, setSliderValue] = useState(0.5);

  const handleSliderChange = (value: number) => {
    const steppedValue = Math.round(value * 2) / 2;
    setSliderValue(steppedValue);
    if (steppedValue <= 0.33) {
      setTime('6:00 AM'); // Morning
      onValueChange('6:00 AM');
    } else if (steppedValue <= 0.66) {
      setTime('12:00 PM'); // Noon
      onValueChange('12:00 PM');
    } else {
      setTime('6:00 PM'); // Evening
      onValueChange('6:00 PM');
    }
  };

  useEffect(() => {
    if (!initialTime) return;

    setTime(initialTime);

    if (initialTime === '6:00 AM') setSliderValue(0);
    else if (initialTime === '12:00 PM') setSliderValue(0.5);
    else if (initialTime === '6:00 PM') setSliderValue(1);
  }, [initialTime]);

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.container}
    >
      {/* Circular Clock Display */}
      <LinearGradient
        colors={[COLORS.darkBlue, COLORS.green]}
        style={styles.clockContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.clockCircle}>
          <CustomText
            fontFamily="INTER_medium"
            fontSize={15}
            textAlign="center"
          >
            {time.split(' ')[0]}
          </CustomText>
          <CustomText
            fontFamily="INTER_regular"
            fontSize={12}
            textAlign="center"
          >
            {time.split(' ')[1]}
          </CustomText>
        </View>
      </LinearGradient>

      {/* Slider with Labels */}
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.sliderTrack}
          minimumValue={0}
          maximumValue={1}
          value={sliderValue}
          onValueChange={handleSliderChange}
          step={0.5}
          minimumTrackTintColor={COLORS.darkBlue}
          maximumTrackTintColor="#DAE0E9"
          thumbTintColor={COLORS.green}
          // onSlidingStart={() => console.log('Sliding started')}
          // onSlidingComplete={value =>
          //   console.log('Sliding completed at:', value)
          // } // Debug log
        />
        <View style={styles.sliderLabels}>
          <CustomText color="#7E8A9D" fontSize={12}>
            Morning
          </CustomText>
          <CustomText color="#7E8A9D" fontSize={12}>
            Noon
          </CustomText>
          <CustomText color="#7E8A9D" fontSize={12}>
            Evening
          </CustomText>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: verticalScale(20),
  },
  clockContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 100,
    width: verticalScale(150),
    height: verticalScale(150),
  },
  clockCircle: {
    height: '97%',
    width: '97%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  sliderContainer: {
    width: wp(80),
    alignItems: 'center',
    gap: Platform.select({
      android: 0,
      ios: verticalScale(10),
    }),
  },
  sliderTrack: {
    width: '100%',
    height: 10,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
});

export default TimeSelector;
