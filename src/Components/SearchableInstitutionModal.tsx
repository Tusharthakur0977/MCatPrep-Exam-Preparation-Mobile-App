import React, { FC, useState, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  // TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { CustomText } from './CustomText';
import { COLORS } from '../Utilities/Colors';
import { horizontalScale, hp, verticalScale, wp } from '../Utilities/Metrics';
import ENDPOINTS from '../Services/ApiEndpoints';
import { Institution } from '../Services/ApiResponses/GetInstitutionsApiResponse';
import { fetchUserApiData } from '../Services/UserApiService';

interface SearchableInstitutionModalProps {
  isVisible: boolean;
  onSelect: (institutionName: string) => void;
  onClose: () => void;
}

const SearchableInstitutionModal: FC<SearchableInstitutionModalProps> = ({
  isVisible,
  onSelect,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Load all institutions when modal opens
  useEffect(() => {
    if (isVisible && !hasSearched && institutions.length === 0) {
      getAllInstitutions();
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const timeout = setTimeout(() => {
      searchInstitutions(searchTerm.trim());
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchTerm, isVisible]);

  // // Debounce search
  // useEffect(() => {
  //   if (searchTerm.trim().length === 0) {
  //     // Load all institutions when search is empty
  //     const timeoutId = setTimeout(() => {
  //       searchInstitutions('');
  //     }, 300);
  //     return () => clearTimeout(timeoutId);
  //   }

  //   const timeoutId = setTimeout(() => {
  //     searchInstitutions(searchTerm.trim());
  //   }, 500); // 500ms debounce

  //   return () => clearTimeout(timeoutId);
  // }, [searchTerm]);

  // const searchInstitutions = async (term: string = "med") => {
  //   try {
  //     setIsLoading(true);
  //     setHasSearched(true);

  //     // If term is empty, fetch all institutions (no term parameter)
  //     const params = { term: "med", limit: 100 };

  //     const response = await fetchData<GetInstitutionsApiResponse>(
  //       ENDPOINTS.searchInstitutions,
  //       params,
  //     );

  //     if (response.data?.items) {
  //       setInstitutions(response.data.items);
  //     } else {
  //       setInstitutions([]);
  //     }
  //   } catch (error) {
  //     console.error('Error searching institutions:', error);
  //     setInstitutions([]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const searchInstitutions = async (term: string = '') => {
    try {
      setIsLoading(true);
      setHasSearched(true);

      const response = await fetchUserApiData<any>(
        `${ENDPOINTS.getInstituions}?term=${term || 'med'}`,
      );

      if (response.data) {
        setInstitutions(response.data);
      } else {
        setInstitutions([]);
      }
    } catch (error) {
      console.error('Error searching institutions:', error);
      setInstitutions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAllInstitutions = async () => {
    try {
      setIsLoading(true);
      setHasSearched(true);

      // Fetch all institutions without search term
      const response = await fetchUserApiData<any>(
        `${ENDPOINTS.getInstituions}?term=med`,
      );

      if (response.data) {
        setInstitutions(response.data);
      } else {
        setInstitutions([]);
      }
    } catch (error) {
      console.error('Error fetching institutions:', error);
      setInstitutions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (institution: Institution) => {
    onSelect(institution.name);
    // setSearchTerm('');
    setInstitutions([]);
    setHasSearched(false);
    onClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    setInstitutions([]);
    setHasSearched(false);
    onClose();
  };

  const renderInstitutionItem = ({ item }: { item: Institution }) => (
    <TouchableOpacity
      style={styles.institutionItem}
      onPress={() => handleSelect(item)}
    >
      <CustomText fontFamily="INTER_medium" fontSize={16}>
        {item.name}
      </CustomText>
      <CustomText
        fontFamily="INTER_regular"
        fontSize={12}
        color={COLORS.grey}
        style={{ marginTop: verticalScale(2) }}
      >
        {[item.city, item.state, item.country].filter(Boolean).join(', ')}
      </CustomText>
    </TouchableOpacity>
  );

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <CustomText
            fontFamily="INTER_bold"
            fontSize={18}
            style={styles.modalTitle}
          >
            Select Institution
          </CustomText>

          {/* Search Input - Commented out for now */}
          <TextInput
            style={styles.searchInput}
            placeholder="Search institutions..."
            placeholderTextColor={COLORS.grey}
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoFocus
            autoCapitalize="words"
          />

          {/* Results */}
          <View style={styles.resultsContainer}>
            {isLoading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.MCAT_Dark_Blue} />
                <CustomText
                  fontFamily="INTER_regular"
                  fontSize={14}
                  color={COLORS.grey}
                  style={{ marginTop: verticalScale(10) }}
                >
                  Searching...
                </CustomText>
              </View>
            ) : hasSearched && institutions.length === 0 ? (
              <View style={styles.centerContainer}>
                <CustomText
                  fontFamily="INTER_regular"
                  fontSize={14}
                  color={COLORS.grey}
                  textAlign="center"
                >
                  No institutions found.{'\n'}Try a different search term.
                </CustomText>
              </View>
            ) : institutions.length > 0 ? (
              <FlatList
                data={institutions}
                keyExtractor={item => item.id}
                renderItem={renderInstitutionItem}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                showsVerticalScrollIndicator={true}
              />
            ) : !hasSearched ? (
              <View style={styles.centerContainer}>
                <CustomText
                  fontFamily="INTER_regular"
                  fontSize={14}
                  color={COLORS.grey}
                  textAlign="center"
                >
                  Loading institutions...
                </CustomText>
              </View>
            ) : null}
          </View>

          {/* Close Button */}
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <CustomText
              fontFamily="INTER_bold"
              fontSize={16}
              color={COLORS.MCAT_Dark_Blue}
            >
              Close
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: wp(90),
    height: hp(50),
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: horizontalScale(20),
  },
  modalTitle: {
    marginBottom: verticalScale(20),
    textAlign: 'center',
    color: COLORS.MCAT_Dark_Blue,
  },
  searchInput: {
    backgroundColor: '#ECF3F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECF3F9',
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(15),
    fontSize: 16,
    color: COLORS.black,
    marginBottom: verticalScale(15),
  },
  resultsContainer: {
    flex: 1,
    minHeight: 200,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  institutionItem: {
    paddingVertical: verticalScale(12),
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.lightGrey,
  },
  closeButton: {
    marginTop: verticalScale(15),
    paddingVertical: verticalScale(12),
    alignItems: 'center',
    backgroundColor: '#ECF3F9',
    borderRadius: 8,
  },
});

export default SearchableInstitutionModal;
