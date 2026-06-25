export interface SubscriptionResponse {
  id: number;
  plan_id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  created_at: string;
  updated_at: string;
  platform: string;
  final_price: any;
  additional_info: any;
  active: number;
  user_id: string;
  transaction_id: string;
  status: string;
  trial_ends_at: any;
  ends_at: string;
  canceled_at: any;
  receipt_token: string;
  is_whitelisted: number;
}
