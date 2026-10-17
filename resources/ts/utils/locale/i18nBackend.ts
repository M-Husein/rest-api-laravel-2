import ky, { KyInstance, Options as KyOptions } from 'ky';
import type { Services, InitOptions, BackendModule } from 'i18next';
import { retryOnServerErrors } from '@/providers/dataProvider';
import { getCurrentLang } from '@/utils/browser';

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
  // private defaultLanguage: string;
  private initialLanguage: string; // 👈 store the initial language

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
    // this.defaultLanguage = APP.defaultLang;
    // Store the language used at initialization
    this.initialLanguage = i18nextOptions.lng || getCurrentLang() || APP.defaultLang;
  }

  init(
    _services: Services,
    options: i18nBackendOptions,
    i18nextOptions: InitOptions
  ): void {
    this.options = { ...this.options, ...options };
    this.i18nextOptions = i18nextOptions;

    // // Update initial language in case it changes (shouldn't, but safe)
    // if (i18nextOptions.lng) {
    //   this.initialLanguage = i18nextOptions.lng;
    // }
  }

  read(
    language: string,
    namespace: string,
    callback?: (error: Error | null, result: any) => void
  ): void {
    const page = (window as any).__APP__.page;
    // const shouldHydrate = language === this.defaultLanguage;

    // const pageKey = page?.key;
    const content = page?.content;

    // Only use hydration if the requested language matches the initial language
    // const isHydratedPage = 

    // console.log('page:', page);
    // console.log('namespace:', namespace);
    // console.log('language:', language);
    // console.log('this.initialLanguage:', this.initialLanguage);

    if (
      namespace !== 'common' &&
      // pageKey === window.location.pathname.split('/').at(-1) &&
      page?.key === namespace &&
      content && typeof content === 'object' &&
      language === this.initialLanguage // 👈 key guard
    ) {
      callback?.(null, content);
      return;
    }

    // // Hydrate from window.__APP__ if available
    // if (app) { // shouldHydrate && 
    //   // if (namespace === 'common' && app.common) {
    //   //   callback?.(null, app.common);
    //   //   return;
    //   // }
    //   if (namespace !== 'common' && app.page?.props?.key && app.page.props.key === namespace) {
    //     callback?.(null, app.page.props.content);
    //     return;
    //   }
    // }

    this.kyInstance(
      // Fallback to network request
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
        // 🔥 ALWAYS return success with empty object – never pass an error
        callback?.(null, {});
      });
  }
}
