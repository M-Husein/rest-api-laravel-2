import { createContext, useContext } from 'react';
import type { FC, PropsWithChildren } from 'react';
import type { Locale } from 'antd/es/locale';

export interface AppLocaleValue {
  antdLocale?: Locale;
  ready: boolean;
}

export const AppLocaleContext = createContext<AppLocaleValue>({ ready: true });

export const AppLocaleProvider: FC<PropsWithChildren<{ value: AppLocaleValue }>> =
  ({ value, children }) => (
    <AppLocaleContext.Provider value={value}>
      {children}
    </AppLocaleContext.Provider>
  );

export const useAppLocale = (): AppLocaleValue => useContext(AppLocaleContext);
