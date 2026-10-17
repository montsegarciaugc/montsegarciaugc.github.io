# Composición de portada

Herramienta: `image_gen`, integrada, modo edición. Imagen de destino: `public/media/studio-montse.webp`. Se mantiene el fondo original y el retrato sin sobrescribir. La conversión a WebP utiliza calidad 94.

Referencias, en orden:

1. `public/media/studio-world.png`: escenario arquitectónico de la rama actual.
2. `public/media/montse-portrait.webp`: fotografía de Montse con la taza.

Prompt utilizado:

```text
Use case: identity-preserve / compositing. Edit target image 1 is the existing warm terracotta architectural website hero, keep its architecture, arches, curtain, vase and perfume plinth and wide 16:9 composition unchanged. Supporting insert image 2 is the real Montse holding her black coffee mug. Integrate this exact woman into the right-hand side of image 1, naturally standing in front of/between the arches around 71% of canvas width, from head around 26% height down to the bottom edge (waist/thigh crop as in reference). Preserve her EXACT recognizable facial features, natural body shape, short dark auburn hair, lilac T-shirt, blue jeans, tattoos, red bracelet, hands and black mug. Do not beautify, slim, age or replace her face. Remove only the original cafe window/plants background from her source. Match the gentle warm sunlight from the left and natural soft shadows so she belongs to the room. Preserve photorealistic skin, no plastic AI look. The left 53% of this wide image must stay empty cream wall for HTML text overlay. Do not add text, logos, extra people, furniture, limbs or objects. The woman should be the main right-side foreground subject at believable human scale, not a tiny figure in the distant doorway. Subtle professional exposure and color correction only. Output the finished wide photo composite.
```
