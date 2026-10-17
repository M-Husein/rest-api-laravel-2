import { z } from "zod";

const error = (i18n: any) => {
  const toHave = i18n.t('v.toHave');
  const items = i18n.t('v.items');

  const Sizable: any = {
    string: { unit: i18n.t('v.char'), verb: toHave },
    file: { unit: i18n.t('v.bytes'), verb: toHave },
    array: { unit: items, verb: toHave },
    set: { unit: items, verb: toHave },
  };

  const Nouns: any = {
    regex: "input",
    email: i18n.t('v.email'),
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: i18n.t('v.datetime'),
    date: i18n.t('v.date'),
    time: i18n.t('v.time'),
    duration: i18n.t('v.duration'),
    ipv4: i18n.t('v.ipv4'),
    ipv6: i18n.t('v.ipv6'),
    cidrv4: i18n.t('v.cidrv4'),
    cidrv6: i18n.t('v.cidrv6'),
    base64: i18n.t('v.base64'),
    base64url: i18n.t('v.base64url'),
    json_string: i18n.t('v.json_string'),
    e164: i18n.t('v.e164'),
    jwt: "JWT",
    template_literal: "input",
  };

  return (issue: any) => {
    switch (issue.code) {
      case "invalid_type":
        return i18n.t('error.required');

      case "invalid_value":
        if (issue.values.length === 1) {
          return i18n.t('v.invalid_input', { v: stringifyPrimitive(issue.values[0]) });
        }
        return i18n.t('v.invalid_option', { v: joinValues(issue.values, "|") });

      case "too_big": {
        const adj = issue.inclusive ? "<=" : "<";
        const sizing = Sizable[issue.origin] ?? null;

        const sameValue: any = {
          e: issue.origin ?? "value",
          v: adj + issue.maximum.toString(),
        };

        if (sizing) {
          return i18n.t('v.too_big1', {
            ...sameValue,
            u: sizing.unit ?? "elements"
          }) as string;
        }
        return i18n.t('v.too_big2', sameValue) as string;
      }

      case "too_small":
        return i18n.t('error.minLength', { v: issue.minimum });

      case "invalid_format": {
        const _issue = issue;
        if (_issue.format === "starts_with") {
          return i18n.t('v.invalid_format.starts_with', { v: _issue.prefix });
        }
        if (_issue.format === "ends_with") {
          return i18n.t('v.invalid_format.ends_with', { v: _issue.suffix });
        }
        if (_issue.format === "includes") {
          return i18n.t('v.invalid_format.includes', { v: _issue.includes });
        }
        if (_issue.format === "regex") {
          return i18n.t('v.invalid_format.regex', { v: _issue.pattern });
        }

        return `Invalid ${Nouns[_issue.format] ?? issue.format}`;
      }

      case "not_multiple_of":
        return i18n.t('v.not_multiple_of', { v: issue.divisor });

      case "unrecognized_keys":
        return i18n.t('v.unrecognized_keys', { v: joinValues(issue.keys, ", ") });

      case "invalid_key":
        return i18n.t('v.invalid_key', { v: issue.origin });

      case "invalid_element":
        return i18n.t('v.invalid_element', { v: issue.origin });

      default:
        return i18n.t('v.invalid_union');
    }
  };
};

const stringifyPrimitive = (value: any) => {
  if (typeof value === "bigint") {
    return value.toString() + "n";
  }
  if (typeof value === "string") {
    return `"${value}"`;
  }
  return `${value}`;
}

const joinValues = (array: any[], separator = "|") => {
  return array.map(stringifyPrimitive).join(separator);
}

export const zodConfig = (i18n: any) => z.config({
  localeError: error(i18n)
});
