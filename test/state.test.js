// Browser-local state and the task/calendar behaviour built on it. These tests drive
// the same functions the pages call (src/ui/view-state.js) with an in-memory storage
// object, so they cover saving, reloading, business separation, Day 1 → Day 2 and reset.
import test from 'node:test';
import assert from 'node:assert/strict';
import { openStorage, memoryStorage, createStateStore, PREFIX } from '../src/storage/local-state.js';
import { view, allTasks, calendarItems, saveDecision, defaultFilters } from '../src/ui/view-state.js';
import { setLocale } from '../src/i18n/i18n.js';

setLocale('en');
const B2C = 'betterspace-b2c', B2B = 'betterspace-b2b';

// Simulates opening the page: a fresh store over the (possibly already used) storage.
function openPage(storage, businessId = B2B) {
  view.store = createStateStore(storage);
  view.persistent = true;
  view.businessId = businessId;
  view.day = view.store.day(businessId);
  view.filters = defaultFilters();
  return view.store;
}
const task = key => allTasks().find(t => t.task_key === key);

test('a first visit starts at the baseline: Day 1, every suggestion open, no notes', () => {
  openPage(memoryStorage());
  assert.equal(view.day, 'day1');
  const tasks = allTasks();
  assert.equal(tasks.length, 45);
  assert.ok(tasks.every(t => t.status === 'suggested' && !t.resolved && !t.is_new));
  assert.equal(calendarItems().filter(i => i.kind !== 'deadline').length, 0);
});

test('accepting a task and changing its date persists after a reload and shows on the calendar', () => {
  const storage = memoryStorage();
  openPage(storage);
  assert.equal(saveDecision(task('payment_follow_up:BS-001'), { status: 'accepted' }), true);
  assert.equal(task('payment_follow_up:BS-001').action_date, '2026-08-30', 'accepting takes the suggested date');
  assert.equal(task('payment_follow_up:BS-001').owner, 'Mei', 'and the suggested owner');
  saveDecision(task('payment_follow_up:BS-001'), { action_date: '2026-09-02', note: 'Call on Wednesday' });

  openPage(storage); // reload
  const t = task('payment_follow_up:BS-001');
  assert.equal(t.status, 'accepted');
  assert.equal(t.action_date, '2026-09-02');
  assert.equal(t.note, 'Call on Wednesday');
  const onCalendar = calendarItems().filter(i => i.kind === 'task');
  assert.deepEqual(onCalendar.map(i => [i.id, i.date]), [['payment_follow_up:BS-001', '2026-09-02']]);

  saveDecision(t, { status: 'completed' });
  assert.equal(calendarItems().filter(i => i.kind === 'task').length, 0, 'completed tasks leave the calendar');
});

test('B2C and B2B keep separate state', () => {
  const storage = memoryStorage();
  openPage(storage, B2B);
  saveDecision(task('review_replenishment:T001'), { status: 'dismissed' });
  view.store.saveNote(B2B, { entry_id: 'n1', date: '2026-08-31', title: 'Supplier call' });
  view.store.setDay(B2B, 'day2');

  openPage(storage, B2C);
  assert.equal(view.day, 'day1', 'B2C is still on Day 1');
  assert.ok(allTasks().every(t => t.status === 'suggested'), 'no B2B decision leaks into B2C');
  assert.equal(view.store.notes(B2C).length, 0);

  openPage(storage, B2B);
  assert.equal(view.day, 'day2');
  assert.equal(task('review_replenishment:T001').status, 'dismissed');
  assert.equal(view.store.notes(B2B).length, 1);
  const keys = [...Array(storage.length).keys()].map(i => storage.key(i));
  assert.ok(keys.includes(`${PREFIX}.business.${B2B}`));
  assert.ok(!keys.includes(`${PREFIX}.business.${B2C}`), 'viewing B2C stored nothing for it');
});

test('Day 1 → Day 2 keeps decisions by stable task key and updates suggestions from the new records', () => {
  const storage = memoryStorage();
  openPage(storage, B2B);
  saveDecision(task('payment_follow_up:BS-001'), { status: 'accepted', action_date: '2026-08-30' });
  saveDecision(task('payment_follow_up:BS-012'), { status: 'accepted', action_date: '2026-09-01', note: 'Chase Mei' });
  saveDecision(task('follow_up_due:BC-036'), { status: 'dismissed' });

  view.store.setDay(B2B, 'day2');
  openPage(storage, B2B);
  assert.equal(view.day, 'day2');
  // BS-001 was paid on Day 2: its suggestion is resolved by the data, and the decision is kept with it.
  const bs001 = task('payment_follow_up:BS-001');
  assert.equal(bs001.resolved, true);
  assert.equal(bs001.status, 'accepted');
  assert.equal(calendarItems().some(i => i.id === 'payment_follow_up:BS-001'), false, 'resolved tasks leave the calendar');
  // BS-012 is still unpaid: same key, same decision, marked as decided on another day.
  const bs012 = task('payment_follow_up:BS-012');
  assert.equal(bs012.resolved, false);
  assert.equal(bs012.status, 'accepted');
  assert.equal(bs012.action_date, '2026-09-01');
  assert.equal(bs012.note, 'Chase Mei');
  assert.equal(bs012.stale, true);
  assert.ok(calendarItems().some(i => i.id === 'payment_follow_up:BS-012' && i.date === '2026-09-01'));
  // BC-036 got a new follow-up date in the Day 2 records; the dismissal still applies to the same key.
  assert.equal(task('follow_up_due:BC-036').status, 'dismissed');
  assert.equal(task('follow_up_due:BC-036').recorded_deadline, '2026-09-04');
  // Suggestions that only exist on Day 2 are marked new.
  assert.deepEqual(allTasks().filter(t => t.is_new).map(t => t.task_key).sort(), ['completion_overdue:BS-003', 'follow_up_due:BC-046', 'unassigned_prospect:BC-046']);
  assert.deepEqual(allTasks().filter(t => t.resolved).map(t => t.task_key), ['payment_follow_up:BS-001']);
});

test('a decision made on Day 2 about a Day-2-only suggestion does not appear when going back to Day 1', () => {
  const storage = memoryStorage();
  openPage(storage, B2B);
  view.store.setDay(B2B, 'day2');
  openPage(storage, B2B);
  saveDecision(task('unassigned_prospect:BC-046'), { status: 'accepted', owner: 'Amir' });
  saveDecision({ task_key: 'custom:x1', custom: true, status: 'accepted', title: 'Order brochures', reason: '' }, { action_date: '2026-09-03' });
  view.store.setDay(B2B, 'day1');
  openPage(storage, B2B);
  assert.equal(task('unassigned_prospect:BC-046'), undefined, 'not part of the Day 1 view');
  assert.equal(task('custom:x1').title, 'Order brochures', 'your own tasks show on both days');
  view.store.setDay(B2B, 'day2');
  openPage(storage, B2B);
  assert.equal(task('unassigned_prospect:BC-046').owner, 'Amir', 'still stored');
});

test('calendar notes can be added, edited and deleted', () => {
  const storage = memoryStorage();
  const store = openPage(storage, B2C);
  store.saveNote(B2C, { entry_id: 'n1', date: '2026-08-31', title: 'Stock count', detail: 'Warehouse' });
  openPage(storage, B2C);
  assert.deepEqual(calendarItems().filter(i => i.kind === 'entry').map(i => [i.id, i.date, i.title]), [['n1', '2026-08-31', 'Stock count']]);
  view.store.saveNote(B2C, { entry_id: 'n1', date: '2026-09-01', title: 'Stock count (moved)' });
  assert.equal(calendarItems().find(i => i.id === 'n1').date, '2026-09-01');
  view.store.deleteNote(B2C, 'n1');
  assert.equal(calendarItems().filter(i => i.kind === 'entry').length, 0);
  assert.equal(view.store.saveNote(B2C, { entry_id: 'bad', date: 'not a date', title: 'x' }), false, 'invalid dates are refused');
});

test('reset restores the baseline and keeps the language choice', () => {
  const storage = memoryStorage();
  const store = openPage(storage, B2B);
  store.setPrefs({ locale: 'en', business: B2B });
  saveDecision(task('payment_follow_up:BS-022'), { status: 'completed' });
  store.saveNote(B2B, { entry_id: 'n1', date: '2026-08-30', title: 'x' });
  store.setDay(B2B, 'day2');
  openPage(storage, B2C);
  saveDecision(task('review_replenishment:R003'), { status: 'accepted' });

  assert.equal(view.store.resetBusiness(B2B), true);
  openPage(storage, B2B);
  assert.equal(view.day, 'day1');
  assert.ok(allTasks().every(t => t.status === 'suggested'));
  assert.equal(view.store.notes(B2B).length, 0);
  openPage(storage, B2C);
  assert.equal(task('review_replenishment:R003').status, 'accepted', 'resetting B2B leaves B2C alone');

  assert.equal(view.store.resetAll(), true);
  openPage(storage, B2C);
  assert.ok(allTasks().every(t => t.status === 'suggested'));
  assert.equal(view.store.prefs().locale, 'en', 'language is kept');
});

test('reset leaves other pages\' keys in the same browser alone', () => {
  const storage = memoryStorage();
  storage.setItem('someone-else', 'keep me');
  const store = createStateStore(storage);
  store.setDay(B2C, 'day2');
  store.resetAll();
  assert.equal(storage.getItem('someone-else'), 'keep me');
});

test('stored data is treated as untrusted: malformed entries are dropped', () => {
  const storage = memoryStorage();
  storage.setItem(`${PREFIX}.business.${B2B}`, JSON.stringify({ version: 1, day: 'day9', decisions: { 'payment_follow_up:BS-001': { status: 'hacked', owner: 42, action_date: '<img>' }, '': { status: 'accepted' } }, notes: { n: { date: 'x', title: 'bad' } } }));
  const store = createStateStore(storage);
  const s = store.business(B2B);
  assert.equal(s.day, 'day1');
  assert.deepEqual(Object.keys(s.decisions), ['payment_follow_up:BS-001']);
  assert.equal(s.decisions['payment_follow_up:BS-001'].status, 'suggested');
  assert.equal(s.decisions['payment_follow_up:BS-001'].owner, '');
  assert.equal(s.decisions['payment_follow_up:BS-001'].action_date, '');
  assert.deepEqual(s.notes, {});
  storage.setItem(`${PREFIX}.business.${B2C}`, '{not json');
  assert.equal(store.business(B2C).day, 'day1');
});

test('when the browser blocks storage the app keeps working in memory and says so', () => {
  const blocked = openStorage(() => { throw Object.assign(new Error('denied'), { name: 'SecurityError' }); });
  assert.equal(blocked.persistent, false);
  assert.equal(blocked.reason, 'SecurityError');
  const store = createStateStore(blocked.storage);
  assert.equal(store.setDay(B2C, 'day2'), true);
  assert.equal(store.day(B2C), 'day2', 'works for this visit');
  assert.equal(openStorage(() => undefined).persistent, false);
  const full = { getItem: () => null, setItem: () => { throw new Error('QuotaExceededError'); }, removeItem: () => {}, key: () => null, length: 0 };
  assert.equal(createStateStore(full).setDay(B2C, 'day2'), false, 'a failed write is reported, not hidden');
  assert.equal(openStorage(() => memoryStorage()).persistent, true);
});
