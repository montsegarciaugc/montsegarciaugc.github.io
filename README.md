# Portfolio de Montse García

Portfolio UGC en Astro, basado en las 15 páginas de `external-assets/MONTSERRAT.pdf`.

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

- `src/components/Portfolio.astro`: las 15 secciones y los textos bilingües.
- `src/styles/global.css`: paleta, tipografías y estilos adaptados a móvil.
- `public/media/`: recursos WebP extraídos del PDF y los dos MP4 suministrados.
- `scripts/extract-assets.py`: extracción reproducible con PyMuPDF y Pillow instalados en `.tools/python`.

Se han incluido los vídeos de perfume Joy y moda. Los demás ejemplos disponibles son imágenes estáticas: no hay archivos de vídeo adicionales en el PDF ni en el ZIP. Las fotografías se pueden ampliar con ratón o teclado y cerrar con Escape.

Las fuentes Playfair Display, Cormorant Garamond y Poppins se cargan desde Google Fonts. Allura aproxima la tipografía manuscrita de la referencia; no se ha suministrado el archivo de Garula. Hay fuentes de sistema de respaldo.

Contacto: montsegarciaugc@gmail.com. Instagram y TikTok: @montsegarcia_ugc.

## Validación

Compilación de producción completada. Verificado en Edge a 1440 y 390 px en ambos idiomas: 15 secciones, imágenes cargadas, sin desbordamiento horizontal, selector de idioma que conserva la sección, ampliación de imágenes y carga de ambos vídeos.
