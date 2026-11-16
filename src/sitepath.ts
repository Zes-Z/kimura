/** Prefix local URLs with Astro's configured base path for GitHub Pages. */
export function sitePath(path: string): string {
  if (!path.startsWith('/')) return path;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
}
