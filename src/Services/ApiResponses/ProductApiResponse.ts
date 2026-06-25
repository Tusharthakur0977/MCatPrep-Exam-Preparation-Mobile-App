export interface ProductApiResponse {
  current_page: number;
  data: PriceData[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Link[];
  next_page_url: any;
  path: string;
  per_page: string;
  prev_page_url: any;
  to: number;
  total: number;
}

export interface PriceData {
  id: number;
  plan_id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  created_at: any;
  updated_at: any;
  platform: string;
  final_price: any;
  additional_info: any;
  active: number;
}

export interface Link {
  url?: string;
  label: string;
  active: boolean;
}
