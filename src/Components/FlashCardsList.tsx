import React, { useRef, useState } from 'react';
import { Button, StyleSheet, TouchableOpacity, View } from 'react-native';
import ICONS from '../Assets/Icons';
import { COLORS } from '../Utilities/Colors';
import { verticalScale } from '../Utilities/Metrics';
import CustomIcon from './CustomIcon';
import { CustomText } from './CustomText';
import FlashCard from './FlashCard';
import { putData } from '../Services/ApiService';
import ENDPOINTS from '../Services/ApiEndpoints';

const initialFlashcards = [
  {
    id: '1',
    front: {
      title: 'What is the maximum speed of the reaction?',
      text: 'The maximum speed of the reaction',
    },
    back: {
      title: 'Explanation',
      text: 'The maximum speed of a reaction is determined by factors like temperature, catalysts, and concentration, and is often measured as the rate at which reactants are converted into products.',
    },
  },
  {
    id: '2',
    front: {
      title: 'What is the powerhouse of the cell?',
      text: 'The mitochondria',
    },
    back: {
      title: 'Explanation',
      text: 'Mitochondria generate ATP through cellular respiration, providing energy for various cellular processes, which is why they are called the powerhouse of the cell.',
    },
  },
  {
    id: '3',
    front: {
      title: 'Who proposed the theory of relativity?',
      text: 'Albert Einstein',
    },
    back: {
      title: 'Explanation',
      text: 'Einstein proposed the special theory of relativity in 1905 and the general theory in 1915, revolutionizing our understanding of space, time, and gravity.',
    },
  },
  {
    id: '4',
    front: {
      title: 'What is the capital of France?',
      text: 'Paris',
    },
    back: {
      title: 'Explanation',
      text: 'Paris has been the capital of France since 508 AD and is a major center for culture, art, fashion, and history.',
    },
  },
  {
    id: '5',
    front: {
      title: 'Which gas is essential for human respiration?',
      text: 'Oxygen',
    },
    back: {
      title: 'Explanation',
      text: 'Oxygen is required for cellular respiration, where cells convert glucose into energy (ATP). Without oxygen, human cells cannot efficiently produce energy.',
    },
  },
];

type ButtonState = 'negative' | 'neutral' | 'confident';

interface FlashCardsListProps {
  flashcards?: Array<{
    id: string;
    front: {
      title: string;
      text: string;
    };
    back: {
      title: string;
      text: string;
    };
  }>;
  onLoadMore?: () => void; // Callback to load more flashcards
  isLoadingMore?: boolean; // Loading state for pagination
}

const FlashCardsList: React.FC<FlashCardsListProps> = ({
  flashcards,
  onLoadMore,
  isLoadingMore = false,
}) => {
  // Use provided flashcards or fall back to initial hardcoded ones

  // const [cards, setCards] = useState(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsData =
    flashcards && flashcards.length > 0 ? flashcards : initialFlashcards;

  const visibleCards = cardsData.slice(currentIndex, currentIndex + 3);

  const [pressedButton, setPressedButton] = useState<ButtonState | null>(null);

  const topCardRef = useRef<any>(null);

  const totalCards = flashcards?.length ?? initialFlashcards.length;
  const swipedCards = currentIndex;

  // Update cards when flashcards prop changes
  // React.useEffect(() => {
  //   if (flashcards && flashcards.length > 0) {
  //     setCards(flashcards);
  //   }
  // }, [flashcards]);

  const handleUpdateFlashCards = async (id: string, status: string) => {
    try {
      const data = {
        status,
      };
      const response = await putData(
        `${ENDPOINTS.upateFlashCard}/progress/${id}`,
        data,
      );
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  };

  const handleActionPress = (type: 'negative' | 'neutral' | 'positive') => {
    const currentCard = visibleCards?.[0];

    if (!currentCard) return;

    //  send id + status
    handleUpdateFlashCards(currentCard.id, type);

    //  swipe based on action
    if (type === 'negative') {
      topCardRef.current?.swipeLeft();
    } else if (type === 'neutral') {
      topCardRef.current?.swipeDown();
    } else {
      topCardRef.current?.swipeRight();
    }
  };

  const handleSwipe = (direction: 'negative' | 'neutral' | 'positive') => {
    const currentCard = visibleCards?.[0];

    if (currentCard) {
      // 2. Hit the API with the card ID and the direction (which is the status)
      handleUpdateFlashCards(currentCard.id, direction);
    }

    setCurrentIndex(prev => {
      const next = prev + 1;

      // Load more when 3 cards left
      if (
        flashcards &&
        flashcards.length - next === 3 &&
        onLoadMore &&
        !isLoadingMore
      ) {
        onLoadMore();
      }

      return next;
    });
  };

  const getIcon = (button: ButtonState) => {
    // If the button is currently pressed, use a darker/highlight color
    if (pressedButton === button) {
      switch (button) {
        case 'negative':
          return ICONS.NegativeIconActive; // Define a darker red in your COLORS utility
        case 'neutral':
          return ICONS.NeutralIconActive; // Define a darker yellow
        case 'confident':
          return ICONS.ConfidentIconGreen; // Define a darker green
      }
    }

    // Default color when not pressed
    switch (button) {
      case 'negative':
        return ICONS.NegativeIcon; // Original Red
      case 'neutral':
        return ICONS.NeutralIcon; // Original Yellow
      case 'confident':
        return ICONS.ConfidentIcon; // Original Green
    }
  };

  // Check if there are no flashcards
  if (visibleCards?.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <CustomIcon
          Icon={ICONS.MathQuestion}
          height={120}
          width={120}
          style={{ opacity: 0.3 }}
        />
        <CustomText
          color={COLORS.MCAT_White}
          fontSize={18}
          fontFamily="ROBOTO_bold"
          textAlign="center"
          style={{ marginTop: verticalScale(20) }}
        >
          No Flashcards Available
        </CustomText>
        <CustomText
          color={COLORS.MCAT_White}
          fontSize={14}
          fontFamily="ROBOTO_regular"
          textAlign="center"
          style={{ marginTop: verticalScale(10), opacity: 0.7 }}
        >
          There are no flashcards for this subject yet.
        </CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ Progress Bar at top */}
      <View style={styles.progressContainer}>
        <CustomText
          color={COLORS.MCAT_White}
          fontSize={12}
          fontFamily="ROBOTO_medium"
          textAlign="center"
        >
          {swipedCards}/{totalCards}
        </CustomText>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${(swipedCards / totalCards) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Cards */}
      {visibleCards?.map((card, index) => (
        <FlashCard
          ref={index === 0 ? topCardRef : null}
          key={card.id}
          item={card}
          onSwipe={handleSwipe}
          index={index}
          totalCards={visibleCards.length}
        />
      ))}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          onPress={() => handleActionPress('negative')}
          onPressIn={() => setPressedButton('negative')}
          onPressOut={() => setPressedButton(null)}
          activeOpacity={1}
        >
          <CustomIcon Icon={getIcon('negative')} height={35} width={35} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleActionPress('neutral')}
          onPressIn={() => setPressedButton('neutral')}
          onPressOut={() => setPressedButton(null)}
          activeOpacity={1}
        >
          <CustomIcon Icon={getIcon('neutral')} height={35} width={35} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleActionPress('confident')}
          onPressIn={() => setPressedButton('confident')}
          onPressOut={() => setPressedButton(null)}
          activeOpacity={1}
        >
          <CustomIcon Icon={getIcon('confident')} height={35} width={35} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FlashCardsList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  progressContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    gap: verticalScale(5),
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff50',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.MCAT_White,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '80%',
  },
});
