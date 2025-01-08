export interface SurveyWeights {
  [key: string]: number;
}

export interface SurveyRatings {
  [key: string]: number;
}

export interface SurveyResponse {
  session_id: string;
  weights: SurveyWeights;
  ratings: SurveyRatings;
  total_points: number;
}
