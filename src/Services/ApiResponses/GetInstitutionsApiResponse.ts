export interface Institution {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
}

export interface GetInstitutionsApiResponse {
  items: Institution[];
  count: number;
}

