export interface SectionDetailsResponse {
  id: string;
  name: string;
  image: string;
  amount_of_videos: number;
  order: number;
  created_at: string;
  updated_at: string;
  subjects: Subject[];
  setting: Setting;
  topics: Topic[];
  percentage: number;
}

export interface Subject {
  id: string;
  section_id: string;
  name: string;
  amount_of_videos: number;
  order: number;
  created_at: string;
  updated_at: string;
  percentage: number;
}

export interface Setting {
  section_id: string;
  background_icon: string;
  background_color: string;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  name: string;
  amount_of_videos: number;
  order: number;
  created_at: string;
  updated_at: string;
  percentage: number;
}
