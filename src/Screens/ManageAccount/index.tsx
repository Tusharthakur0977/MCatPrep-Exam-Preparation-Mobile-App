import { useFocusEffect } from '@react-navigation/native';
import React, { FC, useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { deepLinkToSubscriptions } from 'react-native-iap';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import ICONS from '../../Assets/Icons';
import CustomIcon from '../../Components/CustomIcon';
import { CustomText } from '../../Components/CustomText';
import PrimaryButton from '../../Components/PrimaryButton';
import { useAppSelector } from '../../Redux/store';
import ENDPOINTS from '../../Services/ApiEndpoints';
import { ProfileDataResponse } from '../../Services/ApiResponses/GetProfileApiResponse';
import { fetchUserApiData } from '../../Services/UserApiService';
import { ManageAccountProps } from '../../Typings/route';
import { COLORS } from '../../Utilities/Colors';
import {
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from '../../Utilities/Metrics';

const ManageAccount: FC<ManageAccountProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { userData } = useAppSelector(state => state.user);
  const segmentCount = 25; // you can adjust number of dots/dashes
  const segmentWidth = wp(82) / segmentCount;
  const [profileData, setProfileData] = useState<ProfileDataResponse | null>(
    null,
  );
  const [isLoading, setisLoading] = useState(false);
  const { data } = useAppSelector(state => state.subscription);

  const handleGetUserProfileData = async () => {
    try {
      setisLoading(true);
      const response = await fetchUserApiData<ProfileDataResponse>(
        ENDPOINTS.profile,
      );
      setProfileData(response.data);
      if (response.data) {
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
      setisLoading(false);
    } finally {
      setisLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';

    const date = new Date(dateString.replace(' ', 'T'));

    if (isNaN(date.getTime())) return '';

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const formatUSD = (amount: number | any) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const handleManageAccount = async () => {
    await deepLinkToSubscriptions({
      skuAndroid: data?.plan_id,
      packageNameAndroid: 'com.htd.medschoolcoach', // Your app's package name
    });
  };

  useFocusEffect(
    useCallback(() => {
      handleGetUserProfileData();
    }, []),
  );

  if (isLoading) {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <ActivityIndicator size="large" color={COLORS.MCAT_Dark_Blue} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollCont,
          {
            paddingTop: insets.top,
          },
        ]}
      >
        <View style={styles.headerBg} />

        {/* Header Row */}
        <View style={styles.headerRow}>
          <CustomIcon
            Icon={ICONS.WhiteLeftArrow}
            height={20}
            width={20}
            onPress={() => navigation.goBack()}
          />
          <CustomText
            fontFamily="INTER_extraBold"
            fontSize={22}
            color={COLORS.white}
          >
            Manage Account
          </CustomText>
        </View>

        {/* Profile Circle */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <View style={styles.innerCircle}>
              <CustomText
                fontFamily="INTER_medium"
                fontSize={24}
                color={COLORS.white}
              >
                {profileData?.roles[0]}
              </CustomText>
            </View>
          </View>
        </View>

        {/* Name Row */}
        <View style={styles.nameRow}>
          <CustomText
            fontFamily="INTER_extraBold"
            fontSize={18}
            color={COLORS.MCAT_Dark_Blue}
          >
            {profileData?.first_name} {profileData?.last_name}
          </CustomText>
          <CustomIcon
            onPress={() => {
              navigation.navigate('mainStack', { screen: 'editProfile' });
            }}
            Icon={ICONS.EditTextIcon}
            height={14}
            width={14}
          />
        </View>

        <View style={styles.mainContent}>
          {/* Contact Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <CustomIcon Icon={ICONS.EnvelopeIcon} height={18} width={18} />
              <CustomText fontSize={14}>{profileData?.email}</CustomText>
            </View>
            <View style={styles.infoRow}>
              <CustomIcon Icon={ICONS.telephoneIcon} height={18} width={18} />
              <CustomText fontSize={14}>
                {profileData?.additional &&
                profileData.additional.country_calling_code &&
                profileData.additional.phone ? (
                  <>
                    {`+${profileData?.additional?.country_calling_code} ${profileData?.additional?.phone}`}
                  </>
                ) : (
                  'N/A'
                )}
              </CustomText>
            </View>
            <View style={styles.infoRow}>
              <CustomIcon Icon={ICONS.ScholarIcon} height={18} width={18} />
              <CustomText fontSize={14}>
                {profileData?.additional &&
                profileData.additional.institution &&
                profileData.additional.undergraduate ? (
                  <>
                    {profileData?.additional?.institution} –{' '}
                    {profileData?.additional?.undergraduate}
                  </>
                ) : (
                  'N/A'
                )}
              </CustomText>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Current Plan Section */}
          <View style={styles.planHeader}>
            <CustomText
              fontFamily="INTER_medium"
              fontSize={14}
              color={COLORS.MCAT_Grey}
            >
              CURRENT PLAN
            </CustomText>
          </View>

          {/* Payment Info */}
          <View style={styles.paymentSection}>
            <CustomText
              fontFamily="INTER_bold"
              fontSize={14}
              color={COLORS.MCAT_Dark_Blue}
              textAlign="right"
            >
              {data && data?.name}
            </CustomText>
            <View
              style={{
                flexDirection: 'row',
                gap: horizontalScale(3),
                alignSelf: 'center',
              }}
            >
              {Array.from({ length: segmentCount }).map((_, index) => (
                <View
                  key={index}
                  style={[styles.dashedLine, { width: segmentWidth - 2 }]}
                />
              ))}
            </View>
            <CustomText
              fontSize={14}
              fontFamily="RUBIK_regular"
              color={COLORS.MCAT_Grey}
            >
              Your next payment of{' '}
              <CustomText fontSize={14} fontFamily="RUBIK_medium">
                {data ? formatUSD(data?.price) : 'N/A'}{' '}
              </CustomText>
              will be charged on{' '}
              <CustomText fontSize={14} fontFamily="RUBIK_medium">
                {data ? formatDate(data?.ends_at) : 'N/A'}
              </CustomText>
            </CustomText>

            <CustomText
              fontSize={14}
              fontFamily="RUBIK_regular"
              color={COLORS.MCAT_Grey}
            >
              Your subscription will be automatically renewed.
            </CustomText>
          </View>

          {/* Manage Plan Button */}
          <PrimaryButton
            title="MANAGE YOUR PLAN"
            onPress={handleManageAccount}
            textSize={16}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageAccount;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: hp(22),
    backgroundColor: COLORS.MCAT_Dark_Blue,
  },
  scrollCont: {
    paddingBottom: verticalScale(20),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
    paddingHorizontal: horizontalScale(15),
    marginTop: verticalScale(10),
  },
  avatarWrapper: {
    alignItems: 'center',
    marginTop: verticalScale(30),
  },
  avatarCircle: {
    height: 120,
    width: 120,
    borderRadius: 60,
    backgroundColor: '#E87120',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    height: 115,
    width: 115,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
    borderRadius: 61,
  },
  nameRow: {
    marginTop: verticalScale(10),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: horizontalScale(5),
  },
  mainContent: {
    paddingHorizontal: horizontalScale(20),
    gap: verticalScale(20),
  },
  infoSection: {
    marginTop: verticalScale(20),
    gap: verticalScale(12),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.LightGrey,
    marginVertical: verticalScale(10),
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentSection: {
    gap: verticalScale(20),
  },
  manageBtn: {
    marginTop: verticalScale(25),
    marginHorizontal: horizontalScale(20),
    backgroundColor: COLORS.green,
    paddingVertical: verticalScale(12),
    borderRadius: 25,
    alignItems: 'center',
  },
  dashedLine: {
    height: 1,
    width: wp(100) / 20,
    marginVertical: verticalScale(5),
    backgroundColor: COLORS.greyText,
  },
});
