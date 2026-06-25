import React, { forwardRef } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { RBSheetRef } from '../../Utilities/Helpers';
import { COLORS } from '../../Utilities/Colors';
import { horizontalScale, verticalScale, wp } from '../../Utilities/Metrics';
import { CustomText } from '../CustomText';
import CustomIcon from '../CustomIcon';
import ICONS from '../../Assets/Icons';

interface GestureCardProps {}

const GestureCard = forwardRef<RBSheetRef, GestureCardProps>((_, ref) => {
  const data = [
    {
      icon: ICONS.ReverseCard,
      title: 'Tap the card',
      subtitle: 'View the reverse side',
    },
    {
      icon: ICONS.LeftSwipeIcon,
      title: 'Swipe left',
      subtitle: 'Indicate negative confidence',
    },
    {
      icon: ICONS.DownSwipeIcon,
      title: 'Swipe down',
      subtitle: 'Indicate neutral confidence',
    },
    {
      icon: ICONS.SwipeRightIcon,
      title: 'Swipe right',
      subtitle: 'Indicate positive confidence',
    },
  ];

  return (
    <RBSheet
      ref={ref}
      draggable
      height={verticalScale(460)}
      customStyles={{
        wrapper: { backgroundColor: 'rgba(0,0,0,0.5)' },
        draggableIcon: {
          backgroundColor: COLORS.fadeText,
          width: wp(30),
          bottom: 15,
        },
        container: {
          backgroundColor: COLORS.DarkBlue,
          paddingVertical: verticalScale(20),
          paddingHorizontal: horizontalScale(20),
        },
      }}
    >
      {/* Close Button */}
      <TouchableOpacity
        onPress={() => (ref as React.RefObject<RBSheetRef>)?.current?.close()}
        style={styles.closeIcon}
      >
        <CustomIcon Icon={ICONS.WhiteCrossIcon} height={20} width={20} />
      </TouchableOpacity>

      {/* Heading */}
      <CustomText
        fontFamily="INTER_bold"
        fontSize={18}
        color={COLORS.fadeText}
        style={styles.heading}
      >
        HOW TO USE
      </CustomText>

      {/* Items */}
      <View style={{ alignSelf: 'center' }}>
        {data.map((item, index) => (
          <TouchableOpacity key={index} style={styles.row} activeOpacity={0.8}>
            <CustomIcon Icon={item.icon} height={55} width={55} />
            <View style={styles.textBox}>
              <CustomText
                fontFamily="INTER_medium"
                fontSize={15}
                color={COLORS.MCAT_White}
              >
                {item.title}
              </CustomText>
              <CustomText
                fontFamily="INTER_regular"
                fontSize={11}
                color={COLORS.MCAT_White}
              >
                {item.subtitle}
              </CustomText>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </RBSheet>
  );
});

const styles = StyleSheet.create({
  closeIcon: {
    position: 'absolute',
    top: verticalScale(15),
    right: horizontalScale(15),
    zIndex: 1,
  },
  heading: {
    marginTop: verticalScale(10),
    marginBottom: verticalScale(30),
    textAlign: 'left',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(25),
    paddingHorizontal: horizontalScale(10),
  },
  textBox: {
    marginLeft: horizontalScale(20),
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: verticalScale(10),
    gap: verticalScale(4),
  },
});

export default GestureCard;
