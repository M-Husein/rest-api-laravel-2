import dayjs from 'dayjs';
import type { OpUnitType } from 'dayjs';

export const formatHuman = (
  timestamp: string, 
  prefixWord: string = 'Tanggal dibuat'
) => {
  const now = dayjs();
  const diff = now.diff(dayjs(timestamp), 'day');

  if (diff === 0) return prefixWord + ' hari ini';
  if (diff === 1) return prefixWord + ' 1 hari yang lalu';
  if (diff > 1) return `${prefixWord} ${diff} hari yang lalu`;
  return `${prefixWord} ${Math.abs(diff)} hari lagi`; // future
};

export const formatDuration = (totalSeconds: number): string => { //  | undefined
  if(totalSeconds == null) return '';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];

  if (hours > 0) parts.push(`${hours} Jam`);
  if (minutes > 0) parts.push(`${minutes} Menit`);
  if (seconds > 0) parts.push(`${seconds} detik`);

  return parts.length ? parts.join(' ') : '0 detik';
};

// formatDuration with support locale

// const formatDuration2 = (
//   totalSeconds: number,
//   labels: { h: string; m: string; s: string; z: string } = {
//     h: 'Jam', // hour
//     m: 'Menit', // minute
//     s: 'detik', // second
//     z: '0 detik', // zero
//   }
// ): string => {
//   const hours = Math.floor(totalSeconds / 3600);
//   const minutes = Math.floor((totalSeconds % 3600) / 60);
//   const seconds = totalSeconds % 60;

//   const parts: string[] = [];
//   if (hours > 0) parts.push(`${hours} ${labels.h}`);
//   if (minutes > 0) parts.push(`${minutes} ${labels.m}`);
//   if (seconds > 0) parts.push(`${seconds} ${labels.s}`);

//   return parts.length ? parts.join(' ') : labels.z;
// };

// // Usage
// formatDuration2(105); // "1 Menit 45 detik" (default Indonesian)
// formatDuration2(105, { h: 'h', m: 'm', s: 's', z: '0s' }); // "1 m 45 s"

/**
 * Define Your Translation Files
 * locales/en/common.json
 * {
    "duration": {
      "hour": "{{count}} hour",
      "hour_plural": "{{count}} hours",
      "minute": "{{count}} minute",
      "minute_plural": "{{count}} minutes",
      "second": "{{count}} second",
      "second_plural": "{{count}} seconds",
      "zero": "0 seconds"
    }
  }

  * locales/id/common.json
  * {
    "duration": {
      "hour": "{{count}} Jam",
      "minute": "{{count}} Menit",
      "second": "{{count}} detik",
      "zero": "0 detik"
    }
  }
 */
// import i18n from "@/i18n";

// export const formatDuration3 = (totalSeconds: number): string => {
//   // Calculate hours, minutes, seconds
//   const hours = Math.floor(totalSeconds / 3600);
//   const minutes = Math.floor((totalSeconds % 3600) / 60);
//   const seconds = totalSeconds % 60;

//   const parts: string[] = [];

//   if (hours > 0) {
//     parts.push(i18n.t('duration.hour', { count: hours }));
//   }
//   if (minutes > 0) {
//     parts.push(i18n.t('duration.minute', { count: minutes }));
//   }
//   if (seconds > 0) {
//     parts.push(i18n.t('duration.second', { count: seconds }));
//   }

//   return parts.length ? parts.join(' ') : i18n.t('duration.zero');
// };

/**
 * Maps a Day.js format string to a corresponding granularity unit for date comparison.
 *
 * This function is used internally by the table filter system to determine
 * how precisely two dates should be compared when applying client‑side filters.
 * It parses the format string and returns the most appropriate Day.js unit.
 *
 * The detection order is:
 * 1. Time components first (second > minute > hour) – most specific
 * 2. Date components next (day > month > year) – less specific
 * 3. Defaults to `'day'` if no known tokens are found.
 *
 * @param {string} format - The Day.js format string (e.g., 'DD MMMM YYYY, HH:mm').
 *                          Supports single and plural tokens like D/DD, M/MM/MMM/MMMM, YY/YYYY.
 * @returns {OpUnitType} The comparison unit:
 *                         - `'second'`  – if format includes 'ss'
 *                         - `'minute'`  – if format includes 'mm'
 *                         - `'hour'`    – if format includes 'HH' or 'hh' (case‑insensitive)
 *                         - `'day'`     – if format includes 'D'
 *                         - `'month'`   – if format includes 'M'
 *                         - `'year'`    – if format includes 'Y'
 *                         - `'day'`     – fallback if none of the above match
 *
 * @example
 * // Time-based granularities
 * getGranularity('DD MMMM YYYY, HH:mm'); // 'minute'
 * getGranularity('HH:mm:ss');            // 'second'
 * getGranularity('DD/MM/YYYY HH:00');    // 'hour' (since HH is present)
 *
 * @example
 * // Date-based granularities (single and double tokens)
 * getGranularity('D MMMM YYYY');        // 'day'
 * getGranularity('DD MMMM YYYY');       // 'day'
 * getGranularity('MMMM YYYY');          // 'month' (no 'D' found, but 'M' is present)
 * getGranularity('YYYY');               // 'year'  (only 'Y' found)
 *
 * @example
 * // Fallback scenario
 * getGranularity('');                   // 'day' (default fallback)
 * getGranularity('Custom Token XYZ');   // 'day' (no known tokens)
 *
 * @see {@link https://day.js.org/docs/en/display/format} for Day.js format tokens
 */
export const getGranularity = (format: string): OpUnitType => {
  // console.log('getGranularity format:', format);

  if (!format) return 'day';

  // 1. Time components (most specific first)
  if (format.includes('ss')) return 'second';
  if (format.includes('mm')) return 'minute';
  
  if (/hh/i.test(format)) return 'hour'; // ✅ Handles HH and hh
  /**
   * @OR
   */
  // if (format.includes('HH') || format.includes('hh')) return 'hour';

  // 2. Date components
  if (format.includes('D')) return 'day';   // Matches 'D' or 'DD'
  if (format.includes('M')) return 'month'; // Matches 'M', 'MM', 'MMM', 'MMMM'
  if (format.includes('Y')) return 'year';  // Matches 'YY' or 'YYYY'

  return 'day';
};
