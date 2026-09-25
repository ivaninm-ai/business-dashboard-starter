// AI analysis: "Analyse with Gemini" asks Google's Gemini for a live analysis of the
// numbers as they are now, with the viewer's own API key (briefs/gemini.js — the app's
// only network access). The answer is labelled as live AI with its model and time, and
// its numbers are checked against the data before the viewer reads it. There is no fake
// typing effect, and nothing is sent until the viewer presses the button.

import { h, t, add } from '../dom.js';
import { pageHead, scopeBar } from '../components.js';
import { view, allTasks, businessName, scenario, previousScenario, calendarItems } from '../view-state.js';
import { buildAiPrompt, answerProblems } from '../../briefs/ai-prompt.js';
import { askGemini, looksLikeKey } from '../../briefs/gemini.js';
import { tr, tl, getLocale } from '../../i18n/i18n.js';

export function renderBrief() {
  const root = h('div', {}, pageHead(tl('AI analysis')), scopeBar({ period: false }));
  add(root, h('div', { class: 'banner info' },
    t('p', tr('Gemini can write an analysis of your numbers as they are now, including your task decisions and notes. Nothing is sent anywhere unless you press "Analyse with Gemini" below.'))));
  add(root, geminiCard());
  return root;
}

// The latest live answer per business and day, for this visit only (not saved).
const answers = new Map();
const answerKey = () => `${view.businessId}|${view.day}`;

const PROBLEM_TEXT = {
  key: () => tr('Google did not accept this key. Copy the whole key again from AI Studio, then delete the saved key here and paste the new one.'),
  region: () => tr('Google says the Gemini API is not available where you are.'),
  quota: () => tr('Your free Gemini quota is used up for now. Wait a minute and try again, or try again tomorrow.'),
  busy: () => tr('Gemini is busy right now. Try again in a minute.'),
  model: () => tr('Google could not find a Gemini model for this key. Try again later.'),
  blocked: () => tr('Gemini returned no answer for this request. Try again, or hide the names and try again.'),
  network: () => tr('Could not reach Google. Check your internet connection. (The offline file can analyse only when this computer is online.)'),
  timeout: () => tr('Gemini took too long to answer. Try again.'),
  other: () => tr('Gemini could not answer this time. Try again later.'),
};

// "Analyse with Gemini". Without a saved key: how to get one, and a field to paste it.
// With a key: what will be sent, the button, and the latest answer with its number check.
function geminiCard() {
  const card = h('div', { class: 'card ai-live' });
  const redraw = () => card.replaceWith(geminiCard());
  add(card, t('h3', tr('Analyse with Gemini (live AI)')));
  const key = view.store.geminiKey();

  if (!key) {
    const input = h('input', { type: 'password', autocomplete: 'off', spellcheck: 'false', class: 'key-input', 'aria-label': tr('Gemini API key'), placeholder: tr('Paste your Gemini API key') });
    const status = h('p', { class: 'small', role: 'status', 'aria-live': 'polite' });
    const save = () => {
      const value = input.value.trim();
      if (!looksLikeKey(value)) { status.textContent = tr('That does not look like an API key. Copy the whole key from AI Studio and paste it here.'); return; }
      if (!view.store.setGeminiKey(value)) { status.textContent = tr('This browser does not allow saving, so the key cannot be kept here.'); return; }
      redraw();
    };
    add(card,
      t('p', tr('Gemini can write an analysis of the numbers on this page as they are now. You need your own free Gemini API key from Google AI Studio:'), 'small ink2'),
      h('ol', { class: 'small ink2' },
        t('li', tr('Open aistudio.google.com/apikey and sign in with a Google account.')),
        t('li', tr('Copy your key (if there is none, press Create API key).')),
        t('li', tr('Paste it here and press "Save key".'))),
      h('div', { class: 'row' }, input, h('button', { type: 'button', class: 'btn primary', onclick: save }, tl('Save key'))),
      status,
      t('p', tr('The key is kept only in this browser and is sent only to Google, with your own requests. Treat it like a password: never put it in GitHub (not even as a repository variable) and never share a screenshot of it.'), 'small muted'));
    return card;
  }

  let hide = true; // your own data: names hidden unless you untick
  const request = () => buildAiPrompt({ scenario: scenario(), previous: previousScenario(), tasks: allTasks(), calendar: calendarItems(), locale: getLocale(), hideNames: hide });
  const preview = h('pre', { class: 'facts ai-request' }, request());
  const status = h('p', { class: 'small', role: 'status', 'aria-live': 'polite' });
  const result = h('div', { class: 'ai-answer-slot' });
  const showAnswer = a => { result.textContent = ''; if (a) add(result, answerView(a)); };
  const button = h('button', { type: 'button', class: 'btn primary', onclick: analyse }, tl('Analyse with Gemini'));

  async function analyse() {
    const prompt = request();
    preview.textContent = prompt;
    const inputs = { scenario: scenario(), previous: previousScenario(), tasks: allTasks(), calendar: calendarItems() };
    const where = businessName();
    button.disabled = true;
    status.textContent = tr('Waiting for Gemini… (usually 10–30 seconds)');
    const reply = await askGemini({ prompt, key: view.store.geminiKey() });
    button.disabled = false;
    if (!reply.ok) { status.textContent = PROBLEM_TEXT[reply.kind]?.() || PROBLEM_TEXT.other(); return; }
    status.textContent = '';
    const a = { text: reply.text, model: reply.model, at: new Date().toLocaleString(getLocale()), where, problems: answerProblems(reply.text, inputs) };
    answers.set(answerKey(), a);
    showAnswer(a);
  }

  const last4 = key.slice(-4);
  add(card,
    h('div', { class: 'row small' }, t('span', tr('Your key is saved in this browser (ending …{0}).', last4), 'ink2'),
      h('button', { type: 'button', class: 'btn small ghost', onclick: () => { view.store.forgetGeminiKey(); answers.clear(); redraw(); } }, tl('Delete key'))),
    h('label', { class: 'small' }, h('input', { type: 'checkbox', checked: hide, onchange: e => { hide = e.target.checked; preview.textContent = request(); } }), ' ', tr('Replace customer and staff names with codes')),
    h('div', { class: 'row' }, button, status),
    h('div', { class: 'banner warning' }, t('p', tr('Pressing the button sends the text under "Show exactly what will be sent" to Google\'s Gemini. On the free plan Google may use it to improve its products, and asks you not to send personal or confidential information. Use practice data, or data you are allowed to share. Notes you typed are sent as written.'), 'small')),
    h('details', {}, h('summary', {}, tr('Show exactly what will be sent')), preview),
    result);
  showAnswer(answers.get(answerKey()));
  return card;
}

function answerView(a) {
  const check = a.problems.length
    ? h('div', { class: 'banner warning' }, t('p', tr('Number check: these are not in your data — trust the dashboard, not the AI: {0}', a.problems.map(p => p.replace(/^(amount|percentage|date|month|number|unknown record) /, '')).slice(0, 12).join(', ')), 'small'))
    : h('div', { class: 'banner info' }, t('p', tr('Number check: every amount, date, count and record ID in this answer is in your data.'), 'small'));
  return h('div', { class: 'ai-answer' },
    h('p', { class: 'small muted' }, h('span', { class: 'badge info' }, tr('Live AI')), ' ', tr('{0} · {1} · from the figures for {2}', a.model, a.at, a.where)),
    h('div', { class: 'answer-text' }, a.text),
    check,
    t('p', tr('Written by AI: it can be wrong or miss context. It is not professional advice.'), 'small muted'));
}
