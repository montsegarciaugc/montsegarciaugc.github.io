import sharp from 'sharp';
import { mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const source = 'cafeteria-imgs';
const output = 'public/media/cafe';
await mkdir(output, { recursive: true });
const photos = [
  ['sala-3.jpg', 'room-wide.webp'],
  ['sala-completa.jpg', 'room-detail.webp'],
  ['estanteria-top-sala.jpg', 'shelf-wall.webp'],
  ['ventana-poyete.jpg', 'window.webp'],
  ['sunset-apaisado.jpg', 'sunset.webp'],
];
for (const [input, name] of photos) {
  await sharp(join(source, input)).rotate().resize({ width: 2200, withoutEnlargement: true })
    .webp({ quality: 93, effort: 5 }).toFile(join(output, name));
}
const empty = (await readdir(source)).find(name => name.startsWith('estante-') && !name.includes('-2'));
// Use only the empty compartment, without repeating the books above and below it.
const metadata = await sharp(join(source, empty)).metadata();
await sharp(join(source, empty)).extract({ left: Math.round(metadata.width * .08),
  top: Math.round(metadata.height * .46), width: Math.round(metadata.width * .84),
  height: Math.round(metadata.height * .26) }).webp({ quality: 94 }).toFile(join(output, 'shelf-texture.webp'));
console.log('Prepared original-resolution cafe stills without enlarging source photos.');
