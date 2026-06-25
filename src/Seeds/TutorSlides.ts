import { ImageSourcePropType } from 'react-native';
import IMAGES from '../Assets/Images';

export type SlideType = {
  id: string;
  image: ImageSourcePropType;
  title: string;
  subTitle: string;
};

const TutorSlides: SlideType[] = [
  {
    id: '1',
    image: IMAGES.ScoreImprovement,
    title: '12 POINT SCORE IMPROVEMENT',
    subTitle:
      'On average, the student part of our tutoring program score 12 points higher than their previous exam scores. ',
  },
  {
    id: '2',
    image: IMAGES.CompletlyPersonalized,
    title: 'COMPLETELY PERSONALIZED',
    subTitle:
      'Our MCAT tutoring is completly personalized to you. From day one, we’ll work on indentifying your goals, your strengths and your weaknesses so that we can tailor the most effective program possible. ',
  },
  {
    id: '3',
    image: IMAGES.PercentileTutors,
    title: '99TH PERCENTILE TUTORS',
    subTitle:
      'Other companies settle for tutors who scored in the 85th percentile or better , we do not. Our tutors have all scored between 130-132 on each section of the exam they tutor.',
  },
];

export default TutorSlides;
