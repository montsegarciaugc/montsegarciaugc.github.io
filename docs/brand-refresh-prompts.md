# Nueva identidad visual y retratos

Herramienta: `image_gen` integrada, modo edición. Los originales se conservan. Los retratos se convierten a WebP con calidad 94; el logo, con calidad 96 y alfa 100.

## Archivos finales

- `public/media/studio-montse-v2.webp`: hero sin pulsera.
- `public/media/montse-cafe-v2.webp`: retrato de cafetería retocado, sin pulsera.
- `public/media/montse-studio-v2.webp`: variante con la taza entre los arcos, sin pulsera.
- `public/media/logo-brand.webp`: logo monocromo burdeos, con transparencia real.

Las imágenes se asignan desde `src/data/portraits.ts`, para poder intercambiarlas sin cambiar la composición. Los retratos se han editado o compuesto mediante IA a partir de la fotografía original de Montse.

Paleta final: pared `#fae6cf`, oscuro `#57110d`, mármol de apoyo `#d7a58a` y resplandor `#f4cba7`. Los tonos de mármol son una interpretación del suelo del hero. El color oscuro de la web se actualizó después de generar los retratos; las referencias fotográficas mantienen su iluminación natural.

Texturas en rombos: opacidad 0,25 en positivo y 0,28 en negativo. Módulo de repetición de 216 × 108 px en escritorio y 180 × 90 px en móvil; motivos ampliados dentro del módulo para conservar su tamaño visible al reducir la separación.

## Prompts finales usados

### hero-brand

Referencias: `public/media/studio-montse.webp`.

```text
Use case: precise-object-edit. Edit this exact website hero photograph. Remove ONLY the red bracelet on the woman's wrist, replacing it with natural skin consistent with the same forearm. Keep absolutely everything else unchanged: her exact face, body shape, skin texture, hair, lilac T-shirt, jeans, tattoos, fingers, black coffee mug and posture; cream wall, arches, burgundy curtain, perfume pedestal, glossy sunlit marble floor, framing and lighting. Preserve wide 16:9 composition and the empty left half for website text. Do not slim, beautify or redesign the person or room. No bracelets or jewellery added. No text. Output the edited full image.
```

### portrait-natural

Referencias: `public/media/montse-portrait.webp`.

```text
Use case: identity-preserve / precise-object-edit. Edit this real portrait of Montse holding a black coffee mug. Remove the red bracelet from her wrist and reconstruct only the skin beneath it. Preserve the same woman's exact recognizable facial features, age, natural body shape, hair, lilac shirt, jeans, tattoos, hands, black mug, pose and gaze. Keep the cafe window, curtains and plants but gently balance exposure, detail and warm daylight for a clean high quality editorial portrait. Keep natural skin texture; no beauty filter, no slimming, no body reshaping, no new jewellery. Vertical 3:4 portrait, waist and upper thighs visible like original, no text. This is a photographic retouch of the same person, not a replacement person.
```

### portrait-studio

Referencias: `public/media/montse-portrait.webp`, `public/media/studio-montse.webp`.

```text
Use case: identity-preserve / compositing. Image 1 is the real identity reference: Montse holding her black coffee mug. Image 2 supplies only the warm architectural studio setting. Create a second natural editorial portrait of this EXACT woman in the studio, vertical 3:4 from head to upper thighs. Keep her recognizable face, natural body proportions, short dark auburn hair, lilac T-shirt, blue jeans, original tattoos, and her black mug held in both hands. Remove the red wrist bracelet; no bracelets or jewellery. Let her face remain in a gentle three-quarter view with eyes looking slightly past camera and a very subtle relaxed expression; keep hands anatomically natural. Use cream plaster wall (#fae6cf), part of an arch and deep terracotta fabric (#833026) softly out of focus, with a small warm polished marble glow near lower background, warm sunlight from left. No new props, no extra people, no text, no logos, no plastic skin, no slimming or changed face. Aim for a closely related alternate photo rather than a different photoshoot identity.
```

### logo-brand-final

Referencias: `public/media/logo.webp`.

```text
Edit this existing Montse García logo by recoloring only. Preserve the exact original lettering, spelling MONTSE, García, UGC CREATOR, proportions, placement and sweeping underline. Make every letter and stroke a single flat solid dark burgundy #57110d. Remove the pink, white outlines, all stray pixels and shadows; use smooth clean anti-aliased edges. Genuine transparent alpha outside all letters and strokes, including letter counters, no white or black background. No gradient, metallic effect, bevel, shadow or redesign. Output a crisp high resolution horizontal transparent logo.
```

