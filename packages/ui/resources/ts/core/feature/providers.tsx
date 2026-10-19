import type { FC, PropsWithChildren, ReactNode } from 'react';

export const composeProviders = (
  providers: FC<PropsWithChildren>[],
  children: ReactNode
): ReactNode =>
  providers.reduceRight<ReactNode>(
    (nested, Provider) => <Provider>{nested}</Provider>,
    children
  );
