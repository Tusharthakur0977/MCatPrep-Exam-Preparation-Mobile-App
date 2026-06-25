import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../Utilities/Colors';
import {
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from '../../Utilities/Metrics';
import { FC, useState } from 'react';
import CustomIcon from '../CustomIcon';
import ICONS from '../../Assets/Icons';
import { CustomText } from '../CustomText';
import PrimaryButton from '../PrimaryButton';
import { deleteData } from '../../Services/ApiService';
import ENDPOINTS from '../../Services/ApiEndpoints';
import { deleteLocalStorageData } from '../../Utilities/Helpers';
import STORAGE_KEYS from '../../Utilities/Storage';
import { useAuth0 } from 'react-native-auth0';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAppDispatch } from '../../Redux/store';
import {
  setUSerdata,
  setUserPaymentStatus,
} from '../../Redux/Slices/userSlice';

const DeleteUserModal: FC<{
  isVisible: boolean;
  onClose: () => void;
}> = ({ isVisible, onClose }) => {
  const { clearSession } = useAuth0();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const [loader, setLoader] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      setLoader(true);

      const response = await deleteData(ENDPOINTS.userDelete);

      if (response.status === 200) {
        // 1. Clear redux

        // 3. Clear auth
        await clearSession({ federated: true });
        await deleteLocalStorageData(STORAGE_KEYS.AUTH0_TOKEN);

        Toast.show({
          type: 'success',
          text1: 'Your account has been deleted successfully',
        });
        navigation.replace('splash');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoader(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={modalStyles.centeredView} onPress={onClose}>
        <Pressable
          style={modalStyles.modalView}
          onPress={e => e.stopPropagation()}
        >
          <View>
            <CustomIcon
              Icon={ICONS.CrossIcon}
              height={14}
              width={14}
              style={{
                alignSelf: 'flex-end',
              }}
              onPress={onClose}
            />
            <CustomText
              fontSize={17}
              fontFamily="INTER_bold"
              textAlign="center"
            >
              Are you absolutely sure?
            </CustomText>
          </View>
          <View
            style={{
              paddingHorizontal: horizontalScale(8),
              gap: verticalScale(15),
            }}
          >
            <View style={modalStyles.badTextContainer}>
              <CustomIcon Icon={ICONS.warningIcon} height={12} width={13} />
              <View
                style={{
                  height: 20,
                  width: 1.3,
                  backgroundColor: COLORS.MCAT_Orange,
                }}
              />
              <CustomText fontSize={12} color={COLORS.MCAT_Orange}>
                Bad things will happen if you don't read this!
              </CustomText>
            </View>

            <CustomText
              fontSize={12}
              color={COLORS.MCAT_Grey}
              style={{
                textAlign: 'left',
              }}
            >
              You will delete all of your account data associated with MCAT Prep
              App. This is not recoverable and will log you out of your account.
            </CustomText>
            <TouchableOpacity
              style={modalStyles.deleteBtn}
              onPress={handleDeleteAccount}
              disabled={loader}
            >
              {loader ? (
                <ActivityIndicator
                  color={COLORS.MCAT_White}
                  size="small"
                  style={{ alignSelf: 'center' }}
                />
              ) : (
                <CustomText
                  fontSize={12}
                  fontFamily="INTER_regular"
                  color={COLORS.MCAT_White}
                >
                  I understand the consequences, delete my account
                </CustomText>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default DeleteUserModal;

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dim background
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: COLORS.MCAT_White,
    borderRadius: 20,
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(10),
    width: wp(90),
    gap: verticalScale(15),
    // alignItems: 'center',
  },
  badTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
    backgroundColor: '#FFEBE7',
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(2),
    borderRadius: 6,
  },
  deleteBtn: {
    backgroundColor: '#FE7B5D',
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(10),
    borderRadius: 5,
  },
});
