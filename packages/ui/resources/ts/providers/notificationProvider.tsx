import { NotificationProvider } from "@refinedev/core";
import { App, notification as staticNotification } from "antd";

export const useNotificationProvider = (): NotificationProvider => {
  const { notification: notificationFromContext } = App.useApp();
  const notification = "open" in notificationFromContext ? notificationFromContext : staticNotification;

  return {
    open: ({
      key,
      message,
      description,
      type,
      
      // CUSTOM
      placement = "bottomLeft",
      // duration = 4.5,
      showProgress,
      ...etc
    }: any) => {
      // Don't show notification if request abort / cancel
      if(description === 'AbortError'){ //  || description === 'canceled'
        return;
      }

      // console.log('message: ', message);
      // console.log('description: ', description);
      // console.log('etc: ', etc);

      const isProgress = type === "progress";

      notification.open({
        key,
        // description: message,
        /** @DEV : Find other solution */
        description: message, // typeof message === 'string' ? message.split('&#x2F;')[0].replaceAll('-', ' ') : message,
        title: description ?? null,
        // type,
        type: isProgress ? void 0 : type as 'success' | 'info' | 'warning' | 'error', // (type as 'success' | 'info' | 'warning' | 'error')
        
        /** @CUSTOM */
        placement,
        // duration,
        showProgress: isProgress ? !0 : showProgress,
        ...etc
      });
    },
    close: (key: any) => notification.destroy(key),
  };
}
