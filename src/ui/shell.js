// The frame around every page: the "synthetic data" ribbon, the top bar with the
// language choice, the scenario bar (business, day, advance, reset) and the menu.

import { $, h, t, add, modal, toast } from './dom.js';
import { view, scenario, openTasks, labelTl, businessName, defaultFilters, isZh, isExcel } from './view-state.js';
import { navigate, rerender } from './router.js';
import { allBusinessIds, businessProfile, dayMetadata, DAYS, dayNumber, nextDay, MY_EXCEL } from '../data/scenarios.js';
import { pickExcel, forgetExcel, restoreWorkbook } from './pages/excel.js';
import { formatDate } from '../core/dates.js';
import { setLocale, getLocale, tr, tl } from '../i18n/i18n.js';
import { PREFIX } from '../storage/local-state.js';

// Menu entries: page id → English name (translated with tl, or the business's own label).
const NAV = [
  ['overview', () => tl('Overview')],
  ['sales', () => labelTl('sales', 'Sales')],
  ['customers', () => labelTl('customers', 'Customers')],
  ['payments', () => labelTl('payments', 'Payments')],
  ['stock', () => labelTl('stock', 'Stock')],
  ['tasks', () => tl('Tasks')],
  ['calendar', () => tl('Calendar')],
  ['brief', () => tl('Example analysis')],
  ['about', () => tl('About this demo')],
];

export function initShell() {
  const nav = $('#nav');
  for (const [id] of NAV) add(nav, h('a', { href: `#${id}`, 'data-page': id }, h('span', { class: 'nav-label' }), id === 'tasks' ? h('span', { class: 'count', id: 'nav-tasks-count' }) : null));
  add(nav, h('div', { class: 'sidenav-foot small muted', id: 'nav-foot' }));
  // Small screens: the menu slides over the page; a backdrop click, a link or Escape closes it.
  const backdrop = h('div', { class: 'nav-backdrop', hidden: true });
  document.body.append(backdrop);
  const setMenu = open => { nav.classList.toggle('open', open); backdrop.hidden = !open; $('#menu-toggle').setAttribute('aria-expanded', String(open)); if (open) nav.querySelector('a.active, a')?.focus(); };
  $('#menu-toggle').addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  backdrop.addEventListener('click', () => setMenu(false));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); $('#menu-toggle').focus(); } });
  const lang = $('#lang-select');
  lang.addEventListener('change', () => { setLocale(lang.value); view.store.setPrefs({ locale: getLocale() }); rerender(); });
  // Another tab of this demo changed the saved state: show the same thing here.
  window.addEventListener('storage', e => {
    if (e.key !== null && !e.key.startsWith(PREFIX)) return;
    if (e.key === null || e.key === `${PREFIX}.workbook`) restoreWorkbook();
    view.day = view.store.day(view.businessId);
    rerender();
  });
}

// Runs before every page render so the frame always matches the state.
export function refreshShell() {
  document.title = tr('{0} · Training demo', businessName());
  $('#lang-select').value = getLocale();
  $('#menu-toggle').setAttribute('aria-label', tr('Menu'));
  $('#nav').setAttribute('aria-label', tr('Sections'));
  $('#business-name').textContent = businessName();
  renderRibbon();
  renderScenarioBar();
  for (const a of $('#nav').querySelectorAll('a[data-page]')) {
    const entry = NAV.find(([id]) => id === a.dataset.page);
    a.querySelector('.nav-label').textContent = entry[1]();
    a.classList.toggle('active', a.dataset.page === view.page);
    if (a.dataset.page === view.page) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  }
  const open = scenario()?.ok ? openTasks().length : 0;
  $('#nav-tasks-count').textContent = open ? String(open) : '';
  $('#nav-foot').textContent = isExcel() ? tr('Your own Excel · no sign-in · stays in this browser unless you use Gemini') : tr('Synthetic training data · no sign-in · stays in this browser unless you use Gemini');
  renderBanner();
}

function renderRibbon() {
  const r = $('#ribbon'); r.textContent = '';
  if (isExcel()) {
    add(r, h('strong', {}, tr('Your own Excel')), ' · ', tr('Read on this computer only; nothing is uploaded.'), ' ',
      view.persistent ? tr('Your changes are saved only in this browser.') : tr('Your changes are not saved in this browser.'), ' ',
      h('a', { href: '#about' }, tr('About this demo')));
    return;
  }
  add(r, h('strong', {}, tr('Training demo')), ' · ', tr('All records are invented (synthetic training data).'), ' ',
    view.persistent ? tr('Your changes are saved only in this browser.') : tr('Your changes are not saved in this browser.'), ' ',
    h('a', { href: '#about' }, tr('About this demo')));
}

function segmented(label, items) {
  return h('div', { class: 'scn-group', role: 'group', 'aria-label': label }, t('span', label, 'scn-label'),
    h('div', { class: 'segmented' }, ...items.map(it => h('button', { type: 'button', class: [it.active && 'active', it.shrink && 'shrink'].filter(Boolean).join(' '), 'aria-pressed': String(it.active), title: it.title || null, onclick: it.onclick }, it.text))));
}

function renderScenarioBar() {
  const bar = $('#scenario-bar'); bar.textContent = '';
  const zh = isZh();
  add(bar, segmented(tr('Business'), allBusinessIds().map(id => {
    const b = businessProfile(id).business;
    return { text: (zh ? b.short_zh : b.short) || b.name, title: (zh ? b.name_zh : b.name) || b.name, active: id === view.businessId, shrink: id === MY_EXCEL, onclick: () => switchBusiness(id) };
  })));
  if (isExcel()) {
    const s = scenario();
    if (s) {
      add(bar, h('span', { class: 'scn-file', title: tr('Read {0}', new Date(s.source.loadedAt).toLocaleString()) }, h('span', { 'aria-hidden': 'true' }, '📄 '), s.source.fileName),
        h('button', { class: 'btn small', onclick: pickExcel }, tl('Read the Excel again…')),
        h('button', { class: 'btn ghost small', onclick: forgetExcel }, tl('Forget this file')),
        s.reportingDate ? h('span', { class: 'scn-note' }, tr('Reporting date {0} (latest date in the file)', formatDate(s.reportingDate))) : null);
    } else add(bar, h('button', { class: 'btn primary small', onclick: pickExcel }, tl('Choose an Excel file…')));
  } else {
    add(bar, segmented(tr('Scenario'), DAYS.map(day => ({
      text: tr('Day {0} · {1}', dayNumber(day), formatDate(dayMetadata(view.businessId, day).as_of_date)),
      active: day === view.day,
      onclick: () => switchDay(day),
    }))));
    const next = nextDay(view.day);
    if (next) add(bar, h('button', { class: 'btn primary small', onclick: () => switchDay(next, { announce: true }) }, tl('Advance to Day {0}', dayNumber(next))));
    add(bar, h('span', { class: 'scn-note' }, tr('Reporting date fixed at {0}', formatDate(scenario().reportingDate))));
  }
  add(bar, h('button', { class: 'btn ghost small scn-reset', onclick: openResetDialog }, tl('Reset demo…')));
}

function renderBanner() {
  const b = $('#banner'); b.textContent = ''; b.hidden = true; b.className = 'banner';
  if (!view.persistent) {
    b.hidden = false; b.classList.add('warning');
    add(b, tr('This browser does not allow the page to save anything ({0}). The demo still works, but changes are lost when you close or reload the page.', view.storageReason || tr('blocked')));
    return;
  }
  // Your own Excel: say what the file lacks or where records do not line up.
  const warnings = isExcel() && scenario()?.ok ? scenario().issues.filter(i => i.level === 'warning') : [];
  if (warnings.length) {
    b.hidden = false; b.classList.add('info');
    add(b, h('b', {}, tr('Notes about your file: ')), warnings.slice(0, 3).map(w => w.message).join(' '), warnings.length > 3 ? tr(' (+{0} more)', warnings.length - 3) : '');
  }
}

export function switchBusiness(id) {
  if (id === view.businessId) return;
  view.businessId = id;
  view.day = view.store.day(id); // each business remembers its own day
  view.filters = defaultFilters();
  view.calMonth = '';
  view.store.setPrefs({ business: id });
  rerender();
}

export function switchDay(day, { announce = false } = {}) {
  if (day === view.day) return;
  view.day = day;
  view.calMonth = '';
  if (!view.store.setDay(view.businessId, day)) toast(tr('Could not save in this browser. The change was not kept.'), { error: true });
  else if (announce) toast(tr('Now showing Day {0}: the records are the {1} snapshot. Your task decisions and notes are kept.', dayNumber(day), formatDate(scenario().reportingDate)), { ms: 6000 });
  rerender();
}

export function openResetDialog() {
  const body = h('div', {},
    t('p', tr('Reset returns the demo to its starting point: Day 1, no task decisions and no calendar notes. The language choice is kept. The bundled records never change.')),
    t('p', tr('This only affects this browser.'), 'small muted'));
  const after = (ok, msg) => {
    if (!ok) { toast(tr('Could not reset the saved state in this browser.'), { error: true }); return; }
    view.day = view.store.day(view.businessId);
    view.filters = defaultFilters(); view.calMonth = ''; view.taskView = 'open';
    toast(msg);
    navigate('overview');
  };
  modal(tr('Reset demo'), body, { actions: [
    { label: tr('Reset {0} only', businessName()), danger: true, onclick: () => after(view.store.resetBusiness(view.businessId), tr('{0} has been reset to Day 1.', businessName())) },
    { label: tl('Reset both businesses'), danger: true, onclick: () => after(view.store.resetAll(), tr('Both businesses have been reset to Day 1.')) },
  ] });
}
