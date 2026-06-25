export interface QuestionsStatsResponse {
  All: All;
  Biochemistry: Biochemistry;
  GeneralChemistry: GeneralChemistry;
  Psychology: Psychology;
}

export interface All {
  correct: number;
  wrong: number;
  attempted: number;
}

export interface Biochemistry {
  correct: number;
  wrong: number;
  attempted: number;
}

export interface GeneralChemistry {
  correct: number;
  wrong: number;
  attempted: number;
}

export interface Psychology {
  correct: number;
  wrong: number;
  attempted: number;
}
