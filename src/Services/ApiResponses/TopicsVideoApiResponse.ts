export interface TopicVideoResponse {
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
  section: Section;
  subject: Subject;
  topic: Topic;
  favorite: boolean;
  prev: Prev;
  next: Next;
  commercial: any;
  question_count: number;
  flashcard_count: number;
}

export interface Progress {
  percentage: number;
  seconds: number;
}

export interface Section {
  id: string;
  name: string;
  image: string;
  amount_of_videos: number;
  order: number;
  created_at: string;
  updated_at: string;
  setting: Setting;
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
}

export interface Topic {
  id: string;
  subject_id: string;
  name: string;
  amount_of_videos: number;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Prev {
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
  progress: Progress2;
}

export interface Progress2 {
  percentage: number;
  seconds: number;
}

export interface Next {
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
  progress: Progress3;
}

export interface Progress3 {
  percentage: number;
  seconds: number;
}
