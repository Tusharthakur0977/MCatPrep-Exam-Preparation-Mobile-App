import React, { forwardRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { RBSheetRef } from '../../Utilities/Helpers';
import { COLORS } from '../../Utilities/Colors';
import { horizontalScale, verticalScale, wp } from '../../Utilities/Metrics';
import { CustomText } from '../CustomText';
import CustomIcon from '../CustomIcon';
import ICONS from '../../Assets/Icons';
import RenderHTML from 'react-native-render-html';

interface ExplainationRbsheetProps {
  explanation: string;
  correctAnswer: string;
}

const ExplainationRbsheet = forwardRef<RBSheetRef, ExplainationRbsheetProps>(
  ({ explanation, correctAnswer }, ref) => {
    const { width } = useWindowDimensions();

    return (
      <RBSheet
        ref={ref}
        draggable
        height={verticalScale(400)}
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
          EXPLANATION
        </CustomText>
        <ScrollView style={{ flex: 1 }} bounces={false}>
          {/* ANSWER  */}
          <View style={{ flexDirection: 'row' }}>
            <RenderHTML
              contentWidth={width - horizontalScale(40)}
              source={{ html: explanation || '' }}
              baseStyle={{ fontSize: 14, color: COLORS.MCAT_White }}
            />
          </View>
        </ScrollView>
      </RBSheet>
    );
  },
);

const styles = StyleSheet.create({
  closeIcon: {
    alignItems: 'flex-end',
    bottom: 25,
    right: -5,
  },
  heading: {
    marginBottom: verticalScale(10),
    textAlign: 'left',
  },
});

export default ExplainationRbsheet;
