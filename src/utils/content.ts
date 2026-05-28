export type ExperienceEntry = {
  id: string;
  title: string;
  image: string;
  date_from: string;
  date_to: string;
  url: string;
  description: {
    title: { one?: string; two?: string; three?: string; four?: string };
    content: { one?: string; two?: string; three?: string; four?: string };
  };
};

export type PortfolioEntry = {
  id: string;
  title: string;
  image: string;
  url: string;
  description: string;
};

export type BiographyEntry = {
  id: string;
  bio: string;
};

interface MDXModule {
  frontmatter: Record<string, unknown>;
  rawContent: () => string;
}

const experienceModules = import.meta.glob<MDXModule>(
  "/src/data/experience/*.mdx",
  { eager: true }
);

const portfolioModules = import.meta.glob<MDXModule>(
  "/src/data/portfolio/*.mdx",
  { eager: true }
);

const biographyModules = import.meta.glob<MDXModule>(
  "/src/data/biography/*.mdx",
  { eager: true }
);

export const experienceData: ExperienceEntry[] = Object.values(experienceModules)
  .map((mod) => ({
    id: String(mod.frontmatter.id),
    title: String(mod.frontmatter.title),
    image: String(mod.frontmatter.image),
    date_from: String(mod.frontmatter.date_from),
    date_to: String(mod.frontmatter.date_to),
    url: String(mod.frontmatter.url),
    description: (mod.frontmatter.description as ExperienceEntry["description"]) ?? {
      title: {},
      content: {},
    },
  }))
  .sort((a, b) => Number(b.id) - Number(a.id));

export const portfolioData: PortfolioEntry[] = Object.values(portfolioModules).map((mod) => ({
  id: String(mod.frontmatter.id),
  title: String(mod.frontmatter.title),
  image: String(mod.frontmatter.image),
  url: String(mod.frontmatter.url),
  description: mod.rawContent().trim(),
}));

export const biographyData: BiographyEntry[] = Object.values(biographyModules).map((mod) => ({
  id: String(mod.frontmatter.id),
  bio: mod.rawContent().trim(),
}));