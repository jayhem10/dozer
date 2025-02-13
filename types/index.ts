export interface CriteriaItem {
  id: string;
  label: string;
  weight?: number;
  rating?: number;
}

export interface Collaborator {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}
