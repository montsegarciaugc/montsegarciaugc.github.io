const backdrop = document.querySelector<HTMLElement>('[data-cafe-background]');
const canvas = backdrop?.querySelector('canvas');
const context = canvas?.getContext('2d', { alpha: false });
const clips = [...document.querySelectorAll<HTMLVideoElement>('[data-cafe-clip]')];
const sections = [...document.querySelectorAll<HTMLElement>('[data-transition]')];
const mobile = window.matchMedia('(max-width: 700px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const base = import.meta.env.BASE_URL;
let anchors: HTMLImageElement[] = [];
let active = 0;
let target = 0;
let queued = false;
let generation = 0;

function cover(source: CanvasImageSource, width: number, height: number) {
  if (!context || !canvas || !width || !height) return;
  const scale = Math.max(canvas.width / width, canvas.height / height);
  context.drawImage(source, (canvas.width - width * scale) / 2,
    (canvas.height - height * scale) / 2, width * scale, height * scale);
  backdrop?.classList.add('is-ready');
}

function drawAnchor(index: number) {
  const image = anchors[index];
  if (image?.complete && image.naturalWidth) cover(image, image.naturalWidth, image.naturalHeight);
}

function paint() {
  queued = false;
  if (!canvas || !context) return;
  let progress = 0;
  let index = 0;
  sections.forEach((section, i) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 0) {
      index = i;
      progress = Math.max(0, Math.min(1, -rect.top / rect.height));
    }
  });
  active = index;
  const video = clips[index];
  if (progress <= .002 || progress >= .998) {
    drawAnchor(index + Number(progress >= .998));
    return;
  }
  if (reducedMotion.matches || video?.error) { drawAnchor(index + Number(progress >= .5)); return; }
  if (!video || video.readyState < 1 || !Number.isFinite(video.duration)) {
    drawAnchor(index + Number(progress >= .5));
    return;
  }
  target = progress * Math.max(0, video.duration - 1 / 24);
  if (!video.seeking && Math.abs(video.currentTime - target) > 1 / 48) {
    video.currentTime = target;
  } else if (!video.seeking && video.readyState >= 2) {
    cover(video, video.videoWidth, video.videoHeight);
  }
}

function schedule() {
  if (!queued) { queued = true; requestAnimationFrame(paint); }
}

function resize() {
  if (!canvas) return;
  const scale = Math.min(window.devicePixelRatio, 2);
  canvas.width = Math.round(window.innerWidth * scale);
  canvas.height = Math.round(window.innerHeight * scale);
  schedule();
}

function configure() {
  const current = ++generation;
  const variant = mobile.matches ? 'mobile' : 'desktop';
  anchors = Array.from({ length: 5 }, (_, index) => {
    const image = new Image();
    image.onload = () => { if (generation === current) schedule(); };
    image.src = `${base}media/cafe/stop-${index}-${variant}.jpg`;
    return image;
  });
  clips.forEach(video => {
    video.pause();
    video.muted = true;
    if (reducedMotion.matches) {
      video.removeAttribute('src');
    } else {
      video.src = (mobile.matches ? video.dataset.mobile : video.dataset.desktop)!;
    }
    video.load();
  });
  resize();
}

clips.forEach((video, index) => {
  video.addEventListener('loadedmetadata', schedule);
  video.addEventListener('loadeddata', schedule);
  video.addEventListener('error', schedule);
  video.addEventListener('seeked', () => {
    if (active !== index) return;
    if (Math.abs(video.currentTime - target) <= 1 / 24) {
      cover(video, video.videoWidth, video.videoHeight);
    }
    schedule();
  });
});
window.addEventListener('scroll', schedule, { passive: true });
window.addEventListener('resize', resize);
mobile.addEventListener('change', configure);
reducedMotion.addEventListener('change', configure);
configure();
