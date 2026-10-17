# Portfolio de Montse García

Portfolio UGC bilingüe en Astro, organizado por sectores siguiendo https://ugcspain-annasv.my.canva.site/. Utiliza las imágenes del portfolio original de Montse, los tres vídeos suministrados y la portada de los arcos.

## Idiomas

- `/montsegarciaugc.github.io/`: español.
- `/montsegarciaugc.github.io/en/`: inglés.

El selector ES/EN conserva el ancla de la sección actual. Los textos, metadatos, navegación y etiquetas de accesibilidad se generan en cada idioma desde `src/components/Portfolio.astro`. Las imágenes y los vídeos conservan su contenido original.

## Desarrollo

```sh
npm run dev -- --host 127.0.0.1 --port 4321 --background
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

- `src/components/Portfolio.astro`: selector de diez nichos, vídeos por sector, fotos, experiencia, presentación y contacto bilingües.
- `src/data/portfolio-extras.ts`: equipo confirmado y lista de testimonios, oculta hasta añadir opiniones reales.
- `src/styles/global.css`: paleta, tipografías y estilos adaptados a móvil.
- `src/components/VideoCard.astro`: reproductor en tarjeta, con play y pausa al pulsar de nuevo; sin controles nativos ni mockups.
- `public/media/`: recursos WebP extraídos del PDF y los tres MP4 suministrados.
- `scripts/extract-assets.py`: extracción reproducible con PyMuPDF y Pillow instalados en `.tools/python`.

Se han incluido los vídeos de perfume Joy, moda y probando comida. Cada tarjeta reproduce al pulsar el play y pausa al volver a pulsar sobre el vídeo. También funciona con Enter y Espacio. Al iniciar otro vídeo, el anterior se pausa. Los demás ejemplos disponibles son imágenes estáticas. Las fotografías se pueden ampliar con ratón o teclado y cerrar con Escape.

Las fuentes se cargan desde Google Fonts, con fuentes de sistema de respaldo. La portada integra la fotografía de Montse en un escenario imaginario. El recorrido de escenas se ha retirado. La dirección visual está documentada en `docs/creative-direction.md`.

Contacto: montsegarciaugc@gmail.com. Instagram y TikTok: @montsegarcia_ugc.

## Validación

Comprobado en Edge a 1440 y 390 px, en español e inglés: diez accesos a nichos, tres vídeos sin controles nativos ni mockups, imágenes cargadas, ausencia de desbordamiento horizontal, reproducción y pausa, ampliación de fotos y cambio de idioma conservando el sector. Los sectores sin vídeo tienen una presentación compacta con contacto por correo. El equipo confirmado se muestra con tres imágenes transparentes. Las opiniones permanecen ocultas hasta recibir testimonios reales.


## Texturas y colores

Paleta actual: claro #fae6cf, oscuro #9d5753 y acentos cálidos de mármol. Dos patrones SVG propios en positivo y negativo con motivos en rombos, más visibles y próximos. Regeneración: node scripts/create-brand-textures.mjs. Estilos: src/styles/brand.css.

El logo se ha recoloreado y los retratos de Montse se han editado sin pulsera, con una variante de cafetería y otra de estudio. src/data/portraits.ts permite intercambiarlos. Archivos finales y prompts: docs/brand-refresh-prompts.md. Fuentes del equipo: docs/equipment-assets.md.
