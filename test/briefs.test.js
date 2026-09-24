// The prepared example analyses must match their scenario and use only numbers the
// app itself calculates (the rule prompts/daily_brief.md gives an AI model).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exampleBrief, exampleBriefKeys, PROVENANCE } from '../src/briefs/examples.js';
import { baselineBriefInput, allowedFacts, unsupportedTokens, briefStrings } from '../src/briefs/brief-facts.js';
import { businessIds, DAYS } from '../src/data/scenarios.js';
import { setLocale } from '../src/i18n/i18n.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const LANGS = ['zh-CN', 'en'];

test('there is one prepared brief for every scenario, in Chinese and English', () => {
  const expected = businessIds().flatMap(b => DAYS.map(d => `${b}/${d}`)).sort();
  assert.deepEqual(exampleBriefKeys().sort(), expected);
  for (const key of expected) {
    const [b, d] = key.split('/');
    const zh = exampleBrief(b, d, 'zh-CN'), en = exampleBrief(b, d, 'en');
    assert.equal(zh.language, 'zh-CN');
    assert.equal(en.language, 'en');
    assert.match(zh.headline, /[一-鿿]/, `${key}: Chinese brief is in Chinese`);
    assert.deepEqual(zh.priorities.map(p => p.task_key), en.priorities.map(p => p.task_key), `${key}: both languages prioritise the same tasks`);
    assert.equal(zh.watch_items.length, en.watch_items.length);
    assert.equal(zh.data_caveats.length, en.data_caveats.length);
  }
  assert.equal(exampleBrief('betterspace-b2c', 'day7', 'en'), null);
});

for (const key of exampleBriefKeys()) {
  const [business, day] = key.split('/');
  for (const lang of LANGS) {
    test(`${key} (${lang}): scenario, reporting date, numbers and task references check out`, () => {
      setLocale(lang);
      const input = baselineBriefInput(business, day);
      const brief = exampleBrief(business, day, lang);
      assert.equal(brief.scenario, key);
      assert.equal(brief.reporting_date, input.scenario.reportingDate, 'brief belongs to this reporting date');
      const facts = allowedFacts(input);
      const problems = briefStrings(brief).flatMap(s => unsupportedTokens(s, facts));
      assert.deepEqual(problems, [], 'every number in the brief appears in the calculated facts');
      const open = new Set(input.tasks.filter(t => !t.resolved).map(t => t.task_key));
      for (const p of brief.priorities) assert.ok(open.has(p.task_key), `${p.task_key} is an open suggestion in ${key}`);
      assert.ok(brief.priorities.length >= 3 && brief.priorities.length <= 10);
      for (const s of briefStrings(brief)) assert.ok(typeof s === 'string' && s.trim().length > 0);
    });
  }
}

test('the checker really catches unsupported claims', () => {
  setLocale('en');
  const facts = allowedFacts(baselineBriefInput('betterspace-b2b', 'day1'));
  assert.deepEqual(unsupportedTokens('RM 30,515 is overdue across 15 orders since 11 Aug (6.0%).', facts), []);
  assert.deepEqual(unsupportedTokens('RM 30,516 is overdue', facts), ['amount RM 30,516']);
  assert.deepEqual(unsupportedTokens('7.5% growth', facts), ['percentage 7.5%']);
  assert.deepEqual(unsupportedTokens('due on 12 Aug', facts), ['date 12 Aug (2026-08-12)']);
  assert.deepEqual(unsupportedTokens('8月12日到期', facts), ['date 8月12日 (2026-08-12)']);
  assert.deepEqual(unsupportedTokens('BS-999 is late', facts), ['unknown record BS-999']);
  assert.deepEqual(unsupportedTokens('4321 customers', facts), ['number 4321']);
  assert.deepEqual(unsupportedTokens('Demo Cedar Company 008 on Day 2', facts), [], 'names and day labels are not claims');
});

test('Day 2 briefs may compare with Day 1 because the Day 1 figures are in their input', () => {
  setLocale('en');
  const input = baselineBriefInput('betterspace-b2b', 'day2');
  assert.match(input.text, /Previous day \(2026-08-30\) for comparison: .*overdue RM 30,515 on 15 sale\(s\)/);
  assert.match(input.text, /payment_follow_up:BS-001 \| recorded deadline 2026-08-29/);
  assert.equal(baselineBriefInput('betterspace-b2b', 'day1').previous, null);
});

test('the example-analysis page is honest about what it shows', () => {
  const page = readFileSync(path.join(root, 'src/ui/pages/brief.js'), 'utf8');
  assert.match(page, /Prepared in advance · not live AI/);
  assert.match(page, /does not re-analyse tasks/);
  assert.doesNotMatch(page, /setTimeout|setInterval|requestAnimationFrame/, 'no fake loading or typing effect');
  assert.doesNotMatch(page, /h\('button'/, 'no button at all, so nothing suggests a live AI call');
  assert.doesNotMatch(page, /Request analysis|tl\('(Generate|Regenerate|Analyse)/i);
  assert.match(PROVENANCE.prepared_by, /Claude/);
});
