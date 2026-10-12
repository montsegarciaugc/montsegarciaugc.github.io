// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Actions provides the current owner/repository, including after a transfer.
// Local builds use the current repository until it is transferred.
const repository = process.env.GITHUB_REPOSITORY ?? 'msmc98/montsegarciaugc.github.io';
const [owner, name] = repository.split('/');
const isUserSite = name.toLowerCase() === `${owner.toLowerCase()}.github.io`;

export default defineConfig({
  site: `https://${owner}.github.io`,
  base: isUserSite ? '/' : `/${name}`,
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
