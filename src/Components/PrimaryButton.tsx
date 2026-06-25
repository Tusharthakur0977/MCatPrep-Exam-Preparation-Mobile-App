import React, { FC } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  Vibration,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../Utilities/Colors';
import { horizontalScale, verticalScale, wp } from '../Utilities/Metrics';
import CustomIcon from './CustomIcon';
import { CustomText } from './CustomText';
import ICONS from '../Assets/Icons';
import { FontFamilyType } from '../Assets/Fonts';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  textColor?: string;
  style?: ViewStyle;
  disabled?: boolean;
  textSize?: number;
  isFullWidth?: boolean;
  bgColor?: string[];
  gradientStyle?: ViewStyle;
  textStyle?: TextStyle;
  isLoading?: boolean;
  isArrowIcon?: boolean;
  leftIcon?: any;
  textFont?: FontFamilyType;
  rightIcon?: any;
  iconSize?: number;
  innerViewStyle?: ViewStyle;
};

const PrimaryButton: FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  textColor = COLORS.white,
  style,
  textSize = 13,
  isFullWidth = true,
  bgColor = [COLORS.green, COLORS.green],
  gradientStyle,
  textStyle,
  isLoading = false,
  isArrowIcon = false,
  leftIcon,
  textFont = 'ROBOTO_semiBold',
  rightIcon,
  iconSize = 16,
  innerViewStyle,
}) => {
  return (
    <LinearGradient
      colors={bgColor}
      style={[
        {
          borderRadius: verticalScale(20),
          opacity: disabled ? 0.5 : 1,
          alignItems: 'center',
        },
        gradientStyle,
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <TouchableOpacity
        disabled={disabled}
        activeOpacity={0.7}
        style={[isFullWidth && styles.button, style]}
        onPress={() => {
          onPress();
        }}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <View
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: horizontalScale(10),
              },
              innerViewStyle,
            ]}
          >
            {leftIcon && (
              <CustomIcon Icon={leftIcon} height={iconSize} width={iconSize} />
            )}
            <CustomText
              fontFamily={textFont}
              fontSize={textSize}
              color={textColor}
              style={textStyle}
            >
              {title}
            </CustomText>
            {rightIcon && (
              <CustomIcon Icon={rightIcon} height={iconSize} width={iconSize} />
            )}

            {isArrowIcon && (
              <CustomIcon Icon={ICONS.ArrowRight} height={16} width={16} />
            )}
          </View>
        )}
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(20),
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(90),
    alignSelf: 'center',
  },
});

export default PrimaryButton;
