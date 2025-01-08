export interface CriteriaItem {
  id: string;
  label: string;
  weight?: number;
  rating?: number;
}

export interface Collaborator {
  first_name: string;
  last_name: string;
  email: string;
}
