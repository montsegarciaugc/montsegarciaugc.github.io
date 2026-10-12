# Portfolio de Montse García

Portfolio UGC en Astro con la dirección creativa «El estudio de Montse»: un recorrido visual de seis bloques, escenario original generado con IA y tres vídeos reales. El contenido parte de `external-assets/MONTSERRAT.pdf`, con la estructura simplificada y rediseñada.

## Idiomas

- `/montsegarciaugc.github.io/`: español.
- `/montsegarciaugc.github.io/en/`: inglés.

El selector ES/EN conserva el ancla de la sección actual. Los textos, metadatos, navegación y etiquetas de accesibilidad se generan en cada idioma desde `src/components/Portfolio.astro`. Las imágenes y los vídeos conservan su contenido original.

## Desarrollo

```sh
npm run dev -- --background
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
```

En PowerShell, usa `npm.cmd` si la política de ejecución impide usar `npm.ps1`. El comando de inicio muestra la URL y el puerto disponibles.

```sh
npm run build
npm run preview
```

La compilación estática se genera en `dist/`.

## GitHub Pages

Repositorio público: https://github.com/msmc98/montsegarciaugc.github.io

Dirección de publicación: https://msmc98.github.io/montsegarciaugc.github.io/

El workflow `.github/workflows/deploy.yml` compila y despliega cada push a `main`. También se puede ejecutar desde Actions con `workflow_dispatch`. En Settings → Pages, la fuente de publicación debe ser **GitHub Actions**.

La configuración de Astro utiliza `GITHUB_REPOSITORY`, proporcionado por GitHub Actions, para calcular el propietario, el dominio y el prefijo de las rutas. Ahora, bajo `msmc98`, publica como sitio de proyecto con el prefijo `/montsegarciaugc.github.io/`. Después de transferir el repositorio a la cuenta `montsegarciaugc`, publica en `https://montsegarciaugc.github.io/`, con español en `/` e inglés en `/en/`, sin cambiar el código. Todas las rutas de recursos e idiomas se adaptan automáticamente.

Después de la transferencia, comprobar que Pages utiliza GitHub Actions y hacer un push a `main` o ejecutar el workflow manualmente para publicar bajo el nuevo propietario. Las compilaciones locales usan como respaldo la ubicación actual en `msmc98`.

Actualizar el remoto local después de la transferencia:

```sh
git remote set-url origin https://github.com/montsegarciaugc/montsegarciaugc.github.io.git
```

Para subir el primer commit una vez revisados los archivos:

```sh
git add .
git commit -m "Create bilingual Montse Garcia UGC portfolio"
git push -u origin main
```

## Recursos y edición

- `src/components/Portfolio.astro`: los seis bloques y los textos bilingües.
- `src/scripts/journey.ts`: recorrido de tres escenas al avanzar, navegación por escenas y alternativa de movimiento reducido.
- `src/styles/global.css`: paleta, tipografías y estilos adaptados a móvil.
- `src/components/VideoCard.astro`: reproductor en tarjeta, con play y pausa al pulsar de nuevo; sin controles nativos ni mockups.
- `public/media/`: recursos WebP extraídos del PDF y los tres MP4 suministrados.
- `scripts/extract-assets.py`: extracción reproducible con PyMuPDF y Pillow instalados en `.tools/python`.

Se han incluido los vídeos de perfume Joy, moda y probando comida. Cada tarjeta reproduce al pulsar el play y pausa al volver a pulsar sobre el vídeo. También funciona con Enter y Espacio. Al iniciar otro vídeo, el anterior se pausa. Los demás ejemplos disponibles son imágenes estáticas. Las fotografías se pueden ampliar con ratón o teclado y cerrar con Escape.

Las fuentes Cormorant Garamond y DM Sans se cargan desde Google Fonts, con fuentes de sistema de respaldo. El escenario de entrada es un estudio imaginario creado con IA. El movimiento del recorrido se genera en la web; no es un vídeo de IA. La dirección para incorporar un clip generado está en `docs/creative-direction.md` y requiere conectar Runway.

Contacto: montsegarciaugc@gmail.com. Instagram y TikTok: @montsegarcia_ugc.

## Validación

Verificado en Edge a 1440 y 390 px en ambos idiomas: seis bloques, tres escenas accesibles, imágenes cargadas, sin desbordamiento horizontal y tres vídeos disponibles. El recorrido mantiene el desplazamiento convencional y muestra todas las escenas sin animación cuando se prefiere movimiento reducido. Las tarjetas no tienen controles nativos ni marcos de móvil; play y pausa comprobados. La configuración de despliegue continúa adaptándose automáticamente al propietario del repositorio.
