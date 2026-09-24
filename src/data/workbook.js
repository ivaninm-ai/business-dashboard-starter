// "My Excel": the viewer's own workbook, read on this computer. It must use the
// layout of the BetterSpace training workbooks (data/templates/): four sheets —
// Customers, Sales, Payments, Stock — with the same column names in the first row.
// The workbook becomes a scenario exactly like a bundled one, so figures, tasks and
// the calendar are calculated by the same code. Nothing is uploaded: the page has no
// network access at all.
//
// Differences from the bundled training scenarios:
//   - one snapshot only (no Day 2);
//   - the reporting date is the latest dated event in the file (sales, receipts,
//     completions, stock counts, new accounts), since there is no metadata.json;
//   - columns that are not required may be left out; figures that use them are then
//     blank or zero, and the missing columns are listed as warnings.

import readXlsxFile from '../vendor/read-excel-file.js';
import { DATASETS } from './datasets.generated.js';
import { ENTITIES } from '../core/model.js';
import { applyTableMapping, relationalChecks, resolveReportingDate, hasErrors, findHeaderIndex, issue } from '../core/mapping.js';
import { monthStart } from '../core/dates.js';
import { tr } from '../i18n/i18n.js';

export const MY_EXCEL = 'my-excel';
export const WORKBOOK_VERSION = 1;
export const WORKBOOK_LIMITS = { bytes: 10 * 1024 * 1024, rowsPerSheet: 20000 };
export const SHEETS = ['Customers', 'Sales', 'Payments', 'Stock'];

// The full column layout is the B2B training workbook's (a superset of B2C's).
const layout = () => DATASETS['betterspace-b2b'].profile;
// Columns the B2C layout simply does not have (no account owners, no follow-ups):
// leaving them out is normal, so it is not reported.
const LAYOUT_OPTIONAL = new Set(['account_owner', 'next_follow_up_date']);

// Which columns each sheet needs (for the format table on the page and for checks).
export function workbookColumns() {
  return layout().tables.map(t => ({
    sheet: t.sheet_name,
    entity: t.entity,
    required: t.fields.filter(f => ENTITIES[t.entity].fields[f.canonical]?.required).map(f => f.header),
    optional: t.fields.filter(f => !ENTITIES[t.entity].fields[f.canonical]?.required).map(f => f.header),
  }));
}

// A cell as the mapping expects it: dates become 'YYYY-MM-DD', blanks become ''.
export function cellValue(v) {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? '' : v.toISOString().slice(0, 10);
  if (v === null || v === undefined) return '';
  if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') return v;
  return String(v);
}

// Reads an .xlsx file's bytes and keeps only the four sheets the dashboard uses.
// Returns { sheets: { Customers: rows, … }, missing: [sheet names not found] }.
export async function readWorkbook(arrayBuffer) {
  if (!arrayBuffer || arrayBuffer.byteLength > WORKBOOK_LIMITS.bytes) throw new Error(tr('Choose an Excel file no larger than 10 MB.'));
  let all;
  try { all = await readXlsxFile(arrayBuffer); }
  catch { throw new Error(tr('This file could not be read as an Excel workbook. Save it in Excel as "Excel Workbook (*.xlsx)" and try again.')); }
  const byName = new Map(all.map(s => [String(s.sheet).trim().toLowerCase(), s.data]));
  const sheets = {};
  const missing = [];
  for (const name of SHEETS) {
    const rows = byName.get(name.toLowerCase());
    if (rows) sheets[name] = rows.map(r => r.map(cellValue));
    else missing.push(name);
  }
  return { sheets, missing };
}

// The business profile for a workbook: the training layout, minus optional columns the
// file does not have, with the task rules of the training business it resembles.
export function workbookProfile(fileName, sheets) {
  const base = layout();
  const warnings = [];
  const tables = base.tables.map(t => {
    const header = (sheets[t.sheet_name] || [])[0] || [];
    const fields = t.fields.filter(f => {
      if (f.constant !== undefined || findHeaderIndex(header, f.header) !== -1) return true;
      if (ENTITIES[t.entity].fields[f.canonical]?.required) return true; // mapping reports it as an error
      if (header.length && !LAYOUT_OPTIONAL.has(f.header)) warnings.push(f.header);
      return false;
    }).map(f => ({ ...f }));
    return { ...t, fields };
  });
  const customerHeader = (sheets.Customers || [])[0] || [];
  const hasOwner = findHeaderIndex(customerHeader, 'account_owner') !== -1;
  const hasFollowUp = findHeaderIndex(customerHeader, 'next_follow_up_date') !== -1;
  // Owners and follow-ups (like B2B) → B2B rules; otherwise B2C rules, plus follow-ups if recorded.
  let tasks = (hasOwner && hasFollowUp ? DATASETS['betterspace-b2b'] : DATASETS['betterspace-b2c']).profile.policies.tasks.map(r => ({ ...r }));
  if (hasFollowUp && !hasOwner) tasks = tasks.map(r => (r.rule === 'follow_up_due' ? { ...r, enabled: true } : r));
  const name = String(fileName || '').replace(/\.xlsx$/i, '').trim();
  return {
    profile: {
      id: MY_EXCEL,
      business: { name: name || 'My Excel', name_zh: name || '我的 Excel', short: 'My Excel', short_zh: '我的 Excel', model: '', industry: '', description: '', team: [], timezone: base.business.timezone, currency: base.business.currency, currency_symbol: base.business.currency_symbol, synthetic: false },
      period: {},
      labels: { customers: 'Customers', customer: 'Customer', sales: 'Orders', sale: 'Order', payments: 'Payments', payment: 'Payment', stock: 'Stock', item: 'Product', owner: 'Owner', channel: 'Channel' },
      labels_zh: { customers: '客户', customer: '客户', sales: '订单', sale: '订单', payments: '收款', payment: '收款', stock: '库存', item: '产品', owner: '负责人', channel: '渠道' },
      status_map: base.status_map,
      policies: { dates: base.policies.dates, tasks },
      tables,
    },
    missingOptional: [...new Set(warnings)],
  };
}

// Stored workbook ({ fileName, loadedAt, sheets }) → a scenario like loadScenario() returns.
export function workbookScenario({ fileName, loadedAt, sheets, missing = [] }) {
  const { profile, missingOptional } = workbookProfile(fileName, sheets);
  const issues = [];
  for (const name of missing.length ? missing : SHEETS.filter(s => !sheets[s])) {
    issues.push(issue('error', 'missing_sheet', tr('Sheet "{0}" was not found. The workbook needs the sheets Customers, Sales, Payments and Stock (as in the template).', name)));
  }
  for (const name of SHEETS) {
    const n = Math.max(0, (sheets[name] || []).length - 1);
    if (n > WORKBOOK_LIMITS.rowsPerSheet) issues.push(issue('error', 'too_many_rows', tr('Sheet "{0}" has {1} rows; this starter reads at most {2} per sheet.', name, n, WORKBOOK_LIMITS.rowsPerSheet)));
  }
  const records = {};
  if (!hasErrors(issues)) {
    for (const table of profile.tables) {
      const result = applyTableMapping(table, sheets[table.sheet_name] || [], profile);
      records[table.entity] = result.records;
      issues.push(...result.issues);
    }
    issues.push(...relationalChecks(records));
  }
  if (missingOptional.length) issues.push(issue('warning', 'optional_columns_missing', tr('Optional columns not in the file (figures that use them stay blank or zero): {0}.', missingOptional.join(', '))));
  let reportingDate = null;
  if (!hasErrors(issues)) {
    try { reportingDate = resolveReportingDate({ reporting_date: { mode: 'latest_event_date' } }, records, null).date; }
    catch { issues.push(issue('error', 'no_dates', tr('No dated records were found, so there is no reporting date. Check the date columns.'))); }
  }
  const firstSale = (records.sales || []).map(s => s.date).filter(Boolean).sort()[0];
  const team = [...new Set((records.customers || []).map(c => c.owner).filter(Boolean))].sort();
  profile.business.team = team;
  return Object.freeze({
    key: `${MY_EXCEL}/day1`,
    businessId: MY_EXCEL,
    day: 'day1',
    profile,
    metadata: { as_of_date: reportingDate, source: 'excel', file_name: fileName, loaded_at: loadedAt },
    reportingDate,
    historyStart: firstSale ? monthStart(firstSale) : undefined,
    records,
    issues,
    ok: !hasErrors(issues),
    source: { fileName, loadedAt, counts: Object.fromEntries(SHEETS.map(s => [s, Math.max(0, (sheets[s] || []).length - 1)])) },
  });
}

// Placeholder profile while no workbook is open (labels for the menu and title).
export function emptyWorkbookProfile() { return workbookProfile('', {}).profile; }
