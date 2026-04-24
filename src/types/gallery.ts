export interface GalleryMedia {
  id: string;
  eventId: string;
  type: 'photo' | 'video';
  url: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryEvent {
  id: string;
  name: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  mainTag?: string;
  highlights?: string[];
  media?: GalleryMedia[];
  createdAt?: string;
  updatedAt?: string;
}
