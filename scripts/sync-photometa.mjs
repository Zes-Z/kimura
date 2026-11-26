import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pictureDir = join(root, 'src/content/picture');
const metaFile = join(pictureDir, 'photometa.json');
const imagePattern = /\.(?:svg|png|jpe?g|webp|avif|gif)$/i;

const files = (await readdir(pictureDir, { withFileTypes: true }))
  .filter(entry => entry.isFile() && imagePattern.test(entry.name))
  .map(entry => entry.name)
  .sort((a, b) => a.localeCompare(b, 'en'));

let existing = [];
try {
  existing = JSON.parse(await readFile(metaFile, 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
if (!Array.isArray(existing)) throw new Error(`${metaFile} must contain a JSON array`);

const available = new Set(files);
const photos = existing.filter(photo => {
  if (typeof photo?.src !== 'string') return false;
  const name = photo.src.replace(/^\.\//, '');
  if (!available.has(name)) return false;
  available.delete(name);
  return true;
});

for (const name of files) {
  if (!available.has(name)) continue;
  const number = String(photos.length + 1).padStart(2, '0');
  photos.push({ src: `./${name}`, alt: `影像 ${number}`, caption: `${number} / 影像`, type: 'image' });
}

const next = `${JSON.stringify(photos, null, 2)}\n`;
const previous = await readFile(metaFile, 'utf8').catch(error => {
  if (error.code === 'ENOENT') return '';
  throw error;
});
if (next !== previous) {
  await writeFile(metaFile, next);
  console.log(`Updated photometa.json (${photos.length} images)`);
} else {
  console.log(`photometa.json is current (${photos.length} images)`);
}
