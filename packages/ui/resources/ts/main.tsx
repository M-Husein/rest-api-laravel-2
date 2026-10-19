import React from "react";
import { createRoot } from "react-dom/client";
import './features.generated';
import '@/utils/user';
import './i18n';
import { bootstrap } from './app/bootstrap';
import { PublicApp } from './app/PublicApp';

bootstrap();

createRoot(document.getElementById("app") as HTMLElement)
  .render(
    <React.Suspense fallback="">
      <PublicApp />
    </React.Suspense>
  );
