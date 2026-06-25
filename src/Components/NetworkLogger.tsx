import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Modal,
} from 'react-native';
import NL from 'react-native-network-logger';
import { useState } from 'react';
import { COLORS } from '../Utilities/Colors';

const NetworkLogger = ({ onPress }: { onPress?: () => void }) => {
  const [isNetworkModalVisible, setIsNetworkVIsible] = useState(false);
  return (
    <>
      <Modal
        style={styles.modal}
        visible={isNetworkModalVisible}
        // onBackButtonPress={() => setIsNetworkVIsible(false)}
      >
        <SafeAreaView style={styles.contentContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsNetworkVIsible(false)}
          >
            <Text style={styles.closeButtonTitle}>{'CLOSE'}</Text>
          </TouchableOpacity>
          <NL />
        </SafeAreaView>
      </Modal>
      <TouchableOpacity
        style={styles.container}
        onPress={() => {
          onPress && onPress();
          setIsNetworkVIsible(true);
        }}
      >
        <Text style={styles.content}>{'Network Logs'}</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    backgroundColor: COLORS.white,
  },
  container: {
    width: 45,
    height: 45,
    position: 'absolute',
    left: 24,
    bottom: 80,
    borderRadius: 45,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    fontSize: 9,
    textAlign: 'center',
    color: 'white',
  },
  contentContainer: {
    flex: 1,
  },
  closeButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButtonTitle: {
    textAlign: 'center',
  },
});

export default React.memo(NetworkLogger);
