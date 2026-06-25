export type Root = FavoritesVideos[];

export interface FavoritesVideos {
  id: string;
  section_id: string;
  name: string;
  amount_of_videos: number;
  order: number;
  created_at: string;
  updated_at: string;
  videos: Video[];
}

export interface Video {
  id: string;
  section_id: string;
  subject_id: string;
  topic_id: string;
  name: string;
  keywords: string;
  description: string;
  image: string;
  length: string;
  seconds: number;
  whiteboard_notes: any;
  whiteboard_notes_url: string;
  lecture_notes: any;
  has_lecture_notes: number;
  provider_type: string;
  provider_id: string;
  link: string;
  resolution_link360: string;
  resolution_link540: string;
  resolution_link720: string;
  srt: string;
  srt_url: string;
  order: number;
  created_at: string;
  updated_at: string;
  progress: Progress;
}

export interface Progress {
  percentage: number;
  seconds: number;
}
