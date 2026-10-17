# Dirección visual

La versión actual utiliza fotografías estáticas, tipografía editorial y espacio entre bloques. No carga clips de transición ni controla vídeos mediante scroll. El contenido se limita a nombre, ocupación, trabajos, presentación breve, servicios y contacto, en español e inglés.

| Sección | Recurso original | Uso |
| --- | --- | --- |
| Inicio | sala-3.jpg | Fotografía amplia junto al nombre |
| Trabajos | estante-vacío.jpg | Un único fondo de madera para las tres tarjetas |
| Sobre mí | Retrato original de Montse | Imagen y presentación breve |
| Servicios | ventana-poyete.jpg | Fotografía junto a la lista de servicios |
| Contacto | sunset-apaisado.jpg | Fotografía de fondo con enlaces legibles |

`scripts/prepare-cafe-stills.mjs` prepara los WebP desde los originales sin ampliar las imágenes. Las tarjetas reproducen los vídeos originales con un botón de reproducción y pausa, sin controles nativos ni marcos de dispositivos.

## Material anterior conservado

`CafeBackground.astro`, `cafe-scroll.ts`, `scripts/render-cafe-videos.py` y los clips generados se conservan como trabajo anterior, pero la página no los utiliza. Esos clips son montajes con movimiento y fundidos entre fotografías, no recorridos sintetizados mediante IA.
