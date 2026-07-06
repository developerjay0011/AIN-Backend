export interface AdmissionInquiry {
  id: string;
  studentName: string;
  parentName: string;
  email: string;
  phone: string;
  grade: string;
  message?: string;
  status: 'Pending' | 'Contacted' | 'Closed' | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactInquiry {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'New' | 'In Progress' | 'Resolved' | string;
  createdAt?: string;
  updatedAt?: string;
}
