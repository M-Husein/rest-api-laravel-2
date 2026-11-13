/**
 * Static per-language display metadata for the frontend runtime.
 *
 * This intentionally does NOT contain translation strings (those live in
 * language_lines via i18n) and does NOT reference antd/dayjs locale files.
 * `direction` drives `document.dir` (rtl for Arabic); `weekStart` drives the
 * custom dayjs locale (0 = Sunday, 1 = Monday).
 *
 * Unknown codes fall back to ltr + Monday.
 */
export interface LocaleMeta {
  direction: 'ltr' | 'rtl';
  weekStart: 0 | 1;
  /** Whether antd pickers show the month before the year. Mirrors the official antd locales. */
  monthBeforeYear: boolean;
}

const META: Record<string, LocaleMeta> = {
  en: { direction: 'ltr', weekStart: 0, monthBeforeYear: true },
  id: { direction: 'ltr', weekStart: 1, monthBeforeYear: true },
  zh: { direction: 'ltr', weekStart: 1, monthBeforeYear: false },
  ar: { direction: 'rtl', weekStart: 0, monthBeforeYear: true },
  es: { direction: 'ltr', weekStart: 1, monthBeforeYear: true },
  fr: { direction: 'ltr', weekStart: 1, monthBeforeYear: true },
  de: { direction: 'ltr', weekStart: 1, monthBeforeYear: true },
  ru: { direction: 'ltr', weekStart: 1, monthBeforeYear: true },
  it: { direction: 'ltr', weekStart: 1, monthBeforeYear: true },
  pt: { direction: 'ltr', weekStart: 1, monthBeforeYear: false },
  ja: { direction: 'ltr', weekStart: 0, monthBeforeYear: false },
  ko: { direction: 'ltr', weekStart: 0, monthBeforeYear: false },
  hi: { direction: 'ltr', weekStart: 1, monthBeforeYear: true },
  vi: { direction: 'ltr', weekStart: 1, monthBeforeYear: true },
  th: { direction: 'ltr', weekStart: 1, monthBeforeYear: true },
  ms: { direction: 'ltr', weekStart: 1, monthBeforeYear: false },
};

const FALLBACK: LocaleMeta = { direction: 'ltr', weekStart: 1, monthBeforeYear: true };

export const getLocaleMeta = (lang: string): LocaleMeta =>
  META[lang.split('-')[0]] ?? FALLBACK;

export const getLocaleDirection = (lang: string): 'ltr' | 'rtl' =>
  getLocaleMeta(lang).direction;
