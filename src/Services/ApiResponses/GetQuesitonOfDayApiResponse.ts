export type GetQuesitonOfDayApiResponse = Question[];

export interface Question {
  id: string;
  section_id: string;
  subject_id: string;
  topic_id: string;
  video_id: string;
  number: number;
  stem: string;
  html_stem: string;
  choice_a: string;
  html_choice_a: string;
  choice_b: string;
  html_choice_b: string;
  choice_c: string;
  html_choice_c: string;
  choice_d: string;
  html_choice_d: string;
  answer: 'A' | 'B' | 'C' | 'D' | string; // Assuming the answer is always a single letter
  explanation: string;
  html_explanation: string;
  comments: string;
  order: number;
  created_at: string;
  updated_at: string;
  section: Section; // Embedding the detailed Section object
}

export interface Section {
  id: string;
  name: 'Chem/Phys' | 'Bio/Biochem' | string; // Using known values for type clarity
  image: string;
  amount_of_videos: number;
  order: number;
  created_at: string;
  updated_at: string;
  percentage: number | null;
  progress_seconds: number | null;
  setting: SectionSetting;
}

export interface SectionSetting {
  section_id: string;
  background_icon: string;
  background_color: string;
  created_at: string;
  updated_at: string;
}
