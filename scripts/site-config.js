// Site settings for a published copy, read from environment variables. In a student's own
// repository they are GitHub repository variables (Settings → Secrets and variables →
// Actions → Variables), which .github/workflows/publish-site.yml passes to the build:
//
//   BUSINESS_NAME  the name shown for "My Excel" (their own workbook), e.g. 小明家具店
//   START_WITH     which business opens first: my-excel, b2c or b2b
//
// Both are optional. A mistake stops the build with a message the student can act on,
// so a wrong value never reaches the site. The values are built into the page, which is
// public: they are settings, never secrets.

import { readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');

export const BUSINESS_NAME_MAX = 40;
export const MY_EXCEL_ID = 'my-excel'; // same as MY_EXCEL in src/data/workbook.js
const ALIASES = { b2c: 'betterspace-b2c', b2b: 'betterspace-b2b', excel: MY_EXCEL_ID };

// Business folders in data/ (the same rule as scripts/pack-data.js: a business.json inside).
export function businessFolders() {
  return readdirSync(dataDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && existsSync(path.join(dataDir, d.name, 'business.json')))
    .map(d => d.name);
}

export function siteConfigFromEnv(env = process.env, ids = businessFolders()) {
  const problems = [];
  const businessName = String(env.BUSINESS_NAME ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  const length = [...businessName].length;
  if (length > BUSINESS_NAME_MAX) {
    problems.push(`BUSINESS_NAME 太长了：最多 ${BUSINESS_NAME_MAX} 个字，现在是 ${length} 个。· BUSINESS_NAME is too long: at most ${BUSINESS_NAME_MAX} characters, now ${length}.`);
  }
  const raw = String(env.START_WITH ?? '').trim();
  const startWith = raw ? ALIASES[raw.toLowerCase()] || raw.toLowerCase() : '';
  if (startWith && startWith !== MY_EXCEL_ID && !ids.includes(startWith)) {
    const names = [MY_EXCEL_ID, ...Object.keys(ALIASES).filter(a => ids.includes(ALIASES[a])), ...ids.filter(id => !Object.values(ALIASES).includes(id))];
    problems.push(`START_WITH 只能是 ${names.join('、')}，你写的是 "${raw}"。· START_WITH must be one of ${names.join(', ')}; it is "${raw}".`);
  }
  if (problems.length) throw new Error(problems.join('\n'));
  return { businessName, startWith };
}

// The replacement for src/site-config.js in the build and in npm run dev.
export function siteConfigModule(config) {
  return `export const SITE_CONFIG = Object.freeze(${JSON.stringify(config)});\n`;
}

export function describeSiteConfig({ businessName, startWith }) {
  return `Site settings: BUSINESS_NAME=${businessName ? JSON.stringify(businessName) : '(not set)'}, START_WITH=${startWith || '(not set)'}`;
}
