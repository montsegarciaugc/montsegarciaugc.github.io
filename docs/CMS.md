# CMS online con JSON y GitHub Pages

## Qué hace el CMS

El panel es una aplicación estática con JavaScript nativo. Puede alojarse junto al portfolio en GitHub Pages, Vercel u otro hosting estático. Lee y modifica src/data/portfolio.json directamente en GitHub, y guarda los archivos originales en cms-media/. No usa SQLite ni ningún backend en producción.

La compilación lee los JSON, conserva la presentación bilingüe existente y copia solamente los vídeos publicados, no eliminados y pertenecientes a categorías activas. El directorio public/media/cms/ se genera en desarrollo y antes de cada build; no debe versionarse ni editarse manualmente.

El panel muestra los datos actuales de GitHub, que pueden ser más recientes que el sitio desplegado. Guardar crea un commit en la rama seleccionada. El workflow de Pages o la integración de Vercel publican la nueva versión. Si la compilación falla, la web sigue mostrando la última versión correcta; revisa la pestaña Actions del repositorio.

## Preparación de GitHub Pages

Sube el código, src/data/portfolio.json y cms-media/. En Settings → Pages selecciona GitHub Actions. El workflow incluye comprobación de tipos, tests, build, integración estática y publicación. Los cambios hechos desde el CMS con el token del usuario disparan el mismo flujo que un push normal.

Las URLs incluyen el prefijo del repositorio cuando es un sitio de proyecto. Al transferir el repositorio a una cuenta con un repositorio llamado propietario.github.io, el prefijo pasa a /. El selector de idioma conserva el ancla. Las páginas del CMS /admin/, /admin/login/, /admin/categories/, /admin/videos/, /admin/videos/new/ y /admin/access/ se generan como HTML estático.

## Acceso desde el navegador

En GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens, crea un token de tu cuenta propietaria con acceso solo a este repositorio y permiso Contents: Read and write. No necesita permiso para editar workflows, administrar el repositorio o gestionar secretos. Puede requerir autorización de la organización si el repositorio pertenece a una.

Introduce repositorio, rama y token en /admin/. El token se envía únicamente a https://api.github.com mediante Authorization, nunca en URLs ni a los enlaces download_url de la respuesta. Se mantiene en memoria y se descarta al salir, recargar o abandonar el documento. No se guarda en cookies ni almacenamiento del navegador. Para revocarlo, usa GitHub; el panel Acceso incluye el enlace correspondiente. No hay usuario/contraseña propio ni cambio de contraseña local: la autenticación anterior de Node se ha sustituido por la de GitHub para permitir hosting estático.

La rama elegida debe permitir escritura directa a tu cuenta; las reglas de protección o la exigencia de pull requests pueden impedir el guardado. El CMS informa del rechazo y no fuerza la rama.

El HTML del panel es público; no contiene secretos. Las operaciones de escritura dependen de los permisos que comprueba GitHub, no de ocultar la interfaz. Un visitante sin token no puede guardar. Las políticas de bloqueo, caducidad y revocación pertenecen a GitHub. La API usa autorización explícita con token, sin cookies de sesión, por lo que no hay operaciones autenticadas automáticamente que otro sitio pueda ejecutar mediante un formulario CSRF.

La página del CMS aplica CSP con scripts/estilos propios y conexiones únicamente al mismo origen y la API de GitHub. No carga scripts de terceros. Los valores de categorías y títulos se escapan al renderizar formularios y listados. Usa HTTPS y evita extensiones de navegador en las que no confíes mientras administres el sitio.

## Edición y publicación

- Categorías: nombres y descripciones ES/EN, slug, orden numérico, activa/inactiva, papelera y restauración.
- Vídeos: títulos y descripciones ES/EN, categoría, orden, portada opcional, publicado/borrador, sustitución de archivos y vista previa del archivo guardado.
- La eliminación lógica conserva los archivos. El panel confirma el número de vídeos afectados al eliminar una categoría.
- Restaurar conserva la activación o publicación anteriores. Una categoría oculta impide que se exporten sus vídeos.
- El orden es ascendente y se desempata por id. Los sectores sin piezas públicas conservan su presentación compacta.
- Los slugs se validan para evitar colisiones con las secciones y títulos del portfolio. Al cambiar un slug cambian sus enlaces directos.

El panel valida el JSON y detecta si otro editor lo ha cambiado. En caso de conflicto conserva el formulario e impide sobrescribir el archivo remoto. Recarga los datos desde Resumen o Acceso antes de volver a editar. Las subidas se preparan como blobs y un único commit incorpora JSON y archivos a la rama, sin force push. Un fallo previo a actualizar la rama no deja la web con metadatos y archivos a medias; pueden quedar blobs sin referencia que GitHub puede recolectar.

## Vídeos y límites

Los archivos se envían desde el navegador directamente a la API de GitHub, con progreso de transferencia. No pasan por Vercel Functions ni por un servidor propio. El panel limita los vídeos a 90 MiB y las portadas a 10 MiB. GitHub bloquea archivos Git superiores a 100 MiB y recomienda mantener los repositorios pequeños; comprime los vídeos antes de subirlos. No se usa Git LFS.

Se inspeccionan firmas MP4/WebM y JPG/PNG/WebP, sin confiar en el nombre o MIME del navegador. Las portadas también se decodifican en el navegador cuando es posible. El panel no transcodifica vídeo ni garantiza cualquier códec: usa MP4 H.264/AAC o WebM compatible con los navegadores de destino. La validación vive en el cliente porque no hay servidor propio; quien tenga permisos de escritura en GitHub también puede modificar el repositorio fuera del panel.

Los vídeos públicos se sirven como archivos estáticos del hosting, con su soporte nativo de HTTP Range y la carga diferida del reproductor. Se prueban los archivos y la reproducción en el navegador, pero no se ha probado una subida real contra GitHub con credenciales del usuario ni un despliegue externo.

Los originales y los archivos sustituidos permanecen en el repositorio y su historial. En un repositorio público, borradores y papelera **no son confidenciales**, aunque no se exporten al portfolio. Despublicar elimina su copia en una nueva compilación; no puede revocar copias ya descargadas, cachés o versiones antiguas del sitio. No uses este repositorio público para material privado de clientes.

## Variables públicas

| Variable | Uso |
| --- | --- |
| PUBLIC_CMS_REPOSITORY | Repositorio inicial del panel, por ejemplo msmc98/montsegarciaugc.github.io |
| PUBLIC_CMS_BRANCH | Rama editada por el CMS; main por defecto |
| SITE_URL | Dominio canónico del portfolio |
| BASE_PATH | Prefijo de rutas, /montsegarciaugc.github.io/ en Pages de proyecto o / en Vercel |

Son valores de compilación. No hay tokens, contraseñas ni secretos en .env.example. No configures el token del administrador como variable PUBLIC_: se introduce solo en el formulario de acceso.

## Vercel estático

Importa el repositorio, configura BASE_PATH=/ y SITE_URL con el dominio final. vercel.json selecciona Astro, npm run build y dist. Conecta la rama de producción elegida para que los commits del CMS generen nuevos despliegues. La aplicación no necesita adaptador SSR, funciones, almacenamiento Blob ni base de datos. El plan Hobby es para uso personal no comercial; revisa la elegibilidad de este portfolio antes de asumir que ese plan sirve para publicarlo.

## Migración y copias

La migración de esta sesión ha conservado las diez categorías y tres vídeos de SQLite. La web ya lee exclusivamente el JSON versionado. Los archivos privados locales de la implementación anterior siguen fuera del repositorio y no se usan en ejecución.

El script opcional npm run content:import-sqlite importa una base local anterior indicada por DATABASE_PATH y UPLOADS_DIR, usando sus valores antiguos por defecto. Se niega a sobrescribir un JSON existente. No se ejecuta en el workflow ni en Vercel. Una instalación nueva solo necesita los JSON y archivos ya versionados, npm ci y npm run build.

El historial de Git conserva las versiones de JSON y archivos. Para una copia independiente, clona el repositorio y conserva una copia fuera de GitHub. Para restaurar, crea un commit que recupere el JSON y los archivos asociados de una versión correcta, y deja que se publique de nuevo. Evita reescribir la historia compartida o restaurar solo el JSON si le faltan los archivos que referencia.

## Referencias

- [Tokens de GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).
- [Git trees: commit de JSON y archivos](https://docs.github.com/en/rest/git/trees).
- [Límites de archivos en GitHub](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github).
- [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
