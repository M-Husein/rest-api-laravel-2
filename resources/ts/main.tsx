import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import './i18n'; // locale
import { getDeviceId } from '@/utils/browser';

// import "@refinedev/antd/dist/reset.css";
import "./style/style.scss";

getDeviceId();

console.log( // import.meta.env.VITE_APP_NAME
  `%c@ ${new Date().getFullYear()} ${APP.name}`, // Made with ❤️
  'color:#777;text-shadow:1px 1px 0 #A0E7FE,2px 2px 1px rgba(0,0,0,.3);font-family:Arial;letter-spacing:2px;font-size:25px;font-weight:700'
);
// console.log('React version:', React.version);

createRoot(document.getElementById("app") as HTMLElement)
  .render(
    // <React.StrictMode>
      <React.Suspense fallback="">
        <App />
      </React.Suspense>
    // </React.StrictMode>
  );
