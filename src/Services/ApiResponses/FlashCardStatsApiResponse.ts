export interface flashCardStatsResponse {
  All: All;
}

export interface All {
  positive: number;
  negative: number;
  neutral: number;
  attempted: number;
}
