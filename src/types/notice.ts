export interface NoticeLink {
  id: string;
  noticeId: string;
  label: string;
  url: string;
  type?: string;
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
  attachments?: NoticeLink[];
  externalLinks?: NoticeLink[];
  createdAt?: string;
  updatedAt?: string;
}
