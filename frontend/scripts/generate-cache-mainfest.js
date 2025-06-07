// scripts/generate-cache-manifest.js
import { globby } from 'globby';
import fs from 'fs';

const files = await globby([
  '.next/static/**/*.{js,css,woff2}',
  'public/**/*.{png,jpg,svg,html}'
]);

const urls = files.map(file =>
  file
    .replace(/^\.next/, '/_next')
    .replace(/^public/, '')
);

const content = `self.APP_SHELL = ${JSON.stringify(urls, null, 2)};\n`;
fs.writeFileSync('public/sw-manifest.js', content);
