import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ICONS from '../../Assets/Icons';
import CustomIcon from '../../Components/CustomIcon';
import { CustomText } from '../../Components/CustomText';
import { MyAccountProps } from '../../Typings/route';
import { COLORS } from '../../Utilities/Colors';
import {
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from '../../Utilities/Metrics';
import DeleteUserModal from '../../Components/Modal/DeleteUserModal';
import { fetchUserApiData } from '../../Services/UserApiService';
import { ProfileDataResponse } from '../../Services/ApiResponses/GetProfileApiResponse';
import ENDPOINTS from '../../Services/ApiEndpoints';
import { useAppSelector } from '../../Redux/store';
import { useFocusEffect } from '@react-navigation/native';

const MyAccount: FC<MyAccountProps> = ({ navigation }) => {
  const [isModal, setIsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userProileData, setUserProileData] =
    useState<ProfileDataResponse | null>(null);

  const handleFetchUserProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await fetchUserApiData<ProfileDataResponse>(
        ENDPOINTS.profile,
      );
      setUserProileData(response.data);
    } catch (error) {
      console.log(error, 'Something went wrong');
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };
  // Reusable Menu Item Component
  const MenuItem = ({
    title,
    subtitle,
    isDeleteAccount,
    onPress,
  }: {
    title: string;
    subtitle?: string;
    isDeleteAccount?: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemHeader}>
          <CustomText
            fontFamily="ROBOTO_medium"
            fontSize={14}
            color={isDeleteAccount ? COLORS.MCAT_Orange : COLORS.black}
          >
            {title}
          </CustomText>
          <CustomIcon Icon={ICONS.ArrowRight} width={15} height={15} />
        </View>
        {subtitle ? (
          <CustomText
            fontFamily="ROBOTO_regular"
            fontSize={14}
            color={'#7E8A9D'}
            style={styles.menuItemSubtitle}
          >
            {subtitle}
          </CustomText>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  useFocusEffect(
    useCallback(() => {
      handleFetchUserProfileData();
    }, []),
  );
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollCont}
      >
        {/* Header */}
        <View style={styles.header}>
          <CustomIcon
            Icon={ICONS.BackArrowIcon}
            height={20}
            width={20}
            onPress={() => navigation.goBack()}
          />
          <CustomText fontFamily="INTER_extraBold" fontSize={22}>
            My Account
          </CustomText>
        </View>

        {/* Profile Section */}
        {!isLoading ? (
          <View style={styles.profileContainer}>
            <View style={styles.ProfileImage}>
              <CustomText
                fontFamily="INTER_regular"
                fontSize={24}
                color={COLORS.white}
              >
                {userProileData?.roles[0]}
              </CustomText>
            </View>
            <CustomText
              fontFamily="INTER_bold"
              fontSize={18}
              style={styles.profileName}
            >
              {userProileData?.first_name !== '' &&
              userProileData?.first_name !== null
                ? `${userProileData?.first_name}`
                : 'Student'}{' '}
              {userProileData?.last_name !== '' &&
              userProileData?.last_name !== null
                ? `${userProileData?.last_name}`
                : ''}
            </CustomText>
          </View>
        ) : (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
              height: hp(13),
              width: wp(27),
              alignSelf: 'center',
            }}
          >
            <ActivityIndicator size="small" color={COLORS.MCAT_Dark_Blue} />
          </View>
        )}
        {/* Menu Options */}
        <View style={styles.menuContainer}>
          <MenuItem
            title="Manage Account"
            subtitle="View and edit account details and subscription info"
            onPress={() =>
              navigation.navigate('mainStack', { screen: 'manageAccount' })
            }
          />
          <MenuItem
            title="Buddies"
            subtitle="Invite a Friend to MCAT Prep"
            onPress={() =>
              navigation.navigate('mainStack', {
                screen: 'buddies',
                params: { showForm: false },
              })
            }
          />
          <MenuItem
            title="My Stats"
            subtitle="See your progress and learning milestone"
            onPress={() =>
              navigation.navigate('mainStack', { screen: 'myStats' })
            }
          />
          <MenuItem
            title="Delete Account"
            subtitle=""
            isDeleteAccount
            onPress={() => {
              setIsModal(true);
            }}
          />
        </View>
        <DeleteUserModal
          isVisible={isModal}
          onClose={() => setIsModal(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyAccount;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: verticalScale(10),
  },
  scrollView: {
    flex: 1,
  },
  scrollCont: {
    gap: verticalScale(20),
    paddingHorizontal: horizontalScale(15),
    paddingBottom: verticalScale(70),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
  },
  profileContainer: {
    alignItems: 'center',
  },
  ProfileImage: {
    backgroundColor: COLORS.MCAT_Yellow,
    height: hp(13),
    width: wp(27),
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    textAlign: 'center',
    marginTop: verticalScale(10),
  },
  menuContainer: {
    paddingHorizontal: horizontalScale(10),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(20),
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.MCAT_Grey,
  },
  menuItemContent: {
    flex: 1,
    gap: verticalScale(10),
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: verticalScale(10),
  },
  menuItemSubtitle: {
    width: '80%',
  },
});
