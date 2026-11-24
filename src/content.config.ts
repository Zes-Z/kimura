import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const shared = z.object({ title: z.string(), date: z.coerce.date(), description: z.string(), label: z.string().optional() });
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/post' }),
  schema: ({ image }) => shared.extend({
    cover: image(),
    frame: z.enum(['stamp','camera','polaroid','ticket','folio']).default('folio'),
  }),
});
export const collections = { posts };
