import React, { FC, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import FONTS from '../Assets/Fonts';
import ICONS from '../Assets/Icons';
import { COLORS } from '../Utilities/Colors';
import { horizontalScale, verticalScale, wp } from '../Utilities/Metrics';
import CustomIcon from './CustomIcon';
import { CustomText } from './CustomText';
import PrimaryButton from './PrimaryButton';
import { patchData } from '../Services/ApiService';
import ENDPOINTS from '../Services/ApiEndpoints';

type ScheduleCalendarProps = {
  isModalVisible: boolean;
  closeModal: () => void;
  onPressApply: (selectedDate: string) => void;
};

const ScheduleCalendar: FC<ScheduleCalendarProps> = ({
  isModalVisible,
  closeModal,
  onPressApply,
}) => {
  const [selected, setSelected] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleDayPress = (day: { dateString: string }) => {
    setSelected(day.dateString);

    const todayDate = new Date();
    const selectedDate = new Date(day.dateString);

    // Calculate the difference in days
    const diffInMilliseconds = selectedDate.getTime() - todayDate.getTime();
    const diffInDays = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24));

    // Show warning if the selected date is within 14 days
    setShowWarning(diffInDays <= 14);
  };

  const handleUpdateDate = async () => {
    if (!selected) {
      return;
    }
    try {
      const data = {
        mcatTestDate: selected,
      };
      const response = await patchData(ENDPOINTS.completeOnboarding, data);
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  return (
    <Modal transparent={true} visible={isModalVisible} animationType="fade">
      <TouchableOpacity
        activeOpacity={1}
        onPress={closeModal}
        style={styles.modalContainer}
      >
        <View
          style={styles.modalContent}
          onStartShouldSetResponder={() => true} // Capture touch events
          onResponderRelease={e => e.stopPropagation()} // Prevent propagation
        >
          <CustomText
            color={COLORS.darkBlue}
            fontFamily="ROBOTO_medium"
            fontSize={15}
          >
            Select Test Date
          </CustomText>
          <Calendar
            minDate={today}
            theme={{
              textSectionTitleColor: COLORS.darkBlue,
              selectedDayTextColor: COLORS.voilet,
              todayTextColor: COLORS.green,
              dayTextColor: COLORS.voilet,
              textDisabledColor: '#E9E9E9',
              monthTextColor: COLORS.voilet,
              textMonthFontFamily: FONTS.ROBOTO_semiBold,
              arrowColor: COLORS.darkBlue,
            }}
            onDayPress={handleDayPress}
            markedDates={{
              [selected]: {
                selected: true,
                selectedColor: '#FE7B5D',
                selectedTextColor: COLORS.white,
              },
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <PrimaryButton
              title="Cancel"
              onPress={() => {
                setSelected('');
                closeModal();
              }}
              style={styles.applyButton}
              isFullWidth={false}
              bgColor={['transparent', 'transparent']}
              textColor={COLORS.voilet}
              textSize={12}
            />
            <PrimaryButton
              title="CONFIRM"
              onPress={() => {
                onPressApply(selected);
                if (selected) {
                  handleUpdateDate();
                }
              }}
              style={styles.applyButton}
              isFullWidth={false}
              textSize={12}
            />
          </View>
          {showWarning && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: horizontalScale(5),
              }}
            >
              <CustomIcon Icon={ICONS.WarningOrange} height={15} width={15} />
              <CustomText
                color={'#FE7B5DA6'}
                fontFamily="ROBOTO_regular"
                fontSize={10}
                style={{ flex: 1 }}
              >
                Your test is approaching quickly. The fastest schedule we
                provide from start to finish is 15 days.
              </CustomText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ScheduleCalendar;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: wp(80),
    backgroundColor: COLORS.white,
    gap: verticalScale(15),
    borderRadius: 28,
    overflow: 'hidden',
    padding: verticalScale(25),
  },

  applyButton: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(15),
  },
});
