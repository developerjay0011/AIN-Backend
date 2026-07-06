export interface LeadershipMessage {
  quote: string;
  body: string;
  image?: string;
  name?: string;
  role: 'Director' | 'Principal' | 'Registrar' | string;
}

export interface Milestone {
  year: string;
  title: string;
  desc: string;
}

export interface AboutContent {
  ABOUT_MILESTONES: Milestone[];
  DIRECTOR_MESSAGE: LeadershipMessage;
  PRINCIPAL_MESSAGE: LeadershipMessage;
  REGISTRAR_MESSAGE: LeadershipMessage;
}
