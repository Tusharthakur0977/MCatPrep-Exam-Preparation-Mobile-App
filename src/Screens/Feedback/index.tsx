import React, { FC, useCallback, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { COLORS } from '../../Utilities/Colors';
import { CustomText } from '../../Components/CustomText';
import CustomIcon from '../../Components/CustomIcon';
import ICONS from '../../Assets/Icons';
import {
  horizontalScale,
  responsiveFontSize,
  verticalScale,
  wp,
} from '../../Utilities/Metrics';
import PrimaryButton from '../../Components/PrimaryButton';
import { FeedbackProps } from '../../Typings/route';
import { KeyboardScrollView } from '../../Components/KeyboardScrollView';
import {
  fetchUserApiData,
  postUserApiData,
} from '../../Services/UserApiService';
import ENDPOINTS from '../../Services/ApiEndpoints';
import { ProfileDataResponse } from '../../Services/ApiResponses/GetProfileApiResponse';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { getLocalStorageData } from '../../Utilities/Helpers';
import STORAGE_KEYS from '../../Utilities/Storage';
import { postData } from '../../Services/MedSchoolApiService';

const Feedback: FC<FeedbackProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [selectedOption, setSelectedOption] = useState<string[]>([]);
  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileDataResponse | null>(
    null,
  );

  const options = [
    'I found a bug/error in the app',
    'I have a feature request',
    'I have a question about my account',
    'I found a content related error',
  ];

  const toggleOption = (option: string) => {
    if (selectedOption.includes(option)) {
      // Remove it
      setSelectedOption(selectedOption.filter(item => item !== option));
    } else {
      // Add it
      setSelectedOption([...selectedOption, option]);
    }
  };

  const handleFetchProfileData = async () => {
    try {
      const response = await fetchUserApiData<ProfileDataResponse>(
        ENDPOINTS.profile,
      );
      if (response.data) {
        setProfileData(response.data);
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  const handleSendMessage = async () => {
    if (selectedOption.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Selected field required',
        text2: 'Please select a field before submitting',
      });
      return;
    }
    if (!message.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Message required',
        text2: 'Please type your message before submitting',
      });
      return;
    }
    try {
      setIsBtnLoading(true);
      const data = {
        message: message,
        bug_vs_account: selectedOption, // Array of tags
        platform: Platform.OS, // 'ios' or 'android'
        ...(profileData?.additional?.phone
          ? {
              phone: `${profileData.additional.country_calling_code}${profileData.additional.phone}`,
            }
          : {}),
      };

      const response = await postData<any>(ENDPOINTS.feedback, data);

      if (!response.data.errors) {
        Toast.show({
          type: 'success',
          text1: 'Feedback Submitted',
          text2: 'Thank you for your feedback!',
        });
        setMessage('');
        setSelectedOption([]);
        navigation.goBack();
      }
    } catch (error: any) {
      console.log(error, 'Something went wrong');
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: error?.message || 'Failed to submit feedback. Please try again',
      });
      setIsBtnLoading(false);
    } finally {
      setIsBtnLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      handleFetchProfileData();
    }, []),
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <KeyboardScrollView
        style={{
          gap: verticalScale(30),
          paddingBottom: verticalScale(50),
        }}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop:
                insets.top > 0
                  ? insets.top + verticalScale(10)
                  : verticalScale(20),
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <CustomIcon Icon={ICONS.WhiteLeftArrow} height={18} width={18} />
          </TouchableOpacity>
          <CustomText
            fontFamily="ROBOTO_bold"
            fontSize={22}
            color={COLORS.MCAT_White}
          >
            Feedback
          </CustomText>
        </View>

        {/* Options */}
        <View style={{ paddingHorizontal: horizontalScale(15) }}>
          <CustomText
            fontFamily="ROBOTO_regular"
            fontSize={14}
            color={COLORS.voilet}
          >
            What happened?
          </CustomText>

          <View style={{ paddingHorizontal: horizontalScale(10) }}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.option}
                onPress={() => toggleOption(option)}
              >
                <View style={styles.checkbox}>
                  {selectedOption.includes(option) && (
                    <View style={styles.checked} />
                  )}
                </View>
                <CustomText>{option}</CustomText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Message Input */}
          <View style={{ marginTop: verticalScale(20), gap: verticalScale(5) }}>
            <CustomText
              fontFamily="INTER_regular"
              fontSize={14}
              color={COLORS.greyShade}
            >
              Please tell us how we can help!
            </CustomText>
            <TextInput
              style={styles.textArea}
              placeholder="Type your message..."
              placeholderTextColor={COLORS.greyShade}
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>

          {/* Submit Button */}
          <PrimaryButton
            bgColor={[COLORS.MCAT_Dark_Blue, COLORS.MCAT_Dark_Blue]}
            onPress={handleSendMessage}
            title="Send Message"
            textSize={16}
            gradientStyle={{
              width: wp(90),
              alignSelf: 'center',
            }}
            isLoading={isBtnLoading}
          />
        </View>
      </KeyboardScrollView>
    </SafeAreaView>
  );
};

export default Feedback;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(14),
    gap: horizontalScale(15),
    backgroundColor: COLORS.MCAT_Dark_Blue,
  },

  content: {
    flex: 1,
    paddingHorizontal: horizontalScale(16),
    backgroundColor: COLORS.MCAT_White,
    paddingVertical: verticalScale(35),
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(15),
    marginBottom: verticalScale(10),
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.BoxColor,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    width: 12,
    height: 12,
    backgroundColor: COLORS.blue,
  },

  textArea: {
    minHeight: 200,
    padding: 12,
    marginBottom: 20,
    textAlignVertical: 'top',
    backgroundColor: COLORS.lightGrey,
    color: COLORS.greyText,
    fontSize: responsiveFontSize(14),
  },
  button: {
    backgroundColor: COLORS.blue,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
});
