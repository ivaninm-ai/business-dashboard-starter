import { h, t, add } from '../dom.js';
import { pageHead } from '../components.js';
import { view, isZh } from '../view-state.js';
import { openResetDialog, switchBusiness } from '../shell.js';
import { businessIds, businessProfile, loadScenario, DAYS, dayNumber, MY_EXCEL } from '../../data/scenarios.js';
import { formatDate } from '../../core/dates.js';
import { tr, tl } from '../../i18n/i18n.js';
import { APP_VERSION } from '../../version.js';

export function renderAbout() {
  const root = h('div', {}, pageHead(tl('About this demo')));
  add(root, h('div', { class: 'card' }, t('h2', tr('What this is')),
    t('p', tr('A classroom demonstration and starter project for a small-business dashboard. Every record is invented BetterSpace training data; no real customers, payments or companies are involved.')),
    t('p', tr('It needs no account, no sign-in, no API key and no internet connection. All figures are calculated in this page from the bundled records.'), 'small ink2')));

  add(root, h('div', { class: 'card' }, t('h2', tr('Try this in class')),
    h('ol', { class: 'steps' },
      t('li', tr('Choose a business at the top: B2C home retail or B2B office furniture.')),
      t('li', tr('Read the Overview, then open Sales, Customers, Payments and Stock. Click a row to see the record behind a figure.')),
      t('li', tr('Open Example analysis to read a prepared brief for the same day.')),
      t('li', tr('In Tasks, accept a suggestion and change its action date. It then appears on the Calendar. Add a calendar note too.')),
      t('li', tr('Press "Advance to Day 2". The records are replaced by the 31 August snapshot; figures and suggestions update, and your decisions are kept.')),
      t('li', tr('Press "Reset demo" to return to Day 1 with no decisions or notes.')))));

  const saving = view.persistent
    ? tr('Your task decisions, notes, chosen day and language are saved in this browser on this device. They are not a backup, not shared with anyone and not synchronised to other devices. Clearing browser data, a private window, or a different browser or computer starts from the beginning.')
    : tr('This browser does not allow the page to save anything ({0}). The demo still works, but your changes are lost when you close or reload the page.', view.storageReason || tr('blocked'));
  add(root, h('div', { class: 'card' }, t('h2', tr('Saving and reset')),
    h('p', {}, h('span', { class: `badge ${view.persistent ? 'good' : 'warning'}` }, view.persistent ? tr('Saving in this browser') : tr('Not saving')), ' ', saving),
    t('p', tr('B2C and B2B are saved separately. Day 1 and Day 2 of the same business share your decisions, because each suggestion keeps the same identifier on both days.'), 'small ink2'),
    h('button', { class: 'btn', onclick: openResetDialog }, tl('Reset demo…'))));

  const rows = [];
  for (const id of businessIds()) {
    const p = businessProfile(id);
    for (const day of DAYS) {
      const s = loadScenario(id, day);
      rows.push(h('tr', {}, t('td', isZh() ? p.business.name_zh || p.business.name : p.business.name), t('td', tr('Day {0}', dayNumber(day))), t('td', formatDate(s.reportingDate)),
        ...['customers', 'sales', 'payments', 'stock'].map(e => h('td', { class: 'num' }, String((s.records[e] || []).length)))));
    }
  }
  add(root, h('div', { class: 'card' }, t('h2', tr('Training data')),
    t('p', tr('Two synthetic businesses, each with a Day 1 and a Day 2 snapshot. Day 2 replaces Day 1; it is not added on top. Each day has a fixed reporting date, so the lesson looks the same whatever today\'s date is.'), 'small ink2'),
    h('div', { class: 'table-wrap' }, h('table', {}, h('thead', {}, h('tr', {}, t('th', tr('Business')), t('th', tr('Scenario')), t('th', tr('Reporting date')), h('th', { class: 'num' }, tr('Customers')), h('th', { class: 'num' }, tr('Sales')), h('th', { class: 'num' }, tr('Payments')), h('th', { class: 'num' }, tr('Stock')))), h('tbody', {}, ...rows))),
    t('p', tr('Row counts are read from the bundled files each time this page opens.'), 'hint')));

  add(root, h('div', { class: 'card' }, t('h2', tr('Your own Excel')),
    t('p', tr('Choose "My Excel" at the top to open a workbook laid out like the training workbooks. It is read on this computer and never uploaded; the dashboard keeps a copy in this browser until you choose Forget this file. Figures use the same rules as the training data, with the latest date in the file as the reporting date.'), 'small ink2'),
    h('a', { class: 'btn', href: '#overview', onclick: () => { if (view.businessId !== MY_EXCEL) switchBusiness(MY_EXCEL); } }, tl('Open My Excel'))));

  add(root, h('div', { class: 'card' }, t('h2', tr('Limits')),
    h('ul', { class: 'small ink2' },
      t('li', tr('This is a learning starter, not a production system. Do not enter confidential or real business data.')),
      t('li', tr('It reads the bundled training files, or your own Excel in the same layout. Other layouts need changes to the project (see docs/STUDENT_SOP.md).')),
      t('li', tr('The example analyses were prepared in advance. They are not live AI and do not react to your changes.')),
      t('li', tr('Saving is per browser. There is no sign-in, no sharing and no cloud backup.'))),
    t('p', tr('Version {0}', APP_VERSION), 'hint')));
  return root;
}
