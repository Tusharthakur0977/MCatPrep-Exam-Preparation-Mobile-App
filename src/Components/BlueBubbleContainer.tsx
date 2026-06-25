import { StyleSheet, View, useWindowDimensions, ViewStyle } from 'react-native';
import React, { useState, useEffect } from 'react';
import { COLORS } from '../Utilities/Colors';

const MIN_RADIUS = 30;
const MAX_RADIUS = 100;
const BUFFER = 20;

type BubbleType = {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
};

type BlueBubbleContainerProps = {
  children: React.ReactNode;
  heightProp?: number | string;
  contentStyle?: ViewStyle;
  mainStyle?: ViewStyle;
  bubblesCount?: number;
};

const Bubble = ({ x, y, radius, color }: Omit<BubbleType, 'id'>) => {
  const borderWidth = radius * 0.5;
  return (
    <View
      style={{
        position: 'absolute',
        left: x - radius,
        top: y - radius,
        width: radius * 2,
        height: radius * 2,
        borderRadius: radius,
        borderColor: color,
        borderWidth,
        backgroundColor: 'transparent',
        opacity: 0.5,
      }}
    />
  );
};

const BlueBubbleContainer: React.FC<BlueBubbleContainerProps> = ({
  children,
  heightProp,
  contentStyle,
  mainStyle,
  bubblesCount = 4,
}) => {
  const { width, height } = useWindowDimensions();
  const [bubbles, setBubbles] = useState<BubbleType[]>([]);
  const [contentHeight, setContentHeight] = useState<number>(0);

  const containerHeight =
    typeof heightProp === 'number'
      ? heightProp
      : heightProp
      ? parseInt(heightProp.toString(), 10)
      : contentHeight || height;

  useEffect(() => {
    const generateBubbles = () => {
      const generatedBubbles: BubbleType[] = [];
      let attempts = 0;
      const MAX_ATTEMPTS = 500;

      while (
        generatedBubbles.length < bubblesCount &&
        attempts < MAX_ATTEMPTS
      ) {
        const radius = Math.random() * (MAX_RADIUS - MIN_RADIUS) + MIN_RADIUS;
        const x = Math.random() * width;
        const y = Math.random() * containerHeight;

        const isOverlapping = generatedBubbles.some(
          bubble =>
            Math.sqrt(Math.pow(x - bubble.x, 2) + Math.pow(y - bubble.y, 2)) <
            radius + bubble.radius + BUFFER,
        );

        if (!isOverlapping) {
          generatedBubbles.push({
            id: generatedBubbles.length,
            x,
            y,
            radius,
            color: '#ffffff2d',
          });
        }
        attempts++;
      }

      setBubbles(generatedBubbles);
    };

    generateBubbles();
  }, [width, containerHeight]);

  return (
    <View style={[styles.container, mainStyle]}>
      {/* Bubbles layer - behind content */}
      <View style={[StyleSheet.absoluteFillObject, { zIndex: 0 }]}>
        {bubbles.map(bubble => (
          <Bubble
            key={bubble.id}
            x={bubble.x}
            y={bubble.y}
            radius={bubble.radius}
            color={bubble.color}
          />
        ))}
      </View>

      {/* Content layer - always above bubbles */}
      <View
        style={[styles.contentWrapper, contentStyle, { zIndex: 1 }]}
        onLayout={event => {
          if (!heightProp) {
            setContentHeight(event.nativeEvent.layout.height);
          }
        }}
      >
        {children}
      </View>
    </View>
  );
};

export default BlueBubbleContainer;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.MCAT_Dark_Blue,
    position: 'relative',
    overflow: 'hidden',
  },
  contentWrapper: {
    width: '100%',
  },
});
