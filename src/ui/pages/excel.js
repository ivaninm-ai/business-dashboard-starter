// "My Excel": open the viewer's own workbook, remember it in this browser, forget it.
// The file is read with the bundled reader on this computer; the page cannot send it
// anywhere (the file is read locally; the only network access is the optional
// "Analyse with Gemini", which sends calculated figures, never the file).

import { h, t, add, modal, toast } from '../dom.js';
import { pageHead } from '../components.js';
import { view, defaultFilters } from '../view-state.js';
import { navigate, rerender } from '../router.js';
import { readWorkbook, workbookScenario, workbookColumns, MY_EXCEL } from '../../data/workbook.js';
import { setWorkbookScenario, loadScenario } from '../../data/scenarios.js';
import { TEMPLATES } from '../../data/templates.generated.js';
import { tr, tl, sentences } from '../../i18n/i18n.js';

let lastProblem = null; // { fileName, messages } from the latest attempt that could not be used (this visit only)

// On start-up: rebuild "My Excel" from the copy remembered in this browser, if any.
export function restoreWorkbook() {
  const saved = view.store.workbook();
  setWorkbookScenario(saved ? workbookScenario(saved) : null);
}

export function pickExcel() {
  document.querySelectorAll('input.excel-picker').forEach(el => el.remove());
  const input = h('input', { type: 'file', class: 'excel-picker', accept: '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', hidden: true });
  input.addEventListener('change', () => { const file = input.files?.[0]; input.remove(); if (file) openExcel(file); });
  document.body.append(input);
  input.click();
}

function showProblems(fileName, messages, keptPrevious) {
  lastProblem = { fileName, messages };
  const body = h('div', {},
    t('p', keptPrevious ? tr('{0} could not be used, so the dashboard still shows the file you opened before.', fileName) : tr('{0} could not be used. Nothing was saved.', fileName)),
    h('ul', { class: 'small' }, ...messages.slice(0, 15).map(m => t('li', m))),
    messages.length > 15 ? t('p', tr('…and {0} more.', messages.length - 15), 'small muted') : null,
    t('p', tr('Fix the workbook in Excel (compare it with the template), save it, and choose it again.'), 'small muted'));
  modal(tr('This Excel file cannot be used yet'), body, { actions: [{ label: tl('Choose another file…'), primary: true, onclick: () => { pickExcel(); return false; } }] });
  rerender();
}

export async function openExcel(file) {
  const hadWorkbook = !!loadScenario();
  if (!/\.xlsx$/i.test(file.name)) return showProblems(file.name, [tr('Choose an .xlsx file. Older .xls files and CSV files must first be saved in Excel as "Excel Workbook (*.xlsx)".')], hadWorkbook);
  toast(tr('Reading {0} on this computer…', file.name), { ms: 8000 });
  let read;
  try { read = await readWorkbook(await file.arrayBuffer()); }
  catch (e) { return showProblems(file.name, [e.message], hadWorkbook); }
  const loadedAt = new Date().toISOString();
  const scenario = workbookScenario({ fileName: file.name, loadedAt, sheets: read.sheets, missing: read.missing });
  if (!scenario.ok) return showProblems(file.name, scenario.issues.filter(i => i.level === 'error').map(i => i.message), hadWorkbook);
  lastProblem = null;
  setWorkbookScenario(scenario);
  const saved = view.store.saveWorkbook({ fileName: file.name, loadedAt, sheets: read.sheets });
  view.businessId = MY_EXCEL;
  view.day = 'day1';
  view.filters = defaultFilters();
  view.calMonth = '';
  const c = scenario.source.counts;
  const summary = tr('Opened {0}: {1} customers, {2} orders, {3} receipts, {4} products.', file.name, c.Customers, c.Sales, c.Payments, c.Stock);
  const kept = !view.persistent ? tr('It is not remembered: this browser does not allow saving.')
    : saved === 'saved' ? tr('It is remembered in this browser until you choose Forget this file.')
    : saved === 'too_large' ? tr('It is too large to remember; after a reload, choose it again.')
    : tr('It could not be remembered in this browser; after a reload, choose it again.');
  toast(sentences(summary, kept), { ms: 8000, error: saved !== 'saved' && view.persistent });
  navigate('overview');
}

export function forgetExcel() {
  modal(tr('Forget this file?'), h('div', {},
    t('p', tr('The dashboard stops showing your Excel and removes its copy from this browser, together with the task decisions and calendar notes you made for it. Your Excel file itself is not changed.'))),
  { actions: [{ label: tl('Forget this file'), danger: true, onclick: () => {
    view.store.forgetWorkbook(MY_EXCEL);
    setWorkbookScenario(null);
    lastProblem = null;
    toast(tr('Forgotten. Your Excel file itself was not changed.'));
    rerender();
    return false;
  } }] });
}

function downloadTemplate(tpl) {
  const bin = atob(tpl.base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const a = h('a', { href: url, download: tpl.file, hidden: true });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// Shown on every data page while "My Excel" has no file open.
export function renderExcelStart() {
  const root = h('div', {}, pageHead(tl('Open your Excel')));
  if (lastProblem) {
    add(root, h('div', { class: 'banner critical' }, t('p', tr('{0} could not be used:', lastProblem.fileName)),
      h('ul', { class: 'small' }, ...lastProblem.messages.slice(0, 15).map(m => t('li', m)))));
  }
  add(root, h('div', { class: 'card excel-open' },
    t('h2', tr('See your own business in this dashboard')),
    t('p', tr('Choose an Excel workbook laid out like the template below. It is read here, on this computer, and the file is never uploaded.')),
    h('button', { class: 'btn primary', onclick: pickExcel }, tl('Choose an Excel file…')),
    h('ul', { class: 'small ink2' },
      t('li', tr('The dashboard remembers the file in this browser, so it is still here after a reload. It is not a backup and is not shared. Choose Forget this file to remove it.')),
      t('li', tr('When you change the workbook, save it in Excel and choose Read the Excel again.')),
      t('li', tr('Do not open confidential business data on a shared or public computer.')))));

  const cols = workbookColumns();
  const names = { Customers: tr('Customers'), Sales: tr('Sales'), Payments: tr('Payments'), Stock: tr('Stock') };
  add(root, h('div', { class: 'card' },
    t('h2', tr('The layout it needs')),
    t('p', tr('Four sheets with these names, column names in the first row, one record per row — exactly as in the template. Required columns must be there; the others may be left out (figures that use them stay blank or zero).'), 'small ink2'),
    h('div', { class: 'table-wrap' }, h('table', {},
      h('thead', {}, h('tr', {}, t('th', tr('Sheet')), t('th', tr('Required columns')), t('th', tr('Other columns')))),
      h('tbody', {}, ...cols.map(c => h('tr', {}, h('td', {}, h('b', {}, c.sheet), h('div', { class: 'small muted' }, names[c.sheet])), t('td', c.required.join(', '), 'mono'), t('td', c.optional.join(', '), 'mono small')))))),
    h('ul', { class: 'small ink2' },
      t('li', tr('status: Confirmed, In Progress, Completed or Cancelled. customer_type: Customer or Prospect. offering_type: Product or Service.')),
      t('li', tr('Dates as Excel dates or written 2026-08-30. Amounts as plain numbers in RM (for example 300 or 299.90).')),
      t('li', tr('The reporting date is the latest date in the file (sales, receipts, completions and stock counts). Everything is calculated as of that day.')))));

  add(root, h('div', { class: 'card' },
    t('h2', tr('Start from a practice workbook')),
    t('p', tr('No file yet? Download a practice workbook (invented BetterSpace data) and open it to try the dashboard. To use your own records, replace its rows, keep the sheet names and the first row, and save it as .xlsx.'), 'small ink2'),
    h('div', { class: 'row' }, ...TEMPLATES.map(tpl => h('button', { class: 'btn', onclick: () => downloadTemplate(tpl) }, tr('Download {0}', tpl.file)))),
    t('p', tr('The B2B workbook has account owners and follow-up dates; the B2C workbook does not. Either layout works.'), 'hint')));
  return root;
}

export function excelProblemMessage() { return lastProblem; }
