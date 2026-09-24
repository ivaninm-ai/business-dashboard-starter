import { h, t, add, modal, toast } from '../dom.js';
import { pageHead, scopeBar } from '../components.js';
import { view, reportingDate, calendarItems, notes, records } from '../view-state.js';
import { saleDrawer, customerDrawer } from '../drawers.js';
import { navigate, rerender } from '../router.js';
import { savedMessage } from './tasks.js';
import { addDays, monthStart, daysInMonth, isIsoDate } from '../../core/dates.js';
import { tr, tl, intlLocale } from '../../i18n/i18n.js';

export function renderCalendar() {
  const rd = reportingDate();
  view.calMonth ||= monthStart(rd);
  const month = view.calMonth;
  const go = m => { view.calMonth = m; rerender(); };
  const root = h('div', {}, pageHead(tl('Calendar'), h('button', { class: 'btn primary small', onclick: () => editNote(null) }, tl('+ Add note'))), scopeBar({ period: false }));
  const head = h('div', { class: 'cal-head' },
    h('button', { class: 'btn small', 'aria-label': tr('Previous month'), onclick: () => go(monthStart(addDays(month, -1))) }, '‹'),
    t('h2', new Date(month + 'T00:00:00Z').toLocaleDateString(intlLocale(), { month: 'long', year: 'numeric', timeZone: 'UTC' })),
    h('button', { class: 'btn small', 'aria-label': tr('Next month'), onclick: () => go(addDays(month, daysInMonth(month))) }, '›'),
    h('button', { class: 'btn ghost small', onclick: () => go(monthStart(rd)) }, tl('Reporting month')));
  const grid = h('div', { class: 'cal-grid' });
  for (const d of [tr('Mon'), tr('Tue'), tr('Wed'), tr('Thu'), tr('Fri'), tr('Sat'), tr('Sun')]) add(grid, t('div', d, 'cal-dow'));
  const items = calendarItems().map(item => ({ ...item, onclick: () => openItem(item) }));
  const byDate = new Map();
  for (const it of items) { if (!byDate.has(it.date)) byDate.set(it.date, []); byDate.get(it.date).push(it); }
  const offset = (new Date(month + 'T00:00:00Z').getUTCDay() + 6) % 7;
  const start = addDays(month, -offset);
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i);
    const other = d.slice(0, 7) !== month.slice(0, 7);
    const list = byDate.get(d) || [];
    const cell = h('div', { class: `cal-day ${other ? 'other' : ''} ${d === rd ? 'today' : ''}` }, t('div', `${Number(d.slice(8))}${d === rd ? tr(' · reporting date') : ''}`, 'd'));
    for (const it of list.slice(0, 6)) add(cell, h('button', { type: 'button', class: `cal-item ${it.kind}${it.overdue && it.kind === 'deadline' ? ' overdue' : ''}`, title: it.title, onclick: it.onclick }, it.overdue && it.kind === 'deadline' ? `⚠ ${it.title}` : it.title));
    if (list.length > 6) add(cell, t('span', tr('+{0} more', list.length - 6), 'small muted'));
    add(grid, cell);
  }
  add(root, head, grid, h('div', { class: 'legend' },
    h('span', { class: 'deadline' }, tr('Recorded deadline (from the records)')),
    h('span', { class: 'task' }, tr('Accepted task (action date)')),
    h('span', { class: 'entry' }, tr('Your note')),
    h('span', { class: 'overdue' }, tr('Recorded deadline before the reporting date'))));
  add(root, t('p', tr('Dates are calendar days; the records contain no appointment times, so none are shown. Only accepted tasks appear here. Nothing is sent to an external calendar.'), 'hint'));
  return root;
}

function openItem(item) {
  if (item.kind === 'entry') return editNote(notes().find(e => e.entry_id === item.id));
  if (item.kind === 'task') return navigate('tasks');
  if (item.record_type === 'sales') return saleDrawer(records().sales.find(s => s.id === item.record_id));
  return customerDrawer(records().customers.find(c => c.id === item.record_id));
}

export function editNote(e) {
  const title = h('input', { type: 'text', value: e?.title || '', maxlength: 200 });
  const date = h('input', { type: 'date', value: e?.date || reportingDate() });
  const detail = h('textarea', { maxlength: 1000 }); detail.value = e?.detail || '';
  const body = h('div', {}, h('label', { class: 'field' }, t('span', tr('Title')), title), h('label', { class: 'field' }, t('span', tr('Date')), date), h('label', { class: 'field' }, t('span', tr('Detail')), detail));
  const done = (ok, msg) => { if (ok) { toast(msg); view.calMonth = monthStart(date.value || reportingDate()); rerender(); } else toast(tr('Could not save in this browser. The change was not kept.'), { error: true, ms: 7000 }); };
  const actions = [{ label: tl('Save'), primary: true, onclick: () => {
    if (!title.value.trim() || !isIsoDate(date.value)) { toast(tr('Title and a valid date are required'), { error: true }); return true; }
    const now = new Date().toISOString();
    done(view.store.saveNote(view.businessId, { entry_id: e?.entry_id || `note_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, date: date.value, title: title.value.trim(), detail: detail.value.trim(), created_at: e?.created_at || now, updated_at: now }), savedMessage());
    return false;
  } }];
  if (e) actions.push({ label: tl('Delete'), danger: true, onclick: () => { done(view.store.deleteNote(view.businessId, e.entry_id), tr('Deleted')); return false; } });
  modal(e ? tr('Edit note') : tr('Add note'), body, { actions });
}
