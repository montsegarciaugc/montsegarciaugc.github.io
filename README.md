# Montse García · Portfolio UGC

Portfolio Astro en español e inglés. Cinco secciones: inicio, trabajos, sobre mí, servicios y contacto. Fotografías de `cafeteria-imgs/`, vídeos originales y texto breve.

## Desarrollo

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 4321 --background
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
npm run build
```

En PowerShell, usar `npm.cmd` si la política bloquea `npm.ps1`. Vista previa: `http://127.0.0.1:4321/montsegarciaugc.github.io/`.

## Imágenes y vídeos

La composición utiliza fotografías estáticas en WebP y no carga vídeos de transición. Para preparar las fotografías:

```sh
node scripts/prepare-cafe-stills.mjs
```

La selección visual está en `docs/creative-direction.md`. Los trabajos se reproducen al pulsar play y pausan al volver a pulsar, sin barra ni controles nativos. En móvil, la galería se desplaza horizontalmente.

El generador `scripts/render-cafe-videos.py`, los clips y el componente de recorrido anteriores se conservan, pero no se utilizan en la página actual.

## GitHub Pages

`origin`: https://github.com/msmc98/montsegarciaugc.github.io

Cada push a `main` activa `.github/workflows/deploy.yml`. En Settings → Pages, seleccionar **GitHub Actions**.

Astro calcula dominio y prefijo a partir de `GITHUB_REPOSITORY`. Actualmente publica en `https://msmc98.github.io/montsegarciaugc.github.io/`. Tras transferir el repositorio a `montsegarciaugc`, publica en `https://montsegarciaugc.github.io/` sin modificar el código. La ruta inglesa añade `en/`.

Después de la transferencia:

```sh
git remote set-url origin https://github.com/montsegarciaugc/montsegarciaugc.github.io.git
```

## Archivos principales

- `src/components/Portfolio.astro`: contenido y traducciones.
- `src/components/VideoCard.astro`: reproducción de los trabajos.
- `src/styles/global.css`: composición de escritorio y móvil.
- `scripts/prepare-cafe-stills.mjs`: preparación de fotografías.

Validado en Edge a 1440 y 390 px en ambos idiomas: imágenes cargadas, ausencia de desbordamiento horizontal, reproducción y pausa de las tarjetas y acceso a los tres trabajos en móvil. La página no descarga los clips del recorrido anterior.
