// Components/CustomDropdown.tsx
import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { CustomText } from './CustomText';
import { COLORS } from '../Utilities/Colors';
import CustomIcon from './CustomIcon';
import ICONS from '../Assets/Icons';
import { hp } from '../Utilities/Metrics';
import { useAppSelector } from '../Redux/store';
import { KeyboardAvoidingContainer } from './KeyBoardAvoding';

interface Option {
  label: string;
  value: string;
}

type CustomDropdownProps = {
  selectedValue: string;
  onSelect: (value: string) => void;
  options: { label: string; value: string }[];
};

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  selectedValue,
  onSelect,
  options = [
    { label: 'All', value: 'All' },
    { label: 'Biochemistry', value: 'Biochemistry' },
    { label: 'General Chemistry', value: 'General Chemistry' },
    { label: 'Psychology', value: 'Psychology' },
    { label: 'Biology', value: 'Biology' },
    { label: 'Organic', value: 'Organic' },
    { label: 'Sociology', value: 'Sociology' },
    { label: 'Physics', value: 'Physics' },
  ],
}) => {
  return (
    <ScrollView
      style={styles.dropdownOptions}
      bounces={false}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
    >
      {options.map(option => {
        const isSelected = option.value === selectedValue;

        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={styles.option}
            activeOpacity={0.7}
          >
            <CustomText
              fontSize={12}
              fontFamily="ROBOTO_medium"
              color={COLORS.fadeGrey}
            >
              {option.label}
            </CustomText>

            {/* Checkbox */}
            <View
              style={[
                styles.checkbox,
                isSelected && {
                  borderColor: COLORS.greyShade,
                  backgroundColor: COLORS.white,
                },
              ]}
            >
              {isSelected && (
                <CustomIcon
                  Icon={ICONS.GreenCheckbox}
                  height={22}
                  width={22}
                  style={{ left: 5, bottom: 2 }}
                />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  dropdownOptions: {
    position: 'absolute',
    top: 30,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10,
    minWidth: 180,
    maxHeight: hp(30),
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: COLORS.grey,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomDropdown;
