export interface Department {
  id: string;
  departmentId: string;
  name: string;
  shortName: string;
  overview?: string;
  areas: string[];
  faculty: number;
  clinicalHours: string;
  hod?: string;
  facilities?: string[];
  createdAt?: string;
  updatedAt?: string;
}
