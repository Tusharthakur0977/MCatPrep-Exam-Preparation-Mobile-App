export interface ProfileDataResponse {
  id: string;
  email: string;
  phone: string;
  email_verified: boolean;
  name: any;
  first_name: string;
  last_name: string;
  picture: string;
  additional: Additional;
  stripe_id: any;
  trial_ends_at: any;
  roles: string[];
  created_at: string;
  updated_at: string;
}

export interface Additional {
  institution: string;
  undergraduate: number;
  country_calling_code: string;
  country_code: string;
  phone: string;
}
