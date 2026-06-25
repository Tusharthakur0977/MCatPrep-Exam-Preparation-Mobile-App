import { FC } from 'react';
import {
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import IMAGES from '../../Assets/Images';
import { COLORS } from '../../Utilities/Colors';
import {
  horizontalScale,
  hp,
  verticalScale,
  wp,
} from '../../Utilities/Metrics';

const PODCAST_PLATFORMS = [
  {
    name: 'Apple Podcasts',
    icon: IMAGES.AppleMusic, // Placeholder for Apple Podcasts icon
    color: COLORS.MCAT_Dark_Blue,
  },
  {
    name: 'Google Podcasts',
    icon: IMAGES.GooglePodcast, // Placeholder for Google Podcasts icon
    color: COLORS.MCAT_SkyBlue,
  },
  {
    name: 'Spotify',
    icon: IMAGES.Spotify, // Placeholder for Spotify icon
    color: COLORS.MCAT_Green,
  },
  {
    name: 'Stitcher',
    icon: IMAGES.Sticher, // Placeholder for Stitcher icon
    color: COLORS.MCAT_LightCrimson,
  },
];

interface PodcastPlatform {
  name: string;
  icon: any; // Type depends on your CustomIcon definition
  logo: any; // Type depends on your logo loading
  color: string;
}

const PodcastModal: FC<{
  isVisible: boolean;
  onClose: () => void;
  platformsLinks: string[];
}> = ({ isVisible, onClose, platformsLinks }) => {
  const filteredPlatforms =
    Platform.OS === 'android'
      ? PODCAST_PLATFORMS.filter(p => p.name !== 'Apple Podcasts')
      : PODCAST_PLATFORMS;

  const filteredLinks =
    Platform.OS === 'android'
      ? platformsLinks.filter(
          (_, i) => PODCAST_PLATFORMS[i].name !== 'Apple Podcasts',
        )
      : platformsLinks;

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
          <ScrollView
            style={{ maxHeight: hp(50) }} // Limit height for scrollability
            showsVerticalScrollIndicator={false}
          >
            {filteredPlatforms.map((platform, index) => (
              <TouchableOpacity
                key={index}
                style={modalStyles.platformButton}
                onPress={() => {
                  Linking.openURL(filteredLinks[index]);
                  onClose();
                }}
              >
                <Image
                  source={platform.icon}
                  style={modalStyles.platformLogo}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={{ height: verticalScale(10) }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default PodcastModal;

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dim background
  },
  modalView: {
    backgroundColor: COLORS.MCAT_White,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(10),
    width: '100%',
    maxHeight: hp(80),
    alignItems: 'center',
  },
  platformButton: {
    width: '100%',
    paddingVertical: verticalScale(10),
    alignItems: 'center',
  },
  listenTextContainer: {
    width: wp(80),
    flexDirection: 'column',
    alignItems: 'center',
  },
  listenOnText: {
    marginBottom: verticalScale(5),
    fontSize: 16,
  },
  platformLogo: {
    width: wp(60),
  },
});
