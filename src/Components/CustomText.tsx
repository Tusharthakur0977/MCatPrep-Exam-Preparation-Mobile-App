import { Text, TextStyle, type TextProps } from 'react-native';
import FONTS, { FontFamilyType } from '../Assets/Fonts';
import { COLORS } from '../Utilities/Colors';
import { responsiveFontSize } from '../Utilities/Metrics';

export type CustomTextProps = TextProps & {
  color?: string;
  fontFamily?: FontFamilyType;
  fontSize?: number;
  fontWeight?: string;
  lineHeight?: number;
  textAlign?: TextStyle['textAlign'];
};

export function CustomText({
  style,
  fontFamily = 'INTER_regular',
  fontSize = 16,
  color = COLORS.MCAT_Black,
  lineHeight,
  textAlign = 'auto',
  ...rest
}: CustomTextProps) {
  const resolvedFontSize = responsiveFontSize(fontSize);

  return (
    <Text
      style={[
        {
          color,
          fontFamily: FONTS[fontFamily],
          fontSize: resolvedFontSize,
          lineHeight: lineHeight ?? resolvedFontSize * 1.3,
          opacity: rest.disabled ? 0.7 : 1,
          textAlign,
        },
        style,
      ]}
      {...rest}
    />
  );
}
