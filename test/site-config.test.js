// Site settings: the GitHub repository variables BUSINESS_NAME and START_WITH, which let a
// student name their own business and choose what opens first without editing any file.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { siteConfigFromEnv, siteConfigModule, businessFolders, BUSINESS_NAME_MAX, MY_EXCEL_ID } from '../scripts/site-config.js';
import { SITE_CONFIG } from '../src/site-config.js';
import { MY_EXCEL, workbookProfile } from '../src/data/workbook.js';
import { startBusiness, businessIds } from '../src/data/scenarios.js';
import { createStateStore, memoryStorage } from '../src/storage/local-state.js';

const B2C = 'betterspace-b2c', B2B = 'betterspace-b2b';

test('without variables the site keeps its defaults', () => {
  assert.deepEqual(siteConfigFromEnv({}), { businessName: '', startWith: '' });
  assert.deepEqual(siteConfigFromEnv({ BUSINESS_NAME: '  ', START_WITH: '' }), { businessName: '', startWith: '' });
  assert.deepEqual({ ...SITE_CONFIG }, { businessName: '', startWith: '' }, 'the file in src/ holds the classroom defaults');
  assert.equal(MY_EXCEL_ID, MY_EXCEL);
  assert.deepEqual(businessFolders().sort(), businessIds().slice().sort(), 'the build sees the same businesses as the app');
});

test('BUSINESS_NAME is tidied and limited in length', () => {
  assert.equal(siteConfigFromEnv({ BUSINESS_NAME: '  小明\t家具店\n ' }).businessName, '小明 家具店');
  assert.equal(siteConfigFromEnv({ BUSINESS_NAME: '字'.repeat(BUSINESS_NAME_MAX) }).businessName.length, BUSINESS_NAME_MAX);
  assert.throws(() => siteConfigFromEnv({ BUSINESS_NAME: '字'.repeat(BUSINESS_NAME_MAX + 1) }), /BUSINESS_NAME 太长了.*too long/s);
});

test('START_WITH accepts my-excel, b2c, b2b (any case) and explains a wrong value', () => {
  assert.equal(siteConfigFromEnv({ START_WITH: 'my-excel' }).startWith, MY_EXCEL);
  assert.equal(siteConfigFromEnv({ START_WITH: ' Excel ' }).startWith, MY_EXCEL);
  assert.equal(siteConfigFromEnv({ START_WITH: 'B2B' }).startWith, B2B);
  assert.equal(siteConfigFromEnv({ START_WITH: 'b2c' }).startWith, B2C);
  assert.equal(siteConfigFromEnv({ START_WITH: B2B }).startWith, B2B);
  assert.throws(() => siteConfigFromEnv({ START_WITH: '我的 Excel' }), e => {
    assert.match(e.message, /START_WITH 只能是 my-excel、b2c、b2b/);
    assert.match(e.message, /START_WITH must be one of my-excel, b2c, b2b; it is "我的 Excel"/);
    return true;
  });
  assert.throws(() => siteConfigFromEnv({ START_WITH: 'b2x', BUSINESS_NAME: 'x'.repeat(99) }), /BUSINESS_NAME[\s\S]*START_WITH/, 'every problem is listed at once');
});

test('the settings module is plain data, safe for any name', async () => {
  const name = '小明 "家具" </script> <!-- 店';
  const text = siteConfigModule({ businessName: name, startWith: B2B });
  const mod = await import(`data:text/javascript,${encodeURIComponent(text)}`);
  assert.deepEqual({ ...mod.SITE_CONFIG }, { businessName: name, startWith: B2B });
  assert.ok(Object.isFrozen(mod.SITE_CONFIG));
});

test('BUSINESS_NAME names "My Excel"; without it the file name does', () => {
  const named = workbookProfile('Sales 2026.xlsx', {}, '小明家具店').profile.business;
  assert.deepEqual([named.name, named.name_zh, named.short, named.short_zh], ['小明家具店', '小明家具店', '小明家具店', '小明家具店']);
  const unnamed = workbookProfile('Sales 2026.xlsx', {}, '').profile.business;
  assert.deepEqual([unnamed.name, unnamed.name_zh, unnamed.short, unnamed.short_zh], ['Sales 2026', 'Sales 2026', 'My Excel', '我的 Excel']);
  const empty = workbookProfile('', {}, '').profile.business;
  assert.deepEqual([empty.name, empty.name_zh], ['My Excel', '我的 Excel']);
});

test('START_WITH picks the first business; the visitor\'s own choice then sticks', () => {
  const store = createStateStore(memoryStorage());
  const open = startWith => {
    const start = startBusiness(store.prefs(), startWith);
    if (start.seen) store.setPrefs({ business: start.businessId, start: start.seen });
    return start.businessId;
  };
  assert.equal(open(''), B2C, 'no setting: the first training business');
  store.setPrefs({ business: B2B });
  assert.equal(open(''), B2B, 'the visitor chose B2B last time');
  assert.equal(open(MY_EXCEL), MY_EXCEL, 'the site owner sets START_WITH: it wins once, even over an earlier choice');
  store.setPrefs({ business: B2C });
  assert.equal(open(MY_EXCEL), B2C, 'after that the visitor\'s own choice is kept');
  assert.equal(open(B2B), B2B, 'a changed START_WITH wins once again');
  assert.equal(open(B2B), B2B);
  assert.equal(store.prefs().start, B2B);
  assert.equal(startBusiness({ business: 'gone', start: '' }, '').businessId, B2C, 'an unknown stored business falls back');
});

test('the single-file build carries the settings inside its hashed script', async () => {
  const { buildHtml } = await import('../scripts/build.js');
  const html = await buildHtml({ businessName: '小明家具店', startWith: MY_EXCEL });
  const body = html.slice(html.indexOf('<script>') + '<script>'.length, html.lastIndexOf('</script>'));
  assert.ok(html.includes(`script-src 'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`), 'CSP hash still matches');
  assert.match(body, /"?businessName"?: ?"小明家具店"/);
  assert.match(body, /"?startWith"?: ?"my-excel"/);
  const plain = await buildHtml({ businessName: '', startWith: '' });
  assert.doesNotMatch(plain, /小明家具店/);
});
