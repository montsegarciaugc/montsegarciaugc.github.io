// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
const variables = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
const env = (/** @type {string} */ name) => process.env[name] ?? variables[name];
const repository = env('PUBLIC_CMS_REPOSITORY') || env('GITHUB_REPOSITORY') || 'msmc98/montsegarciaugc.github.io';
const [owner, name] = repository.split('/');
const userSite = name.toLowerCase() === owner.toLowerCase() + '.github.io';
const vercel = !!env('VERCEL');
export default defineConfig({
  output: 'static',
  site: env('SITE_URL') || (vercel && env('VERCEL_PROJECT_PRODUCTION_URL') ? 'https://' + env('VERCEL_PROJECT_PRODUCTION_URL') : 'https://' + owner + '.github.io'),
  base: env('BASE_PATH') || (vercel || userSite ? '/' : '/' + name + '/'),
  trailingSlash: 'always',
  build: { inlineStylesheets: 'never' },
  vite: { build: { assetsInlineLimit: 0 } },
  i18n: { defaultLocale: 'es', locales: ['es', 'en'], routing: { prefixDefaultLocale: false } },
});
