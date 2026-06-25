import { ImageZoom, ImageZoomRef } from '@likashefqet/react-native-image-zoom';
import React, { FC, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import ICONS from '../../Assets/Icons';
import CustomIcon from '../../Components/CustomIcon';
import { CustomText } from '../../Components/CustomText';
import { LessonWhiteBoardProps } from '../../Typings/route';
import { COLORS } from '../../Utilities/Colors';
import { horizontalScale, verticalScale } from '../../Utilities/Metrics';

const LessonWhiteBoard: FC<LessonWhiteBoardProps> = ({ navigation, route }) => {
  const { note_url, notes } = route.params;
  const insets = useSafeAreaInsets();

  const imageUrl =
    note_url ||
    'https://assets.medschoolcoach.com/whiteboard-notes/PsychologyProblemSolvingApproachestoProblemSolvingPart1.png';

  const imageZoomRef = useRef<ImageZoomRef>(null);

  const [zoomState, setZoomState] = useState({
    scale: 1,
    positionX: 0,
    positionY: 0,
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <CustomIcon
          Icon={ICONS.WhiteLeftArrow}
          height={20}
          width={20}
          onPress={() => navigation.goBack()}
        />
        <View style={styles.headerTextContainer}>
          <CustomText
            fontFamily="RUBIK_bold"
            fontSize={22}
            color={COLORS.white}
          >
            Whiteboard Notes
          </CustomText>
        </View>
      </View>

      {/* Body */}
      <View
        style={[
          styles.body,
          {
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <ImageZoom
          ref={imageZoomRef}
          uri={imageUrl}
          style={styles.imageZoomView}
          minScale={1}
          maxScale={5}
          doubleTapScale={3}
          isResetOnEnd={false}
          onTransform={(e: any) => {
            // Track live transform
            setZoomState({
              scale: e.scale,
              positionX: e.positionX,
              positionY: e.positionY,
            });
          }}
          onTransformEnd={(e: any) => {
            // Persist last transform so it remains after release
            setZoomState({
              scale: e.scale,
              positionX: e.positionX,
              positionY: e.positionY,
            });
          }}
          initialTransform={{
            scale: zoomState.scale,
            positionX: zoomState.positionX,
            positionY: zoomState.positionY,
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default LessonWhiteBoard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.MCAT_Dark_Blue,
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(15),
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(30),
  },
  headerTextContainer: {
    gap: verticalScale(5),
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: horizontalScale(40),
    paddingHorizontal: horizontalScale(15),
  },
  imageZoomView: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.white,
    height: undefined,
    aspectRatio: 5 / 9,
    resizeMode: 'contain',
  },
});
