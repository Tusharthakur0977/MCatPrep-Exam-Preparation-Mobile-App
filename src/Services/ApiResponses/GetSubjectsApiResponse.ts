export interface GetSubjectsApiResponse {
  items: Item[];
  limit: any;
  offset: number;
  total: number;
}

export interface Item {
  id: string;
  section_id: string;
  name: string;
  amount_of_videos: number;
  order: number;
  created_at: string;
  updated_at: string;
  percentage: number;
}
