import React, { FC, useRef, useState, useEffect } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import { horizontalScale, verticalScale, wp } from '../Utilities/Metrics';
import { CustomText } from './CustomText';
import { COLORS } from '../Utilities/Colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = verticalScale(40);

interface CustomPickerProps {
  onValuesChange?: (hours: string) => void;
  value?: number | string;
}

const CustomPicker: FC<CustomPickerProps> = ({ onValuesChange, value }) => {
  const hoursData = ['02', '04', '06', '08+'];
  const reversedHoursData = [...hoursData].reverse();

  // State to track selected index for hours
  const [selectedHoursIndex, setSelectedHoursIndex] = useState(1);

  // Ref for FlatList to programmatically scroll
  const hoursRef = useRef<FlatList<string>>(null);

  // Call onValuesChange when hours value changes
  useEffect(() => {
    if (value !== undefined && value !== null) {
      const str = value.toString().padStart(2, '0');
      const index = hoursData.findIndex(h => h.startsWith(str));

      if (index !== -1) {
        setSelectedHoursIndex(index);

        // scroll to correct position
        hoursRef.current?.scrollToIndex({
          index: hoursData.length - 1 - index,
          animated: false,
        });
      }
    }
  }, [value]);

  // Function to handle snapping and update selected index
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const scrollIndex = Math.round(offsetY / ITEM_HEIGHT);

    const newIndex = hoursData.length - 1 - scrollIndex;

    if (newIndex >= 0 && newIndex < hoursData.length) {
      setSelectedHoursIndex(newIndex);

      //  THIS WAS MISSING!!
      onValuesChange?.(hoursData[newIndex]);

      hoursRef.current?.scrollToIndex({ index: scrollIndex, animated: true });
    }
  };

  // Render item for the FlatList
  const renderItem = ({ item, index }: { item: string; index: number }) => {
    const isSelected = hoursData.length - 1 - index === selectedHoursIndex;
    return (
      <View style={[styles.item, { height: ITEM_HEIGHT }]}>
        <CustomText
          color={isSelected ? COLORS.voilet : '#908E8E'}
          fontSize={24}
          fontFamily="ROBOTO_bold"
        >
          {item}
        </CustomText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <FlatList
          ref={hoursRef}
          data={reversedHoursData}
          keyExtractor={(item, index) => item + index}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          initialScrollIndex={hoursData.length - 1 - selectedHoursIndex}
          getItemLayout={(data, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          onMomentumScrollEnd={handleScroll}
          style={styles.column}
          contentContainerStyle={{
            paddingVertical:
              (SCREEN_HEIGHT * verticalScale(0.14) - ITEM_HEIGHT) / 2,
          }}
        />
        {/* <View style={styles.highlightOverlay} /> */}
        <CustomText
          color={COLORS.voilet}
          fontSize={24}
          fontFamily="ROBOTO_regular"
          style={styles.unitText}
        >
          hr per day
        </CustomText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 10,
    width: wp(100),
    alignItems: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: wp(80),
    height: SCREEN_HEIGHT * verticalScale(0.14),
  },
  column: {
    zIndex: 2,
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: (SCREEN_HEIGHT * verticalScale(0.14) - ITEM_HEIGHT) / 2,
    height: ITEM_HEIGHT,
    borderRadius: 5,
    zIndex: 1,
    borderColor: COLORS.voilet,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    backgroundColor: 'transparent',
  },
  unitText: {
    alignSelf: 'center',
    position: 'absolute',
    right: horizontalScale(10),
  },
});

export default CustomPicker;
