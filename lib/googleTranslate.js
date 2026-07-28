/**
 * Free Google Translate (unofficial gtx client) — server-side only.
 * Cached responses live in the client via localStorage.
 */

const ENDPOINT = "https://translate.googleapis.com/translate_a/single";

/**
 * @param {string} text
 * @param {string} targetLang
 * @param {string} [sourceLang="en"]
 */
export async function translateWithGoogle(text, targetLang, sourceLang = "en") {
  if (!text?.trim()) return text;
  if (!targetLang || targetLang === sourceLang) return text;

  const params = new URLSearchParams({
    client: "gtx",
    sl: sourceLang,
    tl: targetLang,
    dt: "t",
    q: text,
  });

  const response = await fetch(`${ENDPOINT}?${params.toString()}`, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Translate failed (${response.status})`);
  }

  const data = await response.json();
  // Response shape: [[["translated","original",...],...], ...]
  const translated = Array.isArray(data?.[0])
    ? data[0].map((part) => part?.[0] ?? "").join("")
    : text;

  return translated || text;
}

/**
 * Translate many strings with a small concurrency limit.
 * @param {string[]} texts
 * @param {string} targetLang
 * @param {string} [sourceLang="en"]
 */
export async function translateMany(texts, targetLang, sourceLang = "en") {
  const unique = [...new Set(texts.filter(Boolean))];
  const result = {};

  if (!targetLang || targetLang === sourceLang) {
    unique.forEach((text) => {
      result[text] = text;
    });
    return result;
  }

  const concurrency = 12;
  let index = 0;

  async function worker() {
    while (index < unique.length) {
      const current = unique[index];
      index += 1;
      try {
        result[current] = await translateWithGoogle(
          current,
          targetLang,
          sourceLang
        );
      } catch {
        result[current] = current;
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, unique.length) }, () => worker())
  );

  return result;
}
