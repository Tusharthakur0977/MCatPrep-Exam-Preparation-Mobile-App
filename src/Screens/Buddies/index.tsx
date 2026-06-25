import React, { FC, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import FONTS from '../../Assets/Fonts';
import ICONS from '../../Assets/Icons';
import BlueBubbleContainer from '../../Components/BlueBubbleContainer';
import CustomIcon from '../../Components/CustomIcon';
import { CustomText } from '../../Components/CustomText';
import { KeyboardScrollView } from '../../Components/KeyboardScrollView';
import PrimaryButton from '../../Components/PrimaryButton';
import { BuddiesScreenProps } from '../../Typings/route';
import { COLORS } from '../../Utilities/Colors';
import { horizontalScale, verticalScale, wp } from '../../Utilities/Metrics';
import ENDPOINTS from '../../Services/ApiEndpoints';
import { getLocalStorageData } from '../../Utilities/Helpers';
import STORAGE_KEYS from '../../Utilities/Storage';
import { fetchData, postData } from '../../Services/MedSchoolApiService';

export type InviteFriendResponse = InviteFriend[];

export interface InviteFriend {
  id: string;
  user_id: string;
  invited_email: string;
  invited_first_name: string;
  invited_last_name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const Buddies: FC<BuddiesScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { showForm } = route.params;

  const [showInvite, setShowInvite] = useState(showForm);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInvitedFriend, setIsInvitedFriend] =
    useState<InviteFriendResponse | null>(null);
  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
  });

  // Email validation regex
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleInviteFriend = async () => {
    // Trim all inputs
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();

    // Reset errors
    const newErrors = {
      firstName: false,
      lastName: false,
      email: false,
    };

    if (!trimmedEmail) {
      newErrors.email = true;
      setErrors(newErrors);
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: "Please enter your friend's email address.",
      });
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      newErrors.email = true;
      setErrors(newErrors);
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
      });
      return;
    }

    try {
      setIsLoading(true);
      setErrors(newErrors); // Clear all errors

      const payload = {
        email: trimmedEmail,
        ...(trimmedFirstName && { first_name: trimmedFirstName }),
        ...(trimmedLastName && { last_name: trimmedLastName }),
      };

      const inviteFriend = await postData(
        `${ENDPOINTS.addReferral}`,

        payload,
      );

      if (inviteFriend) {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Invitation sent successfully.',
        });
        setShowInvite(false);
        setFirstName('');
        setLastName('');
        setEmail('');
        setErrors({
          firstName: false,
          lastName: false,
          email: false,
        });
      }
    } catch (error) {
      console.log('Error inviting friend:', error);
      Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: 'Failed to send invitation. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetInvitedFriend = async () => {
    try {
      const response = await fetchData(ENDPOINTS.addReferral);
      console.log('RESE', response.data);
      if (response.data) {
        setIsInvitedFriend(response.data!);
      }
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  const renderInvitedFriend = ({ item }: { item: InviteFriend }) => {
    const name = item.invited_first_name || item.invited_last_name || 'Unknown';
    const firstLetter = name.charAt(0).toUpperCase();

    // Format date without moment
    const dateObj = new Date(item.created_at);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };
    const inviteDate = dateObj.toLocaleDateString('en-US', options); // e.g., "30 Jan, 2026"

    // Status Color
    const statusColor =
      item.status === 'Accepted'
        ? '#22C55E'
        : item.status === 'Rejected'
        ? '#EF4444'
        : '#F59E0B'; // Sent / Pending

    return (
      <View style={styles.card}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <CustomText style={styles.avatarText}>{firstLetter}</CustomText>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <CustomText style={styles.name}>{name}</CustomText>
          <CustomText style={styles.email}>{item.invited_email}</CustomText>
          <CustomText style={styles.date}>Invited on {inviteDate}</CustomText>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusContainer, { borderColor: statusColor }]}>
          <CustomText style={[styles.statusText, { color: statusColor }]}>
            {item.status}
          </CustomText>
        </View>
      </View>
    );
  };

  useEffect(() => {
    handleGetInvitedFriend();
  }, []);

  return (
    <SafeAreaView
      edges={
        showInvite
          ? ['bottom', 'left', 'right']
          : ['top', 'bottom', 'right', 'left']
      }
      style={styles.container}
    >
      {showInvite && (
        <KeyboardScrollView
          style={{
            paddingBottom: verticalScale(20),
          }}
        >
          <TouchableOpacity
            style={{
              position: 'absolute',
              left: horizontalScale(15),
              top:
                insets.top > 0
                  ? insets.top + verticalScale(10)
                  : verticalScale(20),
              zIndex: 1000,
            }}
            activeOpacity={0.8}
            onPress={() => {
              if (!route.params.showForm) {
                setShowInvite(false);
              } else {
                navigation.goBack();
              }
            }}
          >
            <CustomIcon
              Icon={ICONS.WhiteLeftArrow}
              height={verticalScale(20)}
              width={verticalScale(20)}
            />
          </TouchableOpacity>
          <BlueBubbleContainer
            mainStyle={{
              paddingTop: insets.top,
              width: wp(100),
              alignSelf: 'center',
            }}
            contentStyle={{ alignItems: 'center' }}
          >
            <CustomIcon
              Icon={ICONS.IllustrationBuddies}
              height={200}
              width={200}
            />
          </BlueBubbleContainer>
          <View style={styles.overlayCard}>
            <CustomText
              fontFamily="ROBOTO_bold"
              fontSize={18}
              color={COLORS.black}
            >
              Studying is Better Together
            </CustomText>

            <CustomText
              fontFamily="ROBOTO_regular"
              fontSize={14}
              style={{ marginTop: verticalScale(5) }}
            >
              Invite a friend to download the MCAT Prep app and we’ll send you a
              $100 Amazon Gift Card.
            </CustomText>

            <CustomText
              fontFamily="ROBOTO_semiBold"
              fontSize={14}
              color={COLORS.DarkBlue}
              style={{
                marginTop: verticalScale(5),
                textDecorationLine: 'underline',
              }}
            >
              MSC Pre-Med Swag Store
            </CustomText>

            <View style={styles.form}>
              <View style={{ gap: verticalScale(5) }}>
                <CustomText fontFamily="INTER_regular" fontSize={12}>
                  Friend's First Name
                </CustomText>
                <TextInput
                  style={[
                    styles.inputBox,
                    errors.firstName && styles.inputBoxError,
                  ]}
                  placeholderTextColor={COLORS.grey}
                  value={firstName}
                  onChangeText={text => {
                    setFirstName(text);
                    if (errors.firstName) {
                      setErrors({ ...errors, firstName: false });
                    }
                  }}
                />
              </View>
              <View style={{ gap: verticalScale(5) }}>
                <CustomText fontFamily="INTER_regular" fontSize={12}>
                  Friend's Last Name
                </CustomText>
                <TextInput
                  style={[
                    styles.inputBox,
                    errors.lastName && styles.inputBoxError,
                  ]}
                  placeholderTextColor={COLORS.grey}
                  value={lastName}
                  onChangeText={text => {
                    setLastName(text);
                    if (errors.lastName) {
                      setErrors({ ...errors, lastName: false });
                    }
                  }}
                />
              </View>
              <View style={{ gap: verticalScale(5) }}>
                <CustomText fontFamily="INTER_regular" fontSize={12}>
                  Friend's Email
                </CustomText>
                <TextInput
                  style={[
                    styles.inputBox,
                    errors.email && styles.inputBoxError,
                  ]}
                  placeholderTextColor={COLORS.grey}
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    if (errors.email) {
                      setErrors({ ...errors, email: false });
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <PrimaryButton
              bgColor={[COLORS.DarkBlue, COLORS.DarkBlue]}
              onPress={handleInviteFriend}
              title="Invite a Friend"
              textColor={COLORS.white}
              textStyle={{
                fontFamily: FONTS.INTER_bold,
              }}
              style={{
                paddingVertical: verticalScale(15),
              }}
              gradientStyle={{
                marginTop: verticalScale(25),
                borderRadius: 30,
              }}
              isFullWidth={true}
              textSize={16}
              isLoading={isLoading}
              disabled={isLoading}
            />
          </View>
        </KeyboardScrollView>
      )}

      {!showInvite && (
        <View style={{ flex: 1, gap: verticalScale(20) }}>
          <View style={styles.header}>
            <CustomIcon
              Icon={ICONS.BackArrowIcon}
              height={20}
              width={20}
              onPress={() => navigation.goBack()}
            />
            <CustomText fontFamily="INTER_extraBold" fontSize={22}>
              Buddies
            </CustomText>
          </View>

          <View
            style={{
              width: wp(95),
              alignSelf: 'center',
            }}
          >
            <BlueBubbleContainer
              mainStyle={{
                borderRadius: 10,
                padding: 10,
              }}
              contentStyle={{
                flexDirection: 'row',
                paddingVertical: verticalScale(10),
              }}
            >
              <View style={{ width: '55%', zIndex: 100 }}>
                <CustomText
                  color={COLORS.MCAT_White}
                  fontSize={19}
                  fontFamily="ROBOTO_bold"
                  textAlign="center"
                >
                  Studying is Better Together
                </CustomText>
                <CustomText
                  color={COLORS.MCAT_White}
                  fontFamily="ROBOTO_bold"
                  textAlign="center"
                  fontSize={14.6}
                >
                  Give your friends MCAT Prep and we'll send you a
                </CustomText>
                <CustomText
                  color={COLORS.MCAT_White}
                  fontFamily="ROBOTO_bold"
                  textAlign="center"
                  fontSize={26}
                >
                  $100 Amazon Gift Card
                </CustomText>
                <PrimaryButton
                  bgColor={['white', 'white']}
                  onPress={() => {
                    setShowInvite(true);
                  }}
                  title="Invite a Friend"
                  textColor={COLORS.MCAT_Dark_Blue}
                  textStyle={{
                    fontFamily: FONTS.ROBOTO_bold,
                  }}
                  style={{
                    paddingVertical: verticalScale(10),
                  }}
                  gradientStyle={{
                    width: '80%',
                    alignSelf: 'center',
                    marginTop: verticalScale(10),
                  }}
                  isFullWidth={false}
                  textSize={15}
                />
              </View>
              <CustomIcon
                Icon={ICONS.illustrationCropped}
                height={200}
                width={170}
                style={{}}
              />
            </BlueBubbleContainer>
          </View>
          <FlatList
            data={isInvitedFriend}
            renderItem={renderInvitedFriend}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: horizontalScale(10),
              gap: verticalScale(10),
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default Buddies;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollCont: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
    paddingHorizontal: horizontalScale(10),
    paddingTop: verticalScale(10),
  },
  inviteBtn: {
    backgroundColor: COLORS.MCAT_White,
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(15),
    borderRadius: 40,
    alignItems: 'center',
  },
  form: {
    marginTop: verticalScale(20),
    gap: verticalScale(15),
  },
  inputBox: {
    backgroundColor: COLORS.lightGrey,
    borderRadius: 5,
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(12),
    fontSize: 14,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputBoxError: {
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  inviteBtn2: {
    marginTop: verticalScale(25),
    backgroundColor: COLORS.DarkBlue,
    paddingVertical: verticalScale(15),
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(20),
  },
  fallbackBackground: {
    flex: 1,
    backgroundColor: COLORS.DarkBlue,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    marginVertical: 6,
    marginHorizontal: 12,
    borderRadius: 12,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },

    elevation: 2,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#4A6CF7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A2540',
  },

  email: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  date: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 3,
  },

  statusContainer: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
