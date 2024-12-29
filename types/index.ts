export interface SurveyResponse {
  id: string;
  session_id: string;
  weights: Record<string, number>;
  ratings: Record<string, number>;
  total_points: number;
  created_at: string;
}

export interface CriteriaItem {
  id: string;
  label: string;
  weight?: number;
  rating?: number;
}