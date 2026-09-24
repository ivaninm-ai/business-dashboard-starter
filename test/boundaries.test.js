// Data and network boundaries: the app reads only its bundled training data, never
// the answer keys, never the network, and the single-file build stays self-contained.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { collectDatasets, renderModule, OUTPUT } from '../scripts/pack-data.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
function files(dir, ext) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) out.push(...files(full, ext));
    else if (ext.some(e => name.endsWith(e))) out.push(full);
  }
  return out;
}
// Our own code. The vendored Excel reader (src/vendor/) is library code, checked separately below.
const appSource = files(path.join(root, 'src'), ['.js', '.html', '.css']).filter(f => !f.endsWith('.generated.js') && !f.includes(`${path.sep}vendor${path.sep}`));
// XML namespace names inside SVG and Excel files look like web addresses but are never requested.
const NAMESPACES = /^http:\/\/(www\.w3\.org|schemas\.openxmlformats\.org|purl\.oclc\.org|schemas\.microsoft\.com)\//;

test('the packed data module is up to date with data/', () => {
  assert.equal(readFileSync(OUTPUT, 'utf8'), renderModule(collectDatasets()), 'run `npm run data`');
});

test('only records, metadata and business profiles are packed — never the answer keys', () => {
  const packed = readFileSync(OUTPUT, 'utf8');
  assert.doesNotMatch(packed, /expected_metrics|august_order_value|story_sale_balance/);
  assert.equal(files(path.join(root, 'data'), ['.json']).some(f => f.includes('expected_metrics')), false, 'answer keys live in test/expected only');
  for (const f of appSource) assert.doesNotMatch(readFileSync(f, 'utf8'), /expected_metrics/, `${path.relative(root, f)} must not read the answer keys`);
});

test('the app source makes no network requests and holds no keys', () => {
  const forbidden = [/\bfetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /EventSource/, /sendBeacon/, /\bimport\s*\(/, /navigator\.serviceWorker/, /<link[^>]+href="https?:/, /<script[^>]+src="https?:/, /api[_-]?key\s*[:=]/i, /Bearer /];
  for (const f of appSource) {
    const text = readFileSync(f, 'utf8');
    // The translation dictionary is text, not code: it is only checked for web addresses.
    if (!f.endsWith(path.join('i18n', 'zh.js'))) for (const re of forbidden) assert.doesNotMatch(text, re, `${path.relative(root, f)} matches ${re}`);
    const urls = (text.match(/https?:\/\/[^\s'"`)<]+/g) || []).filter(u => u !== 'http://www.w3.org/2000/svg');
    assert.deepEqual(urls, [], `${path.relative(root, f)} contains web addresses`);
  }
});

test('the vendored Excel reader makes no network requests and starts no workers', () => {
  const text = readFileSync(path.join(root, 'src/vendor/read-excel-file.js'), 'utf8');
  for (const re of [/fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /sendBeacon/, /new Worker/, /importScripts/, /eval\s*\(/, /new Function\s*\(/]) assert.doesNotMatch(text, re);
  const urls = (text.match(/https?:\/\/[^\s'"`)<]+/g) || []).filter(u => !NAMESPACES.test(u));
  assert.deepEqual(urls, [], 'only XML namespace names');
  assert.match(text, /^\/\*! read-excel-file 9\.3\.10 \(MIT\)/, 'licence notice kept');
});

test('the development page forbids network access with a Content-Security-Policy', () => {
  const html = readFileSync(path.join(root, 'src/index.html'), 'utf8');
  assert.match(html, /Content-Security-Policy" content="default-src 'none';[^"]*connect-src 'none'/);
  assert.doesNotMatch(html, /fonts\.googleapis|fonts\.gstatic/);
});

test('the single-file build is self-contained, offline and labelled as synthetic', async t => {
  let buildHtml;
  try { ({ buildHtml } = await import('../scripts/build.js')); } catch (e) { assert.fail(`esbuild is needed for this test — run npm install first (${e.message})`); }
  const html = await buildHtml();
  assert.match(html, /<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'sha256-[A-Za-z0-9+/=]+'; style-src 'unsafe-inline'; img-src data:; connect-src 'none';/);
  assert.doesNotMatch(html, /<script[^>]+src=|<link[^>]+rel="stylesheet"|type="module"/, 'no external or module scripts, no stylesheet links');
  assert.equal((html.match(/<script>/g) || []).length, 1, 'exactly one inline script');
  // The CSP hash must match the script exactly, or the browser refuses to run it.
  const body = html.slice(html.indexOf('<script>') + '<script>'.length, html.lastIndexOf('</script>'));
  const hash = createHash('sha256').update(body, 'utf8').digest('base64');
  assert.ok(html.includes(`script-src 'sha256-${hash}'`), 'CSP hash matches the inline script');
  const urls = (html.match(/https?:\/\/[^\s'"`)<]+/g) || []).filter(u => !NAMESPACES.test(u));
  assert.deepEqual(urls, [], 'no web addresses in the build (XML namespace names aside)');
  assert.doesNotMatch(html, /new Worker|importScripts/, 'no Web Workers (the CSP would block them)');
  assert.match(html, /BS-001,BC-001,2026-08-20/, 'B2B records are inside the file');
  assert.match(html, /RS-321/, 'B2C Day 2 records are inside the file');
  assert.match(html, /synthetic training data only/);
  assert.match(html, /MIT License\s+Copyright \(c\) 2026 Infinite New Media/, 'the licence notice travels with the file');
  assert.doesNotMatch(html, /expected_metrics|august_order_value/);
  // A note, not a failure: editing src/ without rebuilding is normal while developing.
  const built = path.join(root, 'dist/business-dashboard-demo.html');
  if (existsSync(built) && readFileSync(built, 'utf8') !== html) t.diagnostic('dist/business-dashboard-demo.html is older than src/ — run `npm run build` before handing it out.');
});
