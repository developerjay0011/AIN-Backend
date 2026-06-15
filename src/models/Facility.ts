export interface Facility {
  id: string;
  category: 'campus' | 'hostel' | 'sna' | 'support';
  title: string;
  description: string;
  image?: string;
  features?: string; // Stored as JSON string
  extraDetails?: string; // Stored as JSON string
  createdAt?: string;
  updatedAt?: string;
}
