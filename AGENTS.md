# AGENTS.md — handoff for AI coding assistants

Business Dashboard Starter: a setup-free classroom demo of a small-business dashboard, and a
starter for students to extend. Plain JavaScript ES modules, no framework, no backend. It runs
entirely in the browser on bundled **synthetic** BetterSpace training data. The owner may be a
non-programmer: explain changes plainly and keep them small.

## Commands

- `npm install` — once (installs esbuild, the only dependency, used by the build and its test).
- `npm run dev` — serves `src/` unbundled at http://localhost:5173 (browsers cannot load ES modules from file://).
- `npm test` — must pass before you finish. `npm run check` = build + test.
- `npm run build` — writes `dist/business-dashboard-demo.html` (single self-contained file) and `dist/site/index.html`.
- `npm run data` — repacks `data/` into `src/data/datasets.generated.js` (never edit that file by hand).

## Map

- `src/core/` — pure logic shared by browser and tests: `metrics.js` (figures), `tasks.js` (suggestion rules), `scenario-tasks.js` (Day 1 → Day 2 reconciliation), `calendar.js`, `mapping.js` (CSV columns → records + checks), `model.js` (record fields, task-rule catalogue), `dates.js`, `csv.js`.
- `src/data/scenarios.js` — loads a business/day; reporting date = that day's `metadata.as_of_date`.
- `src/storage/local-state.js` — browser-local state (localStorage, one key per business, memory fallback).
- `src/ui/` — `view-state.js` (current business/day/filters + derived figures), `shell.js`, `router.js`, `components.js`, `drawers.js`, `pages/*.js`.
- `src/briefs/` — `examples.js` (prepared briefs), `brief-input.js` (facts text), `brief-facts.js` (number checker).
- `src/i18n/` — `tr()` plain text, `tl()` menu/button text as `中文（English）`; Chinese in `zh.js`.
- `data/` — training data + `business.json` per business. `test/expected/` — answer keys (tests only).

## Rules you must not break

1. **Figures come from the records.** Never hardcode a total, never read `test/expected/` from `src/`. `test/metrics.test.js` reconciles B2C/B2B Day 1/Day 2 with the pack's `expected_metrics.json`; if it fails, fix the code, not the answer keys.
2. **Dates are fixed per scenario.** Use `scenario.reportingDate` (from `metadata.as_of_date`). Never use `new Date()` or "today" for a business date. Dates are `YYYY-MM-DD` strings; money is integer cents.
3. **Data boundary.** Day 2 replaces Day 1 (never add them together). Do not edit files in `data/` unless the user explicitly asks to change the data; if they do, update `test/expected/` from an independent calculation and rewrite or remove the affected briefs.
4. **No network, no keys in the browser.** No `fetch`, external scripts, fonts, analytics or CDNs. Keep the Content-Security-Policy in `src/index.html` and `scripts/build.js` (`connect-src 'none'`). A live AI integration belongs on a server the user controls (see `docs/STUDENT_SOP.md` §6) — never put an API key in `src/`.
5. **Honest AI labelling.** Prepared briefs are labelled "prepared in advance · not live AI", have no generate button and no fake loading/typing. Every number in `src/briefs/examples.js` must pass the checker (`test/briefs.test.js`); each priority must name a real open task key.
6. **Stable task keys.** A suggestion's key is `rule:record_id` so decisions survive Day 1 → Day 2. Do not put dates or counters in keys. Decisions are stored separately from suggestions.
7. **State stays per browser and per business.** Keys start with `bd-starter.v1.`; B2C and B2B are separate; Reset returns to Day 1 with no decisions/notes and keeps the language. If you change the stored shape, bump `STATE_VERSION` and keep reads defensive (stored data is untrusted).
8. **Every visible string is translated.** Wrap with `tr()`/`tl()` and add the Chinese to `src/i18n/zh.js`; `test/i18n.test.js` fails otherwise. Chinese is the default.
9. **Render text safely.** Use the `h()`/`t()` helpers (textContent). Never use `innerHTML` with data.
10. **Keep the look.** Colours come from the CSS variables in `src/style.css` (cream/wine/gold, validated for contrast). Gold is decoration only, never text. Check 375 px and 1366 px widths.
11. **Keep it labelled as synthetic** training material. It is not for confidential business data.

## Before you say you are done

- `npm run check` passes (build + all tests).
- You opened the changed page with `npm run dev` (or the built file) in both 中文 and English.
- You told the user what changed, what you tested, and anything you could not verify.
