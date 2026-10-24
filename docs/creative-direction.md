# Estructura por sectores

Referencia revisada en navegador: https://ugcspain-annasv.my.canva.site/

Se adapta la jerarquía de la referencia al contenido disponible de Montse. Se conserva la portada de los arcos de la versión anterior, con `studio-montse-v2.webp`; el resto se organiza como un portfolio por sectores, con titulares serif en rosa, accesos beige y tarjetas de vídeo directas.

| Bloque de la referencia | Adaptación |
| --- | --- |
| Portada con identidad y contacto | Hero de Montse, navegación y contacto propio |
| Selector de sectores | Diez enlaces, en el orden indicado por el usuario |
| Vídeos por sector | Belleza, cuidado capilar, tecnología, salud, alimentación, bebidas, moda, hogar, servicios y viajes |
| Fotos UGC | Seis imágenes del portfolio original, ampliables |
| Marcas | Experiencia documentada como consultora Mary Kay y contenido de muestra |
| Opiniones | Componente preparado; oculto hasta disponer de testimonios autorizados |
| Más sobre mí | Presentación de Montse y experiencia conocida |
| Material de grabación | Redmi Note 14 Pro 5G verde coral, Voijump Mini Mic Pro y Hohem iSteady V2 + RS01 negro; imágenes transparentes |
| Contacto | Correo, Instagram, TikTok y Córdoba |

## Ajuste al material disponible

Se utilizan los tres MP4 originales, una sola vez cada uno: perfume Joy en belleza, probando comida en alimentación y reel de moda. Las tarjetas reproducen y pausan al pulsar; no incluyen barra, autoplay ni marco de dispositivo. El perfume conserva «Contenido para Ads».

Los siete sectores sin vídeo usan filas compactas con los formatos que se pueden proponer y un enlace de correo con el sector en el asunto. No se presentan como entregas realizadas ni se rellenan con vídeos ajenos o repetidos. Las imágenes proceden de los recursos del portfolio de Montse, sin descargar fotografías de la referencia.

No se trasladan las cifras, seguidores, clientes, opiniones, entrevistas o formación de Anna. `src/data/portfolio-extras.ts` contiene el equipo confirmado por el usuario y la lista de testimonios, aún vacía. Las fuentes y los prompts de los recortes están en `docs/equipment-assets.md`.

La navegación ES/EN conserva el sector seleccionado. La configuración de GitHub Pages mantiene el dominio y prefijo calculados según el propietario del repositorio.

## Paleta, texturas y retratos

La paleta vigente es pared #fae6cf y oscuro #9d5753. El mármol se interpreta como acento cálido #d7a58a y resplandor #f4cba7 en detalles y halos suaves, conservando el suelo del hero.

scripts/create-brand-textures.mjs genera dos mosaicos SVG propios con monograma MG, taza, pétalos y destello. Se distribuyen en rombos mediante filas desplazadas. Opacidad: 0,25 en positivo y 0,28 en negativo. La repetición mide 216 × 108 px en escritorio y 180 × 90 px en móvil. Los motivos se amplían dentro del módulo para mantener su tamaño al reducir las separaciones horizontal y vertical.

El hero cuenta como sección 1. Las pares usan fondo oscuro con texto claro; las impares, fondo claro con texto oscuro. Los diez sectores cuentan individualmente. La secuencia se adapta a los bloques con contenido real.

La portada y los dos retratos con taza se han editado sin pulsera. La fotografía original se conserva. src/data/portraits.ts asigna las variantes a cada sección para facilitar su intercambio. El logo monocromo usa el nuevo oscuro, con fondo transparente; el favicon también utiliza la nueva paleta. Los archivos finales y los prompts están en docs/brand-refresh-prompts.md.

## Tipografía de titulares

El apellido del hero se muestra sin punto final y mantiene la tilde pequeña. Los titulares de sección se reducen a 36–72 px según el ancho. Sus textos secundarios conservan Allura en mayúsculas, a un 60 % del tamaño del titular, sin alterar el texto accesible. La paleta oscura vigente es #9d5753.
