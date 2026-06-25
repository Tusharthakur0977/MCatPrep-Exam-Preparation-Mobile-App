// toastConfig.jsx
import { JSX } from 'react';
import { StyleSheet, View } from 'react-native';
import { BaseToastProps } from 'react-native-toast-message';

import { CustomText } from '../Components/CustomText';
import { horizontalScale, verticalScale, wp } from './Metrics';
import { COLORS } from './Colors';

// Reusable component for both toast types
interface CustomToastComponentProps extends BaseToastProps {
  type: 'success' | 'error' | 'info';
}

const CustomToastComponent = ({
  type,
  text1,
  text2,
}: CustomToastComponentProps) => {
  const borderColor =
    type === 'success'
      ? COLORS.softLavender
      : type === 'info'
      ? COLORS.celestialBlue
      : COLORS.dangerRed;

  return (
    <View style={styles.container}>
      <View style={[styles.accentBar, { backgroundColor: borderColor }]} />
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <CustomText
            color={COLORS.black}
            fontSize={14}
            fontFamily="ROBOTO_bold"
          >
            {text1}
          </CustomText>
          <CustomText fontSize={12} color={COLORS.black}>
            {text2}
          </CustomText>
        </View>
      </View>
    </View>
  );
};

const toastConfig = {
  success: (props: JSX.IntrinsicAttributes & BaseToastProps) => (
    <CustomToastComponent
      type="success"
      text1={props.text1}
      text2={props.text2}
    />
  ),
  error: (props: JSX.IntrinsicAttributes & BaseToastProps) => (
    <CustomToastComponent
      type="error"
      text1={props.text1}
      text2={props.text2}
    />
  ),
  info: (props: JSX.IntrinsicAttributes & BaseToastProps) => (
    <CustomToastComponent type="info" text1={props.text1} text2={props.text2} />
  ),
};

const styles = StyleSheet.create({
  container: {
    width: wp(90),
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  accentBar: {
    width: horizontalScale(6),
    height: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(15),
    gap: horizontalScale(10),
    flex: 1,
  },
  textContainer: {
    flexShrink: 1,
  },
});

export default toastConfig;
