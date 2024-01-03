import { z, defineCollection } from "astro:content";

export const collections = {
  newsletter: defineCollection({
    schema: z.object({
      number: z.number(),
      date: z.date(),
    }),
  }),
};
