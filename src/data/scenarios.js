// Known training scenarios: two synthetic businesses × two days. Each scenario is
// read from the packed CSV text with the same column mapping and checks the original
// template used for these files. The reporting date is fixed by the day's
// metadata.json (as_of_date) so a lesson never drifts with the computer's clock.

import { DATASETS } from './datasets.generated.js';
import { MY_EXCEL, emptyWorkbookProfile } from './workbook.js';
import { parseCsv } from '../core/csv.js';
import { applyTableMapping, relationalChecks, hasErrors } from '../core/mapping.js';

export const DAYS = ['day1', 'day2'];
export { MY_EXCEL };

// The bundled training businesses (not "My Excel").
export function businessIds() { return Object.keys(DATASETS); }

// Everything the business picker offers: the training businesses, then "My Excel".
export function allBusinessIds() { return [...businessIds(), MY_EXCEL]; }

export function hasBusiness(id) { return Object.hasOwn(DATASETS, id) || id === MY_EXCEL; }

// The viewer's own workbook, once opened (see workbook.js). One snapshot, no Day 2.
let workbook = null;
export function setWorkbookScenario(scenario) { workbook = scenario; }
export function workbookLoaded() { return !!workbook; }

export function businessProfile(id) {
  if (id === MY_EXCEL) return workbook?.profile || emptyWorkbookProfile();
  const ds = DATASETS[id];
  if (!ds) throw new Error(`Unknown business "${id}"`);
  return ds.profile;
}

export function dayMetadata(id, day) {
  if (id === MY_EXCEL) return workbook?.metadata || { as_of_date: null };
  const d = DATASETS[id]?.days?.[day];
  if (!d) throw new Error(`Unknown scenario "${id}/${day}"`);
  return d.metadata;
}

export function previousDay(day) { return DAYS[DAYS.indexOf(day) - 1] || null; }
export function nextDay(day) { return DAYS[DAYS.indexOf(day) + 1] || null; }
export function dayNumber(day) { return DAYS.indexOf(day) + 1; }

const cache = new Map();

// Returns null for "My Excel" while no workbook is open.
export function loadScenario(id, day) {
  if (id === MY_EXCEL) return workbook;
  const key = `${id}/${day}`;
  if (cache.has(key)) return cache.get(key);
  const profile = businessProfile(id);
  const metadata = dayMetadata(id, day);
  const files = DATASETS[id].days[day].files;
  const records = {};
  const issues = [];
  for (const table of profile.tables) {
    const text = files[table.file];
    if (text === undefined) { issues.push({ level: 'error', code: 'missing_file', message: `${key}: ${table.file} is missing` }); continue; }
    const result = applyTableMapping(table, parseCsv(text), profile);
    records[table.entity] = result.records;
    issues.push(...result.issues);
  }
  issues.push(...relationalChecks(records));
  const scenario = Object.freeze({
    key,
    businessId: id,
    day,
    profile,
    metadata,
    reportingDate: metadata.as_of_date,
    historyStart: metadata.history_start || profile.period?.history_start,
    records,
    issues,
    ok: !hasErrors(issues),
  });
  cache.set(key, scenario);
  return scenario;
}
