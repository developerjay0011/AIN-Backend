export interface AqarReport {
  id: string;
  year: string;
  title: string;
  description?: string;
  status: 'Approved' | 'Submitted' | 'Pending' | string;
  date: string;
  documentUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QualityHighlights {
  academicExcellence: string;
  complianceRate: string;
  researchGrowth: string;
}
