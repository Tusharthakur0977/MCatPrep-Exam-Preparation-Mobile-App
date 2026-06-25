export interface StatsProfileResponse {
  global: Global;
  badges: Badges;
}

export interface Global {
  course_progress: number;
  lessons_watched: number;
  questions_answered: number;
  questions_answered_correct: number;
  questions_answered_incorrect: number;
  total_flashcards_mastered: number;
  total_lessons: number;
  total_questions: number;
  total_flashcards: number;
}

export interface Badges {
  videos: any[];
  questions: string[];
  flashcards: any[];
}
