export type SkillEntry = {
  id: string;
  title: string;
  image: string;
  url: string;
  featured?: boolean;
};

export type ExperienceEntry = {
  id: string;
  title: string;
  image: string;
  date_from: string;
  date_to: string;
  url: string;
  description: string;
};

export type PortfolioEntry = {
  id: string;
  title: string;
  image: string;
  url: string;
  description: string;
};

export type AboutEntry = {
  email: string;
  location: string;
  languages: { language: string; level: string }[];
  education?: { institution: string; degree: string; year?: string }[];
  bio: string;
};
