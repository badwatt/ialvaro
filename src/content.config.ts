import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const experience = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/experience" }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    image: z.string(),
    date_from: z.string(),
    date_to: z.string(),
    url: z.string(),
  }),
});

const portfolio = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/portfolio" }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    image: z.string(),
    url: z.string(),
  }),
});

const about = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/about" }),
  schema: z.object({
    id: z.string(),
  }),
});

export const collections = { experience, portfolio, about };
