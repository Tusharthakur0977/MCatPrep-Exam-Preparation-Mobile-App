import IMAGES from '../Assets/Images';

export type SlideType = {
  id: string;
  image: any;
  text1: string;
  text2: string;
  text3: string;
  quote?: {
    title: string;
    subTitle: string;
  };
};

const OnBoardingSlides: SlideType[] = [
  {
    id: '1',
    image: IMAGES.feature1,
    text1: 'Get Access To',
    text2: ' 100+ ',
    text3: 'Extensive Lessons From Top Medical Experts',
    quote: {
      title: 'Jordon Klar',
      subTitle:
        "This is the most helpful app I've found to study for the MCAT. I especially love the ability to study on the go. I feel much more confident in my ability to do well after all these short reviews and practice questions.",
    },
  },
  {
    id: '2',
    image: IMAGES.feature2,
    text1: 'Practice With',
    text2: ' 2000+ ',
    text3: 'Flashcards And A Comprehensive Question Bank',
    quote: {
      title: 'Cameron W.',
      subTitle:
        'This app does a great job combining all the various learning tools I need in one place, from flashcards, to questions, to videos. So many videos!',
    },
  },
  {
    id: '3',
    image: IMAGES.feature3,
    text1: 'Pace Your Own Schedule',
    text2: '',
    text3: ' - \nAdjust Anytime',
    quote: {
      title: 'Jordon Klar',
      subTitle:
        "This is the most helpful app I've found to study for the MCAT. I especially love the ability to study on the go. I feel much more confident in my ability to do well after all these short reviews and practice questions.",
    },
  },
];

export default OnBoardingSlides;
