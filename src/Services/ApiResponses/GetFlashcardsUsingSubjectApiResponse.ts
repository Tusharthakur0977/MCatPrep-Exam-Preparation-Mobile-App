export interface Root {
  items: Item[];
  limit: number;
  offset: number;
  count: number;
}

export interface Item {
  current_interval: number;
  id: string;
  section_id: string;
  subject_id: string;
  topic_id: string;
  video_id: string;
  front: string;
  html_front: string;
  definition: string;
  html_definition: string;
  example: string;
  html_example: string;
  front_image: any;
  definition_image: any;
  example_image: any;
  order: number;
  created_at: string;
  updated_at: string;
  status: string;
}
