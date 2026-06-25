import AsyncStorage from '@react-native-async-storage/async-storage';

export const getLocalStorageData = async (key: string) => {
  const value = await AsyncStorage.getItem(key);
  if (!value) return null; // Return null if no value exists
  try {
    return JSON.parse(value); // Try to parse as JSON
  } catch (error) {
    console.warn(
      `Could not parse "${key}" as JSON, returning raw value:`,
      value,
    );
    return value; // Return the raw string if parsing fails
  }
};

export const storeLocalStorageData = async (key: string, value: any) => {
  await AsyncStorage.setItem(key, JSON.stringify(value)); // Always store as JSON string
};

export const deleteLocalStorageData = async (key: string) => {
  await AsyncStorage.removeItem(key); // Always store as JSON string
};

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface RBSheetRef {
  open: () => void;
  close: () => void;
}
