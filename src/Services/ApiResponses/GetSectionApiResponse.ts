export interface GetSectionApiResponse {
  items: Item[];
  limit: any;
  offset: number;
  total: number;
}

export interface Item {
  id: string;
  name: string;
  image: string;
  amount_of_videos: number;
  order: number;
  created_at: string;
  updated_at: string;
  setting: Setting;
  percentage: number;
}

export interface Setting {
  section_id: string;
  background_icon: string;
  background_color: string;
  created_at: string;
  updated_at: string;
}
