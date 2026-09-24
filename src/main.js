// Business Dashboard Starter — entry point. Opens straight into a populated dashboard
// using the bundled synthetic training data. No sign-in, no server, no network.

import { setLocale, tr } from './i18n/i18n.js';
import { openStorage, createStateStore } from './storage/local-state.js';
import { businessIds, hasBusiness } from './data/scenarios.js';
import { view, scenario } from './ui/view-state.js';
import { h, t } from './ui/dom.js';
import { registerPage, navigate, onBeforeRender } from './ui/router.js';
import { initShell, refreshShell } from './ui/shell.js';
import { renderOverview } from './ui/pages/overview.js';
import { renderSales } from './ui/pages/sales.js';
import { renderCustomers } from './ui/pages/customers.js';
import { renderPayments } from './ui/pages/payments.js';
import { renderStock } from './ui/pages/stock.js';
import { renderTasks } from './ui/pages/tasks.js';
import { renderCalendar } from './ui/pages/calendar.js';
import { renderBrief } from './ui/pages/brief.js';
import { renderAbout } from './ui/pages/about.js';

// If the records fail their checks (for example after replacing the data), show the
// problems instead of figures that might be wrong.
function guarded(render) {
  return () => {
    const s = scenario();
    if (s.ok) return render();
    const errors = s.issues.filter(i => i.level === 'error');
    return h('div', {}, h('div', { class: 'banner critical' }, t('p', tr('The records for {0} failed their checks, so no figures are shown.', s.key)), t('p', tr('Fix the files in data/ and run npm run data. First problems:'), 'small')),
      h('ul', { class: 'small' }, ...errors.slice(0, 20).map(e => t('li', e.message))));
  };
}

function boot() {
  const { storage, persistent, reason } = openStorage();
  view.store = createStateStore(storage);
  view.persistent = persistent;
  view.storageReason = reason;
  const prefs = view.store.prefs();
  setLocale(prefs.locale || 'zh-CN');
  view.businessId = hasBusiness(prefs.business) ? prefs.business : businessIds()[0];
  view.day = view.store.day(view.businessId);

  registerPage('overview', guarded(renderOverview));
  registerPage('sales', guarded(renderSales));
  registerPage('customers', guarded(renderCustomers));
  registerPage('payments', guarded(renderPayments));
  registerPage('stock', guarded(renderStock));
  registerPage('tasks', guarded(renderTasks));
  registerPage('calendar', guarded(renderCalendar));
  registerPage('brief', guarded(renderBrief));
  registerPage('about', renderAbout);

  initShell();
  onBeforeRender(refreshShell);
  window.addEventListener('hashchange', () => navigate(location.hash.slice(1) || 'overview'));
  navigate(location.hash.slice(1) || 'overview', { focus: false });
}

boot();
