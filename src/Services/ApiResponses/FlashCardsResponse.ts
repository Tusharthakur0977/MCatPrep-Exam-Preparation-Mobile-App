export type FlashCardsResponse = flashCardData[];

export interface flashCardData {
  id: string;
  name: string;
  image: string;
  amount_of_videos: number;
  order: number;
  created_at: string;
  updated_at: string;
  percentage: number;
  amount_of_flashcards: number;
  setting: Setting;
  subjects: Subject[];
}

export interface Setting {
  section_id: string;
  background_icon: string;
  background_color: string;
  created_at: string;
  updated_at: string;
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
  amount_of_flashcards: number;
}
