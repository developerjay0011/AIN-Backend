export interface AQAR {
  id: string;
  year: string;
  title: string;
  description?: string;
  status: 'Approved' | 'Submitted' | 'Pending';
  date: string;
  documentUrl?: string;
  size?: string;
  createdAt: string;
  updatedAt: string;
}
