const journey = document.querySelector<HTMLElement>('.journey');
const scenes = [...document.querySelectorAll<HTMLElement>('[data-scene]')];
const nav = [...document.querySelectorAll<HTMLButtonElement>('[data-scene-target]')];
const progressBar = document.querySelector<HTMLElement>('.reading-progress span');
const hero = document.querySelector<HTMLElement>('.hero');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let queued = false;
let active = -1;

function update() {
  queued = false;
  const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
  progressBar?.style.setProperty('transform', `scaleX(${pageHeight > 0 ? window.scrollY / pageHeight : 0})`);
  if (hero && !reducedMotion.matches) hero.style.setProperty('--hero-travel', String(Math.min(1, window.scrollY / hero.offsetHeight)));
  if (!journey || reducedMotion.matches) return;
  const rect = journey.getBoundingClientRect();
  const header = document.querySelector('header')?.getBoundingClientRect().height ?? 80;
  const length = journey.offsetHeight - (window.innerHeight - header);
  const progress = Math.max(0, Math.min(1, (header - rect.top) / Math.max(1, length)));
  const index = Math.min(scenes.length - 1, Math.floor(progress * scenes.length));
  const localProgress = Math.min(1, progress * scenes.length - index);
  journey.style.setProperty('--scene-progress', localProgress.toFixed(4));
  journey.style.setProperty('--journey-progress', progress.toFixed(4));
  if (index !== active) {
    active = index;
    journey.dataset.activeScene = String(index);
    scenes.forEach((scene, i) => {
      scene.classList.toggle('is-active', i === index);
      scene.setAttribute('aria-hidden', String(i !== index));
      scene.inert = i !== index;
    });
    nav.forEach((button, i) => {
      if (i === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
  }
}

function schedule() {
  if (!queued) { queued = true; requestAnimationFrame(update); }
}

function configure() {
  journey?.classList.toggle('is-enhanced', !reducedMotion.matches);
  if (reducedMotion.matches) {
    scenes.forEach(scene => { scene.removeAttribute('aria-hidden'); scene.inert = false; });
  }
  active = -1;
  schedule();
}

nav.forEach((button, i) => button.addEventListener('click', () => {
  if (!journey) return;
  if (reducedMotion.matches) {
    scenes[i].scrollIntoView({ behavior: 'instant', block: 'center' });
    return;
  }
  const header = document.querySelector('header')?.getBoundingClientRect().height ?? 80;
  const start = window.scrollY + journey.getBoundingClientRect().top - header;
  const length = journey.offsetHeight - (window.innerHeight - header);
  window.scrollTo({ top: start + length * (i + .18) / scenes.length, behavior: 'smooth' });
}));

window.addEventListener('scroll', schedule, { passive: true });
window.addEventListener('resize', schedule);
reducedMotion.addEventListener('change', configure);
configure();
