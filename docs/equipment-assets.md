# Imágenes del equipo

Equipo confirmado por el usuario: Redmi Note 14 Pro 5G verde coral, Voijump Mini Mic Pro y Hohem iSteady V2 + RS01 negro. Los tres WebP finales tienen canal alfa real y 1000 px de ancho.

| Archivo final | Fuente |
| --- | --- |
| `public/media/equipment/redmi-note-14-pro-5g-coral.webp` | [Imagen oficial Xiaomi](https://i05.appmifile.com/45_item_uk/06/01/2025/b7cbccea80e01734d20260e2dae58c6c.png), ya transparente; conversión a WebP sin generar ni recolorear el teléfono |
| `public/media/equipment/voijump-mini-mic-pro.webp` | [Producto indicado por el usuario](https://www.amazon.es/dp/B0FC5T84QD), [fotografía original](https://m.media-amazon.com/images/I/71BdjnZRW+L._AC_SL1500_.jpg) |
| `public/media/equipment/hohem-isteady-v2-rs01.webp` | [Variante negra indicada por el usuario](https://store.hohem.com/es/products/isteady-v2-rs01?variant=39499328061518), [fotografía original](https://store.hohem.com/cdn/shop/products/hohem-isteady-v2-kit-phone-stabilizer-3.jpg?v=1685588356) |

La identificación del teléfono se contrastó con la [ficha oficial](https://www.mi.com/es/product/redmi-note-14-pro-5g/specs/) y el usuario confirmó el verde coral. Las dos fotografías de accesorios se editaron con la herramienta integrada `image_gen`, en modo edición y con `transparent_background: true`. No se utilizó la API ni el flujo CLI. Conversión final a WebP con calidad 94 y alfa 100.

## Prompt del micrófono

```text
Use case: background-extraction. Edit the provided official product photograph of the Voijump Mini Mic Pro wireless lavalier microphone kit. Remove ONLY the white background and faint floor reflections to create a genuine transparent PNG cutout. Preserve the two actual black microphones with their grey furry windscreens, both foam covers, USB-C receiver and small adapter in exactly their original shapes, colors, arrangement and relative proportions. Preserve detailed wispy fur edges using natural alpha. Do not redesign, relabel, replace, invent or add any component. No text, no backdrop, no checkerboard baked into pixels, no pedestal, no illustration. Leave modest transparent padding around the whole kit.
```

## Prompt del estabilizador

```text
Use case: background-extraction. Edit the provided official product photograph of the BLACK Hohem iSteady V2 + RS01 kit. Remove ONLY the white background to make a genuinely transparent PNG product cutout. Keep the gimbal with mounted phone at left, extended RS01 grip remote in the middle, mini tripod, wrist strap, cable and pouch exactly as photographed, maintaining their shapes, layout, proportions, black and silver materials and original logos. Do not redraw or redesign the equipment or phone screen. No white rectangle, no backdrop, no baked-in checkerboard, no text added, no illustration. Preserve thin cable and strap and clean natural edges. Leave modest transparent padding.
```
