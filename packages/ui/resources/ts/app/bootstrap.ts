import '@/style/style.scss';
import { getDeviceId } from '@/utils/browser';

export const bootstrap = () => {
  getDeviceId();

  console.log(
    `%c@ ${new Date().getFullYear()} ${APP.name}`,
    'color:#777;text-shadow:1px 1px 0 #A0E7FE,2px 2px 1px rgba(0,0,0,.3);font-family:Arial;letter-spacing:2px;font-size:25px;font-weight:700'
  );
};
