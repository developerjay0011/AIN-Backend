export interface Department {
  id: string;
  departmentId: string;
  name: string;
  shortName: string;
  overview?: string;
  areas: string[];
  faculty: number;
  clinicalHours: string;
  createdAt?: string;
  updatedAt?: string;
}
