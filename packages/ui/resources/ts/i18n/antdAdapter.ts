import type { Locale } from 'antd/es/locale';
import i18next from 'i18next';
import { getLocaleMeta } from './localeMeta';

/**
 * Builds the antd {@link Locale} object from OUR translation keys
 * (language_lines group `common`, prefix `antd.`), mirroring validation.ts
 * which maps zod codes to i18n keys instead of importing zod locales.
 *
 * Missing keys fall back to the English defaultValue, so new languages
 * work immediately without antd shipping their locale file. No
 * `antd/es/locale/*` module is ever imported at runtime.
 */
export const buildAntdLocale = (lang: string): Locale => {
  const t = (key: string, fallback: string): string =>
    i18next.t(key, { lng: lang, defaultValue: fallback }) as unknown as string;

  return {
    Calendar: {
      lang: {
        backToToday: t("antd.Calendar.lang.backToToday", "Back to today"),
        cellMeridiemFormat: t("antd.Calendar.lang.cellMeridiemFormat", "A"),
        clear: t("antd.Calendar.lang.clear", "Clear"),
        dateSelect: t("antd.Calendar.lang.dateSelect", "select date"),
        dayFormat: t("antd.Calendar.lang.dayFormat", "D"),
        decadeSelect: t("antd.Calendar.lang.decadeSelect", "Choose a decade"),
        locale: t("antd.Calendar.lang.locale", "en_US"),
        month: t("antd.Calendar.lang.month", "Month"),
        monthBeforeYear: getLocaleMeta(lang).monthBeforeYear,
        monthPlaceholder: t("antd.Calendar.lang.monthPlaceholder", "Select month"),
        monthSelect: t("antd.Calendar.lang.monthSelect", "Choose a month"),
        nextCentury: t("antd.Calendar.lang.nextCentury", "Next century"),
        nextDecade: t("antd.Calendar.lang.nextDecade", "Next decade"),
        nextMonth: t("antd.Calendar.lang.nextMonth", "Next month"),
        nextYear: t("antd.Calendar.lang.nextYear", "Next year"),
        now: t("antd.Calendar.lang.now", "Now"),
        ok: t("antd.Calendar.lang.ok", "OK"),
        placeholder: t("antd.Calendar.lang.placeholder", "Select date"),
        previousCentury: t("antd.Calendar.lang.previousCentury", "Last century"),
        previousDecade: t("antd.Calendar.lang.previousDecade", "Last decade"),
        previousMonth: t("antd.Calendar.lang.previousMonth", "Previous month"),
        previousYear: t("antd.Calendar.lang.previousYear", "Last year"),
        quarterPlaceholder: t("antd.Calendar.lang.quarterPlaceholder", "Select quarter"),
        rangeMonthPlaceholder: [
          t("antd.Calendar.lang.rangeMonthPlaceholder.0", "Start month"),
          t("antd.Calendar.lang.rangeMonthPlaceholder.1", "End month"),
        ],
        rangePlaceholder: [
          t("antd.Calendar.lang.rangePlaceholder.0", "Start date"),
          t("antd.Calendar.lang.rangePlaceholder.1", "End date"),
        ],
        rangeQuarterPlaceholder: [
          t("antd.Calendar.lang.rangeQuarterPlaceholder.0", "Start quarter"),
          t("antd.Calendar.lang.rangeQuarterPlaceholder.1", "End quarter"),
        ],
        rangeWeekPlaceholder: [
          t("antd.Calendar.lang.rangeWeekPlaceholder.0", "Start week"),
          t("antd.Calendar.lang.rangeWeekPlaceholder.1", "End week"),
        ],
        rangeYearPlaceholder: [
          t("antd.Calendar.lang.rangeYearPlaceholder.0", "Start year"),
          t("antd.Calendar.lang.rangeYearPlaceholder.1", "End year"),
        ],
        timeSelect: t("antd.Calendar.lang.timeSelect", "select time"),
        today: t("antd.Calendar.lang.today", "Today"),
        week: t("antd.Calendar.lang.week", "Week"),
        weekPlaceholder: t("antd.Calendar.lang.weekPlaceholder", "Select week"),
        weekSelect: t("antd.Calendar.lang.weekSelect", "Choose a week"),
        year: t("antd.Calendar.lang.year", "Year"),
        yearFormat: t("antd.Calendar.lang.yearFormat", "YYYY"),
        yearPlaceholder: t("antd.Calendar.lang.yearPlaceholder", "Select year"),
        yearSelect: t("antd.Calendar.lang.yearSelect", "Choose a year"),
      },
      timePickerLocale: {
        placeholder: t("antd.Calendar.timePickerLocale.placeholder", "Select time"),
        rangePlaceholder: [
          t("antd.Calendar.timePickerLocale.rangePlaceholder.0", "Start time"),
          t("antd.Calendar.timePickerLocale.rangePlaceholder.1", "End time"),
        ],
      },
    },
    Carousel: {
      nextSlide: t("antd.Carousel.nextSlide", "Next slide"),
      prevSlide: t("antd.Carousel.prevSlide", "Previous slide"),
    },
    ColorPicker: {
      gradientColor: t("antd.ColorPicker.gradientColor", "Gradient"),
      presetEmpty: t("antd.ColorPicker.presetEmpty", "Empty"),
      singleColor: t("antd.ColorPicker.singleColor", "Single"),
      transparent: t("antd.ColorPicker.transparent", "Transparent"),
    },
    DatePicker: {
      lang: {
        backToToday: t("antd.DatePicker.lang.backToToday", "Back to today"),
        cellMeridiemFormat: t("antd.DatePicker.lang.cellMeridiemFormat", "A"),
        clear: t("antd.DatePicker.lang.clear", "Clear"),
        dateSelect: t("antd.DatePicker.lang.dateSelect", "select date"),
        dayFormat: t("antd.DatePicker.lang.dayFormat", "D"),
        decadeSelect: t("antd.DatePicker.lang.decadeSelect", "Choose a decade"),
        locale: t("antd.DatePicker.lang.locale", "en_US"),
        month: t("antd.DatePicker.lang.month", "Month"),
        monthBeforeYear: getLocaleMeta(lang).monthBeforeYear,
        monthPlaceholder: t("antd.DatePicker.lang.monthPlaceholder", "Select month"),
        monthSelect: t("antd.DatePicker.lang.monthSelect", "Choose a month"),
        nextCentury: t("antd.DatePicker.lang.nextCentury", "Next century"),
        nextDecade: t("antd.DatePicker.lang.nextDecade", "Next decade"),
        nextMonth: t("antd.DatePicker.lang.nextMonth", "Next month"),
        nextYear: t("antd.DatePicker.lang.nextYear", "Next year"),
        now: t("antd.DatePicker.lang.now", "Now"),
        ok: t("antd.DatePicker.lang.ok", "OK"),
        placeholder: t("antd.DatePicker.lang.placeholder", "Select date"),
        previousCentury: t("antd.DatePicker.lang.previousCentury", "Last century"),
        previousDecade: t("antd.DatePicker.lang.previousDecade", "Last decade"),
        previousMonth: t("antd.DatePicker.lang.previousMonth", "Previous month"),
        previousYear: t("antd.DatePicker.lang.previousYear", "Last year"),
        quarterPlaceholder: t("antd.DatePicker.lang.quarterPlaceholder", "Select quarter"),
        rangeMonthPlaceholder: [
          t("antd.DatePicker.lang.rangeMonthPlaceholder.0", "Start month"),
          t("antd.DatePicker.lang.rangeMonthPlaceholder.1", "End month"),
        ],
        rangePlaceholder: [
          t("antd.DatePicker.lang.rangePlaceholder.0", "Start date"),
          t("antd.DatePicker.lang.rangePlaceholder.1", "End date"),
        ],
        rangeQuarterPlaceholder: [
          t("antd.DatePicker.lang.rangeQuarterPlaceholder.0", "Start quarter"),
          t("antd.DatePicker.lang.rangeQuarterPlaceholder.1", "End quarter"),
        ],
        rangeWeekPlaceholder: [
          t("antd.DatePicker.lang.rangeWeekPlaceholder.0", "Start week"),
          t("antd.DatePicker.lang.rangeWeekPlaceholder.1", "End week"),
        ],
        rangeYearPlaceholder: [
          t("antd.DatePicker.lang.rangeYearPlaceholder.0", "Start year"),
          t("antd.DatePicker.lang.rangeYearPlaceholder.1", "End year"),
        ],
        timeSelect: t("antd.DatePicker.lang.timeSelect", "select time"),
        today: t("antd.DatePicker.lang.today", "Today"),
        week: t("antd.DatePicker.lang.week", "Week"),
        weekPlaceholder: t("antd.DatePicker.lang.weekPlaceholder", "Select week"),
        weekSelect: t("antd.DatePicker.lang.weekSelect", "Choose a week"),
        year: t("antd.DatePicker.lang.year", "Year"),
        yearFormat: t("antd.DatePicker.lang.yearFormat", "YYYY"),
        yearPlaceholder: t("antd.DatePicker.lang.yearPlaceholder", "Select year"),
        yearSelect: t("antd.DatePicker.lang.yearSelect", "Choose a year"),
      },
      timePickerLocale: {
        placeholder: t("antd.DatePicker.timePickerLocale.placeholder", "Select time"),
        rangePlaceholder: [
          t("antd.DatePicker.timePickerLocale.rangePlaceholder.0", "Start time"),
          t("antd.DatePicker.timePickerLocale.rangePlaceholder.1", "End time"),
        ],
      },
    },
    Empty: {
      description: t("antd.Empty.description", "No data"),
    },
    Form: {
      defaultValidateMessages: {
        array: {
          len: t("antd.Form.defaultValidateMessages.array.len", "Must be ${len} ${label}"),
          max: t("antd.Form.defaultValidateMessages.array.max", "At most ${max} ${label}"),
          min: t("antd.Form.defaultValidateMessages.array.min", "At least ${min} ${label}"),
          range: t("antd.Form.defaultValidateMessages.array.range", "The amount of ${label} must be between ${min}-${max}"),
        },
        date: {
          format: t("antd.Form.defaultValidateMessages.date.format", "${label} date format is invalid"),
          invalid: t("antd.Form.defaultValidateMessages.date.invalid", "${label} is an invalid date"),
          parse: t("antd.Form.defaultValidateMessages.date.parse", "${label} cannot be converted to a date"),
        },
        default: t("antd.Form.defaultValidateMessages.default", "Field validation error for ${label}"),
        enum: t("antd.Form.defaultValidateMessages.enum", "${label} must be one of [${enum}]"),
        number: {
          len: t("antd.Form.defaultValidateMessages.number.len", "${label} must be equal to ${len}"),
          max: t("antd.Form.defaultValidateMessages.number.max", "${label} must be maximum ${max}"),
          min: t("antd.Form.defaultValidateMessages.number.min", "${label} must be minimum ${min}"),
          range: t("antd.Form.defaultValidateMessages.number.range", "${label} must be between ${min}-${max}"),
        },
        pattern: {
          mismatch: t("antd.Form.defaultValidateMessages.pattern.mismatch", "${label} does not match the pattern ${pattern}"),
        },
        required: t("antd.Form.defaultValidateMessages.required", "Please enter ${label}"),
        string: {
          len: t("antd.Form.defaultValidateMessages.string.len", "${label} must be ${len} characters"),
          max: t("antd.Form.defaultValidateMessages.string.max", "${label} must be up to ${max} characters"),
          min: t("antd.Form.defaultValidateMessages.string.min", "${label} must be at least ${min} characters"),
          range: t("antd.Form.defaultValidateMessages.string.range", "${label} must be between ${min}-${max} characters"),
        },
        types: {
          array: t("antd.Form.defaultValidateMessages.types.array", "${label} is not a valid ${type}"),
          boolean: t("antd.Form.defaultValidateMessages.types.boolean", "${label} is not a valid ${type}"),
          date: t("antd.Form.defaultValidateMessages.types.date", "${label} is not a valid ${type}"),
          email: t("antd.Form.defaultValidateMessages.types.email", "${label} is not a valid ${type}"),
          float: t("antd.Form.defaultValidateMessages.types.float", "${label} is not a valid ${type}"),
          hex: t("antd.Form.defaultValidateMessages.types.hex", "${label} is not a valid ${type}"),
          integer: t("antd.Form.defaultValidateMessages.types.integer", "${label} is not a valid ${type}"),
          method: t("antd.Form.defaultValidateMessages.types.method", "${label} is not a valid ${type}"),
          number: t("antd.Form.defaultValidateMessages.types.number", "${label} is not a valid ${type}"),
          object: t("antd.Form.defaultValidateMessages.types.object", "${label} is not a valid ${type}"),
          regexp: t("antd.Form.defaultValidateMessages.types.regexp", "${label} is not a valid ${type}"),
          string: t("antd.Form.defaultValidateMessages.types.string", "${label} is not a valid ${type}"),
          url: t("antd.Form.defaultValidateMessages.types.url", "${label} is not a valid ${type}"),
        },
        whitespace: t("antd.Form.defaultValidateMessages.whitespace", "${label} cannot be a blank character"),
      },
      optional: t("antd.Form.optional", "(optional)"),
    },
    Icon: {
      icon: t("antd.Icon.icon", "icon"),
    },
    Modal: {
      cancelText: t("antd.Modal.cancelText", "Cancel"),
      justOkText: t("antd.Modal.justOkText", "OK"),
      okText: t("antd.Modal.okText", "OK"),
    },
    Pagination: {
      items_per_page: t("antd.Pagination.items_per_page", "/ page"),
      jump_to: t("antd.Pagination.jump_to", "Go to"),
      jump_to_confirm: t("antd.Pagination.jump_to_confirm", "confirm"),
      next_3: t("antd.Pagination.next_3", "Next 3 Pages"),
      next_5: t("antd.Pagination.next_5", "Next 5 Pages"),
      next_page: t("antd.Pagination.next_page", "Next Page"),
      page: t("antd.Pagination.page", "Page"),
      page_size: t("antd.Pagination.page_size", "Page Size"),
      prev_3: t("antd.Pagination.prev_3", "Previous 3 Pages"),
      prev_5: t("antd.Pagination.prev_5", "Previous 5 Pages"),
      prev_page: t("antd.Pagination.prev_page", "Previous Page"),
    },
    Popconfirm: {
      cancelText: t("antd.Popconfirm.cancelText", "Cancel"),
      okText: t("antd.Popconfirm.okText", "OK"),
    },
    QRCode: {
      expired: t("antd.QRCode.expired", "QR code expired"),
      refresh: t("antd.QRCode.refresh", "Refresh"),
      scanned: t("antd.QRCode.scanned", "Scanned"),
    },
    Table: {
      cancelSort: t("antd.Table.cancelSort", "Click to cancel sorting"),
      collapse: t("antd.Table.collapse", "Collapse row"),
      emptyText: t("antd.Table.emptyText", "No data"),
      expand: t("antd.Table.expand", "Expand row"),
      filterCheckAll: t("antd.Table.filterCheckAll", "Select all items"),
      filterConfirm: t("antd.Table.filterConfirm", "OK"),
      filterEmptyText: t("antd.Table.filterEmptyText", "No filters"),
      filterReset: t("antd.Table.filterReset", "Reset"),
      filterSearchPlaceholder: t("antd.Table.filterSearchPlaceholder", "Search in filters"),
      filterTitle: t("antd.Table.filterTitle", "Filter menu"),
      selectAll: t("antd.Table.selectAll", "Select current page"),
      selectInvert: t("antd.Table.selectInvert", "Invert current page"),
      selectNone: t("antd.Table.selectNone", "Clear all data"),
      selectionAll: t("antd.Table.selectionAll", "Select all data"),
      sortTitle: t("antd.Table.sortTitle", "Sort"),
      triggerAsc: t("antd.Table.triggerAsc", "Click to sort ascending"),
      triggerDesc: t("antd.Table.triggerDesc", "Click to sort descending"),
    },
    Text: {
      collapse: t("antd.Text.collapse", "Collapse"),
      copied: t("antd.Text.copied", "Copied"),
      copy: t("antd.Text.copy", "Copy"),
      edit: t("antd.Text.edit", "Edit"),
      expand: t("antd.Text.expand", "Expand"),
    },
    TimePicker: {
      placeholder: t("antd.TimePicker.placeholder", "Select time"),
      rangePlaceholder: [
        t("antd.TimePicker.rangePlaceholder.0", "Start time"),
        t("antd.TimePicker.rangePlaceholder.1", "End time"),
      ],
    },
    Tour: {
      Finish: t("antd.Tour.Finish", "Finish"),
      Next: t("antd.Tour.Next", "Next"),
      Previous: t("antd.Tour.Previous", "Previous"),
    },
    Transfer: {
      deselectAll: t("antd.Transfer.deselectAll", "Deselect all data"),
      itemUnit: t("antd.Transfer.itemUnit", "item"),
      itemsUnit: t("antd.Transfer.itemsUnit", "items"),
      remove: t("antd.Transfer.remove", "Remove"),
      removeAll: t("antd.Transfer.removeAll", "Remove all data"),
      removeCurrent: t("antd.Transfer.removeCurrent", "Remove current page"),
      searchPlaceholder: t("antd.Transfer.searchPlaceholder", "Search here"),
      selectAll: t("antd.Transfer.selectAll", "Select all data"),
      selectCurrent: t("antd.Transfer.selectCurrent", "Select current page"),
      selectInvert: t("antd.Transfer.selectInvert", "Invert current page"),
      titles: [
        t("antd.Transfer.titles.0", ""),
        t("antd.Transfer.titles.1", ""),
      ],
    },
    Upload: {
      downloadFile: t("antd.Upload.downloadFile", "Download file"),
      previewFile: t("antd.Upload.previewFile", "Preview file"),
      removeFile: t("antd.Upload.removeFile", "Remove file"),
      uploadError: t("antd.Upload.uploadError", "Upload error"),
      uploading: t("antd.Upload.uploading", "Uploading..."),
    },
    global: {
      close: t("antd.global.close", "Close"),
      hide: t("antd.global.hide", "Hide"),
      placeholder: t("antd.global.placeholder", "Please select"),
      show: t("antd.global.show", "Show"),
      sortable: t("antd.global.sortable", "sortable"),
    },
    locale: t("antd.locale", "en"),
  } as Locale;
};
