import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const shared = z.object({ title: z.string(), date: z.coerce.date(), description: z.string(), cover: z.string(), label: z.string().optional() });
const projects = defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/internship·project' }), schema: shared.extend({ year: z.string(), kind: z.string().default('Project'), color: z.string().default('#d8d2c8') }) });
const posts = defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/post' }), schema: shared.extend({ frame: z.enum(['stamp','camera','polaroid','ticket','folio']).default('folio') }) });
export const collections = { projects, posts };
