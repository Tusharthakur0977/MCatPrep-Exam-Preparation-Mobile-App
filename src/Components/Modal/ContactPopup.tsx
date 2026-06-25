import React, { Dispatch, SetStateAction } from 'react';
import {
  Linking,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { horizontalScale, verticalScale, wp } from '../../Utilities/Metrics';
import { CustomText } from '../CustomText';
import CustomIcon from '../CustomIcon';
import ICONS from '../../Assets/Icons';
import { COLORS } from '../../Utilities/Colors';

interface ContactPopupProps {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  onSelect: () => void;
}

const ContactPopup: React.FC<ContactPopupProps> = ({
  isVisible,
  setIsVisible,
}) => {
  const closeModal = () => {
    setIsVisible(false);
  };

  const phoneNumber = ' (627)299-2607';

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={closeModal}
    >
      <TouchableOpacity
        onPress={closeModal}
        activeOpacity={1}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: horizontalScale(10),
        }}
      >
        <View style={styles.modalContent}>
          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: COLORS.lightGrey,
              width: '100%',
              paddingVertical: verticalScale(15),
            }}
          >
            <CustomText
              fontFamily="RUBIK_bold"
              fontSize={18}
              textAlign="center"
            >
              Get In Touch
            </CustomText>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <CustomIcon Icon={ICONS.CrossIcon} height={14} width={14} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{
              borderBottomWidth: 1,
              borderBottomColor: COLORS.lightGrey,
              width: '100%',
              paddingVertical: verticalScale(15),
            }}
            onPress={() => {
              Linking.openURL(`tel:${phoneNumber}`);
              closeModal();
            }}
          >
            <CustomText
              fontFamily="RUBIK_regular"
              textAlign="center"
              color="#1457B2"
            >
              Call Us Now
            </CustomText>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              paddingVertical: verticalScale(15),
            }}
            onPress={() => {
              Linking.openURL(
                'https://app.hubspot.com/meetings/msc/mcat-tutoring?uuid=7a7939bd-d226-4df6-9d72-9cb556dc1ba4',
              );
              closeModal();
            }}
          >
            <CustomText
              fontFamily="RUBIK_regular"
              textAlign="center"
              color="#1457B2"
            >
              Schedule a Free Consultation
            </CustomText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ContactPopup;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: wp(80),
    alignItems: 'center',
    boxShadow:
      'rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px',
  },

  closeButton: {
    position: 'absolute',
    top: verticalScale(15),
    right: horizontalScale(20),
  },
});
