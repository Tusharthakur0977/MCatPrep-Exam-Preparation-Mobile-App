import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import ICONS from '../../Assets/Icons';
import CustomIcon from '../../Components/CustomIcon';
import { CustomText } from '../../Components/CustomText';
import { KeyboardScrollView } from '../../Components/KeyboardScrollView';
import PrimaryButton from '../../Components/PrimaryButton';
import SearchableInstitutionModal from '../../Components/SearchableInstitutionModal';
import { EditProfileProps } from '../../Typings/route';
import { COLORS } from '../../Utilities/Colors';
import { horizontalScale, verticalScale, wp } from '../../Utilities/Metrics';
import CountryPicker, {
  Country,
  CountryCode,
} from 'react-native-country-picker-modal';
import ENDPOINTS from '../../Services/ApiEndpoints';
import Toast from 'react-native-toast-message';

import { useFocusEffect } from '@react-navigation/native';
import {
  fetchUserApiData,
  putUserApiData,
} from '../../Services/UserApiService';
import { ProfileDataResponse } from '../../Services/ApiResponses/GetProfileApiResponse';

const GRADUATION_YEARS = Array.from({ length: 15 }, (_, i) =>
  (new Date().getFullYear() - i).toString(),
);

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  onPress?: () => void; // For dropdown fields
}

const FormField: FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  onPress,
}) => (
  <View style={styles.fieldContainer}>
    <CustomText fontFamily="INTER_regular" fontSize={12} style={styles.label}>
      {label}
    </CustomText>
    {onPress ? (
      <TouchableOpacity
        onPress={onPress}
        style={styles.inputBoxContainer}
        activeOpacity={0.7}
      >
        <TextInput
          style={[styles.inputBox, styles.readOnlyInput]}
          placeholderTextColor={COLORS.grey}
          value={value}
          editable={false} // Make it read-only
        />
        <CustomIcon
          Icon={ICONS.GreyDropDown} // Assuming this is the arrow icon
          height={20}
          width={20}
          style={styles.dropdownIcon}
        />
      </TouchableOpacity>
    ) : (
      <TextInput
        style={[styles.inputBox, styles.standardInput]}
        placeholderTextColor={COLORS.grey}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    )}
  </View>
);

interface PhoneInputProps {
  label: string;
  phoneNumber: string;
  onPhoneNumberChange: (text: string) => void;
  countryCode: CountryCode;
  onCountrySelect: (country: Country) => void;
}

const PhoneInputWithCountry: FC<PhoneInputProps> = ({
  label,
  phoneNumber,
  onPhoneNumberChange,
  countryCode,
  onCountrySelect,
}) => (
  <View style={styles.fieldContainer}>
    <CustomText fontFamily="INTER_regular" fontSize={12} style={styles.label}>
      {label}
    </CustomText>
    <View style={styles.inputBoxContainer}>
      <View style={styles.countryPickerContainer}>
        <CountryPicker
          {...{
            countryCode,
            onSelect: onCountrySelect,
            withFilter: true,
            withCallingCodeButton: true,
            withFlagButton: true,
            withCallingCode: true,
            containerButtonStyle: styles.countryPickerButton,
          }}
          visible={false}
        />
        <CustomIcon
          Icon={ICONS.DropdownIcon}
          height={10}
          width={10}
          style={styles.countryCodeIcon}
        />
      </View>

      <View style={styles.codeSeparator} />

      <TextInput
        style={styles.phoneNumberInput}
        placeholderTextColor={COLORS.grey}
        placeholder="Enter phone number"
        value={phoneNumber}
        onChangeText={onPhoneNumberChange}
        keyboardType="phone-pad"
      />
    </View>
  </View>
);

interface DropdownModalProps {
  isVisible: boolean;
  options: string[];
  onSelect: (value: string) => void;
  onClose: () => void;
  title: string;
}

const DropdownModal: FC<DropdownModalProps> = ({
  isVisible,
  options,
  onSelect,
  onClose,
  title,
}) => {
  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <CustomText
            fontFamily="INTER_bold"
            fontSize={18}
            style={styles.modalTitle}
          >
            Select {title}
          </CustomText>
          <FlatList
            data={options}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <CustomText fontFamily="INTER_regular" fontSize={16}>
                  {item}
                </CustomText>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <CustomText
              fontFamily="INTER_bold"
              fontSize={16}
              color={COLORS.MCAT_Dark_Blue}
            >
              Close
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const EditProfile: FC<EditProfileProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [institution, setInstitution] = useState('Select Institution');
  const [graduationYear, setGraduationYear] = useState('Select Year');
  const [countryCode, setCountryCode] = useState<CountryCode>('US'); // Default to US
  const [country, setCountry] = useState<Country | null>(null);
  const [isBtnLoader, setIsBtnLoader] = useState(false);
  const [isYearModalVisible, setIsYearModalVisible] = useState(false);
  const [profileData, setProfileData] = useState<ProfileDataResponse | null>(
    null,
  );
  const [isInstitutionModalVisible, setIsInstitutionModalVisible] =
    useState(false);
  const onSelectCountry = (selectedCountry: Country) => {
    setCountryCode(selectedCountry.cca2);
    setCountry(selectedCountry);
  };

  const handleSave = async () => {
    try {
      setIsBtnLoader(true);
      const additionalData: any = {
        institution: institution || '',
        undergraduate: Number(graduationYear) || null,
        country_calling_code: country?.callingCode?.[0]
          ? String(country.callingCode[0])
          : profileData?.additional?.country_calling_code || null,
        country_code:
          countryCode || profileData?.additional?.country_code || null,
        phone: phoneNumber || profileData?.additional?.phone || null,
      };

      const data = {
        first_name: firstName || '',
        last_name: lastName || '',
        additional: additionalData,
      };

      const response = await putUserApiData(ENDPOINTS.profile, data);
      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Profile Updated',
          text2: 'Your profile has been saved successfully',
        });
      }
      await getProfileData();
      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error?.message || 'Failed to update profile. Please try again',
      });
      setIsBtnLoader(false);
    } finally {
      setIsBtnLoader(false);
    }
  };

  const getProfileData = async () => {
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

  useFocusEffect(
    useCallback(() => {
      getProfileData();
    }, []),
  );

  useEffect(() => {
    if (profileData) {
      // FIRST & LAST NAME
      setFirstName(profileData.first_name ?? '');
      setLastName(profileData.last_name ?? '');

      // PHONE NUMBER
      setPhoneNumber(profileData.additional?.phone ?? '');

      // COUNTRY CODE + CALLING CODE
      if (profileData.additional?.country_code) {
        setCountryCode(profileData.additional.country_code as CountryCode);
      } else {
        setCountryCode('IN'); // default India
      }

      if (profileData.additional?.country_calling_code) {
        setCountry({
          callingCode: [profileData.additional.country_calling_code],
        } as any);
      } else {
        setCountry({
          callingCode: ['91'], // default +91
        } as any);
      }

      // INSTITUTION
      setInstitution(
        profileData.additional?.institution ?? 'Select Institution',
      );

      // GRADUATION YEAR
      const gradYear = profileData.additional?.undergraduate;
      if (gradYear) {
        setGraduationYear(String(gradYear));
      } else {
        setGraduationYear(String(new Date().getFullYear())); // default
      }
    }
  }, [profileData]);

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
      <KeyboardScrollView style={{ paddingBottom: verticalScale(20) }}>
        {/* Header/Illustration Section */}
        <View style={styles.topContainer}>
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                paddingTop:
                  insets.top > 0
                    ? insets.top + verticalScale(10)
                    : verticalScale(20),
              },
            ]}
            activeOpacity={0.8}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <CustomIcon
              Icon={ICONS.BlackArrowBackIcon}
              height={verticalScale(24)}
              width={verticalScale(24)}
            />
          </TouchableOpacity>

          <CustomIcon
            Icon={ICONS.EditProfileillustration}
            width={wp(80)} // Using wp for better scaling
            height={verticalScale(182)}
          />
        </View>

        {/* Form Overlay Card */}
        {profileData ? (
          <View style={styles.overlayCard}>
            <CustomText fontFamily="INTER_extraBold" fontSize={24}>
              Edit Profile
            </CustomText>
            <View style={styles.form}>
              <FormField
                label="First Name"
                value={firstName}
                onChangeText={setFirstName}
              />
              <FormField
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
              />

              <PhoneInputWithCountry
                label="Phone Number"
                phoneNumber={phoneNumber}
                onPhoneNumberChange={setPhoneNumber}
                countryCode={countryCode}
                onCountrySelect={onSelectCountry}
              />

              <FormField
                label="Undergraduate Institution"
                value={
                  institution.length > 30
                    ? `${institution.slice(0, 30)}...`
                    : institution
                }
                onPress={() => setIsInstitutionModalVisible(true)}
              />
              <FormField
                label="Graduation Year"
                value={graduationYear}
                onPress={() => setIsYearModalVisible(true)}
              />

              <PrimaryButton
                title="Save"
                onPress={handleSave}
                bgColor={[COLORS.MCAT_Dark_Blue, COLORS.MCAT_Dark_Blue]}
                textSize={18}
                isLoading={isBtnLoader}
              />
            </View>
          </View>
        ) : (
          <View
            style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}
          >
            <ActivityIndicator size="large" color={COLORS.MCAT_Dark_Blue} />
          </View>
        )}
      </KeyboardScrollView>

      <SearchableInstitutionModal
        isVisible={isInstitutionModalVisible}
        onSelect={setInstitution}
        onClose={() => setIsInstitutionModalVisible(false)}
      />
      <DropdownModal
        isVisible={isYearModalVisible}
        options={GRADUATION_YEARS}
        onSelect={setGraduationYear}
        onClose={() => setIsYearModalVisible(false)}
        title="Graduation Year"
      />
    </SafeAreaView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
  },
  backButton: {
    zIndex: 1000,
    marginLeft: horizontalScale(10),
    paddingRight: horizontalScale(10),
  },
  overlayCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(20),
    gap: verticalScale(10),
  },
  form: {
    gap: verticalScale(20),
  },

  fieldContainer: {
    gap: verticalScale(8),
  },
  label: {
    color: '#102B42',
  },
  inputBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECF3F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECF3F9',
    minHeight: verticalScale(48),
  },

  inputBox: {
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(15),
    color: COLORS.black,
    backgroundColor: '#ECF3F9',
  },
  standardInput: {
    flex: 1,
  },
  readOnlyInput: {
    flex: 1,
  },
  dropdownIcon: {
    marginRight: horizontalScale(15),
    color: COLORS.black,
  },

  countryPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: horizontalScale(10),
    paddingRight: horizontalScale(5),
  },
  countryPickerButton: {
    paddingVertical: 0,
    justifyContent: 'center',
  },
  countryCodeIcon: {
    marginLeft: horizontalScale(5),
    color: COLORS.black,
  },
  codeSeparator: {
    width: 1,
    height: '60%',
    backgroundColor: COLORS.grey,
  },
  phoneNumberInput: {
    flex: 1,
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(15),
    color: COLORS.black,
    backgroundColor: '#ECF3F9',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: horizontalScale(20),
  },
  modalTitle: {
    marginBottom: verticalScale(15),
    textAlign: 'center',
    color: COLORS.MCAT_Dark_Blue,
  },
  modalItem: {
    paddingVertical: verticalScale(12),
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.lightGrey,
  },
  closeButton: {
    marginTop: verticalScale(20),
    padding: verticalScale(10),
    alignItems: 'center',
  },
});
