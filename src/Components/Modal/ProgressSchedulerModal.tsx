import React, { Dispatch, SetStateAction } from 'react';

import { Modal, View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import {
  horizontalScale,
  hp,
  responsiveFontSize,
  verticalScale,
  wp,
} from '../../Utilities/Metrics';
import { COLORS } from '../../Utilities/Colors';
import { CustomText } from '../CustomText';
import IMAGES from '../../Assets/Images';
import PrimaryButton from '../PrimaryButton';
import CustomIcon from '../CustomIcon';
import ICONS from '../../Assets/Icons';

interface ProgressSchedulerModalProps {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  onSelect: () => void;
}

const ProgressSchedulerModal: React.FC<ProgressSchedulerModalProps> = ({
  isVisible,
  setIsVisible,
  onSelect,
}) => {
  const closeModal = () => {
    setIsVisible(false);
  };

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
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: horizontalScale(10),
        }}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={closeModal}>
            <CustomIcon
              Icon={ICONS.BlueCross}
              height={15}
              width={15}
              style={{ alignSelf: 'flex-end', right: -10, top: -10 }}
            />
          </TouchableOpacity>
          <CustomText
            fontFamily="INTER_bold"
            fontSize={22}
            color={COLORS.MCAT_White}
            textAlign="center"
          >
            Speed Up your progress
          </CustomText>
          <CustomText
            fontFamily="INTER_bold"
            fontSize={17}
            color={COLORS.MCAT_White}
            textAlign="center"
          >
            with a hand crafted schedule
          </CustomText>
          <Image
            source={IMAGES.ProgressSchedule}
            resizeMode="contain"
            style={{
              height: hp(20),
              width: '100%',
              alignSelf: 'center',
            }}
          />
          <PrimaryButton
            title="Get Started"
            textColor={COLORS.DarkBlue}
            textSize={responsiveFontSize(14)}
            gradientStyle={{
              width: '80%',
              alignSelf: 'center',
              marginTop: verticalScale(10),
            }}
            onPress={() => {}}
            bgColor={[COLORS.MCAT_White, COLORS.MCAT_White]}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    width: '90%',
    gap: verticalScale(5),
    overflow: 'hidden',
    borderRadius: 15,
    backgroundColor: COLORS.skyColor,
    padding: verticalScale(20),
  },
});

export default ProgressSchedulerModal;
