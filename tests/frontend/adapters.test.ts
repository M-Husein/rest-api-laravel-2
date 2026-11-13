import { beforeAll, describe, expect, test } from 'vitest';
import i18next from 'i18next';
import dayjs from 'dayjs';
import { buildAntdLocale } from '../../packages/ui/resources/ts/i18n/antdAdapter';
import { applyDayjsLocale } from '../../packages/ui/resources/ts/i18n/dayjsAdapter';
import { getLocaleDirection, getLocaleMeta } from '../../packages/ui/resources/ts/i18n/localeMeta';

beforeAll(async () => {
  await i18next.init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    resources: {
      en: {
        common: {
          antd: { Table: { filterTitle: 'Filter menu' } },
          calendar: {
            formats: { L: 'MM/DD/YYYY' },
            relativeTime: { future: 'in %s' },
          },
        },
      },
      id: {
        common: {
          antd: { Table: { filterTitle: 'Menu filter' } },
          calendar: {
            formats: { L: 'DD/MM/YYYY' },
            relativeTime: { future: 'dalam %s' },
          },
        },
      },
    },
  });
});

describe('localeMeta', () => {
  test('arabic is rtl, others ltr', () => {
    expect(getLocaleDirection('ar')).toBe('rtl');
    expect(getLocaleDirection('id')).toBe('ltr');
  });

  test('unknown codes fall back to ltr + monday start', () => {
    expect(getLocaleMeta('xx')).toEqual({ direction: 'ltr', weekStart: 1, monthBeforeYear: true });
  });

  test('week starts differ per locale', () => {
    expect(getLocaleMeta('en').weekStart).toBe(0);
    expect(getLocaleMeta('id').weekStart).toBe(1);
  });
});

describe('buildAntdLocale', () => {
  test('uses translated strings when available', () => {
    const locale = buildAntdLocale('id');
    expect(locale.Table?.filterTitle).toBe('Menu filter');
  });

  test('falls back to English defaults for untranslated languages', () => {
    const locale = buildAntdLocale('ms');
    expect(locale.Table?.filterTitle).toBe('Filter menu');
  });

  test('reads monthBeforeYear from static meta, not translations', () => {
    expect(buildAntdLocale('pt').DatePicker?.lang?.monthBeforeYear).toBe(false);
    expect(buildAntdLocale('en').DatePicker?.lang?.monthBeforeYear).toBe(true);
  });
});

describe('applyDayjsLocale', () => {
  test('uses Indonesian month names and Monday week start', () => {
    applyDayjsLocale('id');
    expect(dayjs('2024-01-15').format('MMMM')).toBe('Januari');
    expect(dayjs('2024-01-07').startOf('week').format('YYYY-MM-DD')).toBe('2024-01-01');
  });

  test('falls back to English formats when untranslated', () => {
    applyDayjsLocale('ms');
    expect(dayjs('2024-01-15').format('L')).toBe('01/15/2024');
  });

  test('activates the requested locale', () => {
    applyDayjsLocale('id');
    expect(dayjs.locale()).toBe('id');
  });
});
