export interface NoticeLink {
  id: string;
  noticeId: string;
  label: string;
  url: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notice {
  id: string;
  title: string;
  date: string;
  type: string;
  description?: string;
  critical: boolean;
  links?: NoticeLink[];
  createdAt?: string;
  updatedAt?: string;
}
