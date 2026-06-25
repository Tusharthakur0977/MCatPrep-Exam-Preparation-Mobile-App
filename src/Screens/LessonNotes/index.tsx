import React, { FC } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import ICONS from '../../Assets/Icons';
import CustomIcon from '../../Components/CustomIcon';
import { CustomText } from '../../Components/CustomText';
import { COLORS } from '../../Utilities/Colors';
import { horizontalScale, verticalScale, wp } from '../../Utilities/Metrics';
import { LessonNotesProps } from '../../Typings/route';
import RenderHtml from 'react-native-render-html';
import { replaceGreekLetters } from '../../Utilities/GreekLetters';

const LessonNotes: FC<LessonNotesProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { notes } = route.params;
  const source = {
    html: `${notes.content}`,
  };

  const processedContent = replaceGreekLetters(notes.content || '');

  return (
    <SafeAreaView
      style={[styles.container, { paddingBottom: insets.bottom }]}
      edges={['left', 'right']}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + verticalScale(20),
          },
        ]}
      >
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
            Lecture Notes
          </CustomText>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <RenderHtml
            contentWidth={width - horizontalScale(40)}
            source={{ html: processedContent }}
            baseStyle={styles.htmlBase}
            // Enable images
            renderersProps={{
              img: {
                enableExperimentalPercentWidth: true,
              },
            }}
            // Custom renderers for images if needed
            renderers={{
              img: (
                htmlAttribs: any,
                children: any,
                convertedCSSStyles: any,
                passProps: any,
              ) => {
                return (
                  <Image
                    source={{ uri: htmlAttribs.src }}
                    style={{
                      width: '100%',
                      height: 200,
                      resizeMode: 'contain',
                    }}
                  />
                );
              },
            }}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default LessonNotes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.MCAT_White,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(15),
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(30),
    backgroundColor: COLORS.MCAT_Dark_Blue,
  },
  headerTextContainer: {
    gap: verticalScale(5),
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(15),
  },
  htmlBase: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.black,
    lineHeight: 24,
  },
});
