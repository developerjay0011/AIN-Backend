export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  link?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
