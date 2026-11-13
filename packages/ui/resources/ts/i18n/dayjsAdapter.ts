import dayjs from 'dayjs';
import i18next from 'i18next';
import { getLocaleMeta } from './localeMeta';

/**
 * Applies a custom dayjs locale built from OUR translation keys plus the
 * native Intl API — mirroring validation.ts, which maps zod codes to i18n
 * keys instead of importing zod locale files.
 *
 * - Month/weekday names come from `Intl.DateTimeFormat` (always correct,
 *   zero maintenance) instead of `dayjs/locale/*`.
 * - Formats + relativeTime come from `calendar.*` keys with English defaults,
 *   so new languages fall back to English until translated.
 * - Ordinal/meridiem are tiny per-language functions (ported from the
 *   official dayjs locales where non-trivial).
 *
 * No `dayjs/locale/*` module is ever imported at runtime.
 */

type OrdinalFn = (n: number, period?: string) => string;

const ordinals: Record<string, OrdinalFn> = {
  en: (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  },
  id: (n) => `${n}.`,
  ms: (n) => `${n}.`,
  th: (n) => `${n}.`,
  de: (n) => `${n}.`,
  fr: (n) => `${n}${n === 1 ? 'er' : ''}`,
  es: (n) => `${n}º`,
  it: (n) => `${n}º`,
  pt: (n) => `${n}º`,
  ja: (n) => `${n}日`,
  ko: (n) => `${n}일`,
  zh: (n, period) => (period === 'W' ? `${n}周` : `${n}日`),
  ar: (n) => `${n}`,
  ru: (n) => `${n}`,
  vi: (n) => `${n}`,
  hi: (n) => `${n}`,
};

const meridiems: Record<string, (hour: number, minute: number) => string> = {
  zh: (hour, minute) => {
    const t = hour * 100 + minute;
    if (t < 600) return '凌晨';
    if (t < 900) return '早上';
    if (t < 1100) return '上午';
    if (t < 1300) return '中午';
    if (t < 1800) return '下午';
    return '晚上';
  },
  ja: (hour) => (hour < 12 ? '午前' : '午後'),
  ko: (hour) => (hour < 12 ? '오전' : '오후'),
  ar: (hour) => (hour > 12 ? 'م' : 'ص'),
};

const partNames = (
  lang: string,
  part: 'month' | 'weekday',
  width: 'long' | 'short' | 'narrow'
): string[] => {
  try {
    if (part === 'month') {
      return Array.from({ length: 12 }, (_, m) =>
        new Intl.DateTimeFormat(lang, { month: width }).format(new Date(2024, m, 15))
      );
    }
    // 2024-01-07 was a Sunday; dayjs weekdays start on Sunday.
    return Array.from({ length: 7 }, (_, d) =>
      new Intl.DateTimeFormat(lang, { weekday: width }).format(new Date(2024, 0, 7 + d))
    );
  } catch {
    return part === 'month'
      ? Array.from({ length: 12 }, (_, m) =>
          new Intl.DateTimeFormat('en', { month: width }).format(new Date(2024, m, 15))
        )
      : Array.from({ length: 7 }, (_, d) =>
          new Intl.DateTimeFormat('en', { weekday: width }).format(new Date(2024, 0, 7 + d))
        );
  }
};

export const applyDayjsLocale = (language: string): void => {
  const lang = language.split('-')[0];
  const meta = getLocaleMeta(lang);
  const t = (key: string, fallback: string): string =>
    i18next.t(key, { lng: lang, defaultValue: fallback }) as unknown as string;

  dayjs.locale({
      name: lang,
      weekdays: partNames(lang, 'weekday', 'long'),
      weekdaysShort: partNames(lang, 'weekday', 'short'),
      weekdaysMin: partNames(lang, 'weekday', 'narrow'),
      months: partNames(lang, 'month', 'long'),
      monthsShort: partNames(lang, 'month', 'short'),
      weekStart: meta.weekStart,
      ordinal: ordinals[lang] ?? ((n: number) => `${n}`),
      ...(meridiems[lang] !== undefined ? { meridiem: meridiems[lang] } : {}),
      formats: {
        LT: t('calendar.formats.LT', 'h:mm A'),
        LTS: t('calendar.formats.LTS', 'h:mm:ss A'),
        L: t('calendar.formats.L', 'MM/DD/YYYY'),
        LL: t('calendar.formats.LL', 'MMMM D, YYYY'),
        LLL: t('calendar.formats.LLL', 'MMMM D, YYYY h:mm A'),
        LLLL: t('calendar.formats.LLLL', 'dddd, MMMM D, YYYY h:mm A'),
      },
      relativeTime: {
        future: t('calendar.relativeTime.future', 'in %s'),
        past: t('calendar.relativeTime.past', '%s ago'),
        s: t('calendar.relativeTime.s', 'a few seconds'),
        m: t('calendar.relativeTime.m', 'a minute'),
        mm: t('calendar.relativeTime.mm', '%d minutes'),
        h: t('calendar.relativeTime.h', 'an hour'),
        hh: t('calendar.relativeTime.hh', '%d hours'),
        d: t('calendar.relativeTime.d', 'a day'),
        dd: t('calendar.relativeTime.dd', '%d days'),
        M: t('calendar.relativeTime.M', 'a month'),
        MM: t('calendar.relativeTime.MM', '%d months'),
        y: t('calendar.relativeTime.y', 'a year'),
        yy: t('calendar.relativeTime.yy', '%d years'),
      },
  });
};
