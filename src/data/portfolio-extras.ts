// Testimonios autorizados y equipo confirmado por Montse.
// Las secciones se renderizan cuando contienen información.
export const testimonials: {
  quote: { es: string; en: string };
  author: string;
  company?: string;
}[] = [];

export const equipment: {
  name: string;
  description: { es: string; en: string };
  image?: string;
}[] = [
  {
    name: 'Redmi Note 14 Pro 5G',
    description: { es: 'Vídeo y fotografía · Verde coral', en: 'Video and photography · Coral Green' },
    image: 'equipment/redmi-note-14-pro-5g-coral.webp',
  },
  {
    name: 'Voijump Mini Mic Pro',
    description: { es: 'Micrófonos inalámbricos USB-C', en: 'USB-C wireless microphones' },
    image: 'equipment/voijump-mini-mic-pro.webp',
  },
  {
    name: 'Hohem iSteady V2 + RS01',
    description: { es: 'Estabilizador y mando a distancia', en: 'Gimbal and remote control' },
    image: 'equipment/hohem-isteady-v2-rs01.webp',
  },
];
