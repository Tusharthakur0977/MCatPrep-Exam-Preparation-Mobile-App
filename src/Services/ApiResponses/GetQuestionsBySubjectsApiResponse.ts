export interface GetQuestionsBySubjectsApiResponse {
  items: Item[];
  limit: number;
  offset: number;
  total: number;
}

export interface Item {
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
  answer: string;
  explanation: string;
  html_explanation: string;
  comments: string;
  order: number;
  created_at: string;
  updated_at: string;
  is_correct: any;
  section: Section;
  favorite: boolean;
}

export interface Section {
  id: string;
  name: string;
  image: string;
  amount_of_videos: number;
  order: number;
  created_at: string;
  updated_at: string;
  percentage: any;
  progress_seconds: any;
  setting: Setting;
}

export interface Setting {
  section_id: string;
  background_icon: string;
  background_color: string;
  created_at: string;
  updated_at: string;
}
