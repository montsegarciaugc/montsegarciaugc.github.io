# Portfolio de Montse García · CMS con JSON

Portfolio UGC bilingüe en Astro 7 con un CMS online que funciona en **GitHub Pages y Vercel estático**, sin base de datos ni servidor propio. Conserva la apariencia pública.

Las categorías y vídeos se guardan en src/data/portfolio.json. El panel administra esos archivos y los vídeos mediante la API de GitHub: cada guardado crea un commit y activa la publicación automática configurada en el repositorio. Nadie necesita editar el JSON a mano.

## Desarrollo

Node 24 LTS (24.15 o superior, anterior a 25):

```sh
npm ci
npm run dev -- --background
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
```

En PowerShell puedes usar npm.cmd. El servidor muestra el prefijo y puerto reales; por defecto la URL local es http://localhost:4321/montsegarciaugc.github.io/ y el panel está en /montsegarciaugc.github.io/admin/.

El CMS, incluso al abrirlo localmente, guarda en el repositorio remoto que selecciones. Las pruebas usan una API simulada y no escriben en GitHub. Para ver localmente cambios guardados online, actualiza tu checkout antes de volver a compilar.

## Publicar en GitHub Pages

1. Sube estos cambios, incluidos src/data/portfolio.json y cms-media/, al repositorio de GitHub.
2. En Settings → Pages selecciona **GitHub Actions** como origen.
3. El workflow .github/workflows/deploy.yml valida y publica los pushes a main.
4. Abre la URL de Pages y añade admin/ para entrar al CMS.

En el repositorio actual, las rutas previstas son:

- Español: https://msmc98.github.io/montsegarciaugc.github.io/
- Inglés: https://msmc98.github.io/montsegarciaugc.github.io/en/
- CMS: https://msmc98.github.io/montsegarciaugc.github.io/admin/

No se ha realizado ningún push ni despliegue desde esta sesión. El dominio y el prefijo se calculan con GITHUB_REPOSITORY; tras transferir el repositorio, se adaptan al nuevo propietario. El workflow usa main; cambia también PUBLIC_CMS_BRANCH si eliges otra rama y ajusta el workflow a esa rama.

## Entrar al CMS

Genera un **fine-grained personal access token** desde tu cuenta de GitHub, selecciona únicamente este repositorio y concede **Contents: Read and write**. Usa una caducidad apropiada. Entra al panel, confirma repositorio y rama e introduce el token. No lo envíes por chat ni lo añadas a archivos o variables PUBLIC_.

El token permanece solo en memoria de la pestaña. No hay contraseña propia, cookies de autenticación, localStorage ni sessionStorage. Al cerrar sesión, recargar o abandonar la página se vuelve a pedir. GitHub controla los permisos y permite revocarlo. La página del panel es pública; guardar requiere autorización de GitHub.

Permite crear y editar categorías y vídeos, traducciones ES/EN, orden, activación/publicación, sustitución de archivos, portadas, papelera y restauración. Los cambios públicos aparecen al finalizar el despliegue; guardar en GitHub no significa que la web ya se haya actualizado.

## Vercel

Importa el mismo repositorio como proyecto Astro estático. Configura BASE_PATH=/ y SITE_URL con tu dominio de producción. PUBLIC_CMS_REPOSITORY y PUBLIC_CMS_BRANCH definen los valores iniciales del panel; no son secretos. vercel.json ya define npm run build y dist. Conecta la rama main para publicar los commits del CMS. La arquitectura no necesita Functions, Blob ni base de datos. La gratuidad depende de los límites y condiciones del plan de Vercel; Hobby limita el uso a proyectos personales no comerciales.

## Verificación

```sh
npm run check
npm test
npm run build
npm run test:integration
```

Los tests usan fixtures independientes: no fallan al editar tus títulos o crear nuevas categorías desde el CMS. Comprueban esquema, visibilidad, rutas, archivos, guardado atómico en GitHub, conflictos y permisos, además de la salida estática y sus recursos.

## Archivos principales

- src/data/portfolio.json: fuente de categorías y vídeos.
- cms-media/: originales de vídeos y portadas, incluidos los borradores y la papelera.
- src/lib/: validación, selección pública y acceso a la API de GitHub.
- src/scripts/admin.ts y src/components/admin/App.astro: panel sin frameworks adicionales.
- src/components/Portfolio.astro y VideoCard.astro: diseño y reproductor públicos conservados.
- scripts/prepare-media.ts: exporta solo los archivos publicados a public/media/cms/, un directorio generado que no se versiona.
- scripts/import-sqlite.ts: migración local opcional de la implementación anterior; no se usa al publicar ni ejecutar la web.

Los tres vídeos útiles se han conservado. Las copias redundantes de seed/media se han retirado tras verificar sus hashes; los antiguos datos privados locales se conservan como respaldo y no se publican.

Guía de uso, seguridad, límites y restauración: [docs/CMS.md](docs/CMS.md). Las variables públicas disponibles están en [.env.example](.env.example)

--By msmc98
