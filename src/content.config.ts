import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob, file } from "astro/loaders";

const experience = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/experience" }),
  schema: ({ image }) =>
    z.object({
      id: z.string(),
      title: z.string(),
      image: image(),
      date_from: z.string(),
      date_to: z.string(),
      url: z.string(),
    }),
});

const portfolio = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/portfolio" }),
  schema: ({ image }) =>
    z.object({
      id: z.string(),
      title: z.string(),
      image: image(),
      url: z.string(),
    }),
});

const about = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/about" }),
  schema: z.object({
    email: z.string(),
    location: z.string(),
    languages: z.array(
      z.object({
        language: z.string(),
        level: z.string(),
      }),
    ),
    education: z
      .array(
        z.object({
          institution: z.string(),
          degree: z.string(),
          year: z.string().optional(),
        }),
      )
      .optional(),
  }),
});

const skills = defineCollection({
  loader: file("src/content/skills/skills.json"),
  schema: ({ image }) =>
    z.object({
      id: z.string(),
      title: z.string(),
      image: image(),
      url: z.string(),
      featured: z.boolean().optional(),
    }),
});

export const collections = { experience, portfolio, about, skills };
