// "Analyse with Gemini": a live analysis written by Google's Gemini with the viewer's own
// free API key. This module is the ONLY network access in the app, and it runs only when
// the viewer presses the button. The page's Content-Security-Policy allows no other
// address (src/index.html, scripts/build.js).
//
// The key is typed in by its owner and kept only in their browser (local-state.js). It is
// never in the code, the repository, the repository variables, the build or the site.
// It goes to Google in a request header, never in the web address.

export const GEMINI_HOST = 'https://generativelanguage.googleapis.com';
// Aliases that always point at Google's current Flash models, so a retired model name
// never breaks the button. Flash-Lite is tried when Flash is busy or out of free quota.
export const GEMINI_MODELS = ['gemini-flash-latest', 'gemini-flash-lite-latest'];
const TIMEOUT_MS = 90_000;

// A loose check that catches pasting the wrong thing (a sentence, a URL); Google decides
// whether the key is valid.
export function looksLikeKey(value) {
  return /^[A-Za-z0-9_.\-]{20,200}$/.test(String(value ?? '').trim());
}

export function geminiRequest(model, key, prompt) {
  return {
    url: `${GEMINI_HOST}/v1beta/models/${model}:generateContent`,
    init: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2 } }),
    },
  };
}

// The answer text, without any "thinking" parts, and with Markdown emphasis and heading
// marks removed (the page shows plain text).
export function answerText(json) {
  const parts = json?.candidates?.[0]?.content?.parts || [];
  return parts.filter(p => typeof p.text === 'string' && !p.thought).map(p => p.text).join('')
    .replace(/\*\*/g, '').replace(/^#{1,6}\s*/gm, '').trim();
}

// What went wrong, as one of: key, region, quota, busy, model, other.
export function problemKind(status, json) {
  const e = json?.error || {};
  const text = `${e.status || ''} ${e.message || ''} ${JSON.stringify(e.details || '')}`;
  if (/location is not supported|not available in your country|FAILED_PRECONDITION/i.test(text)) return 'region';
  if (/API_KEY_INVALID|API key not valid|API key expired|invalid api key/i.test(text) || status === 401 || status === 403) return 'key';
  if (status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(text)) return 'quota';
  if (status === 404 || /not found for API version|is not supported for generateContent|NOT_FOUND/i.test(text)) return 'model';
  if (status >= 500) return 'busy';
  return 'other';
}

// Returns { ok: true, text, model } or { ok: false, kind, status?, detail }.
// kind: key, region, quota, busy, model, blocked, network, timeout, other.
export async function askGemini({ prompt, key, fetchImpl = (...a) => globalThis.fetch(...a), models = GEMINI_MODELS, timeoutMs = TIMEOUT_MS }) {
  let last = { ok: false, kind: 'other', detail: 'no model tried' };
  for (const model of models) {
    const { url, init } = geminiRequest(model, key, prompt);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let res, json;
    try {
      res = await fetchImpl(url, { ...init, signal: controller.signal });
      json = await res.json().catch(() => null);
    } catch (e) {
      return { ok: false, kind: e?.name === 'AbortError' ? 'timeout' : 'network', detail: String(e?.message || e) };
    } finally {
      clearTimeout(timer);
    }
    if (res.ok) {
      const text = answerText(json);
      if (text) return { ok: true, text, model: json?.modelVersion || model };
      return { ok: false, kind: 'blocked', detail: json?.promptFeedback?.blockReason || json?.candidates?.[0]?.finishReason || 'empty answer' };
    }
    last = { ok: false, kind: problemKind(res.status, json), status: res.status, detail: json?.error?.message || '' };
    if (!['model', 'quota', 'busy'].includes(last.kind)) return last; // the next model would fail the same way
  }
  return last;
}
