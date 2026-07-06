export interface Staff {
  id: string;
  name: string;
  role: string;
  type: 'Teaching' | 'Non-Teaching' | string;
  image?: string;
  qualification?: string;
  experience?: string;
  specialization?: string;
  department?: string;
  createdAt?: string;
  updatedAt?: string;
}
