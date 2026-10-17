import ky, { KyInstance, Options as KyOptions } from 'ky';
import type { Services, InitOptions, BackendModule } from 'i18next';
import { retryOnServerErrors } from '@/providers/dataProvider';
import { getCurrentLang } from './url';

export interface i18nBackendOptions {
  commonEndpoint?: string;
  pageEndpoint?: string;
  kyOptions?: KyOptions;
}

export class i18nBackend implements BackendModule<i18nBackendOptions> {
  static type = 'backend' as const;
  type = 'backend' as const;
  options: i18nBackendOptions;
  private kyInstance: KyInstance;
  private i18nextOptions: InitOptions;
  private initialLanguage: string;

  constructor(
    _services: Services,
    options: i18nBackendOptions = {},
    i18nextOptions: InitOptions = {}
  ) {
    this.options = {
      commonEndpoint: APP.api + "/locales/{{lng}}/common",
      pageEndpoint: APP.api + "/locales/{{lng}}/page/{{ns}}",
      ...options
    };
    this.i18nextOptions = i18nextOptions;
    this.kyInstance = ky.extend(this.options.kyOptions || {});
    this.initialLanguage = i18nextOptions.lng || getCurrentLang() || APP.defaultLang;
  }

  init(
    _services: Services,
    options: i18nBackendOptions,
    i18nextOptions: InitOptions
  ): void {
    this.options = { ...this.options, ...options };
    this.i18nextOptions = i18nextOptions;
  }

  read(
    language: string,
    namespace: string,
    callback?: (error: Error | null, result: any) => void
  ): void {
    const page = (window as any).__APP__.page;
    const content = page?.content;

    if (
      namespace !== 'common' &&
      page?.key === namespace &&
      content && typeof content === 'object' &&
      language === this.initialLanguage
    ) {
      callback?.(null, content);
      return;
    }

    this.kyInstance(
      namespace === 'common'
        ? this.options.commonEndpoint!.replace('{{lng}}', language)
        : this.options.pageEndpoint!
          .replace('{{lng}}', language)
          .replace('{{ns}}', namespace),
      {
        retry: retryOnServerErrors,
        headers: {
          'Accept-Language': this.initialLanguage
        }
      }
    )
      .json<any>()
      .then(res => {
        callback?.(null, res?.data);
      })
      .catch(err => {
        console.error(`Failed to load namespace "${namespace}" for language "${language}"`, err);
        callback?.(null, {});
      });
  }
}
