import { useState, useRef, useEffect } from "react";
import { openWindow } from '@/utils/browser';
import { httpRequest } from '@/providers/dataProvider';
import { getMeta } from '@/utils/browser';
import { updateUser, getAvatarUrl } from '@/utils/user';

type UseSocialAuthOptions = {
  onSuccess?: () => void;
};

export const useSocialAuth = (options: UseSocialAuthOptions = {}) => {
  const popupRef = useRef<any>(null);
  const [popupOpen, setPopupOpen] = useState<string | null>(null);

  const cleanUp = (bc: BroadcastChannel) => {
    bc.onmessage = null;
    bc.close();
    setPopupOpen(null);
    popupRef.current = null;
  };

  const handleAuth = async (provider: string) => {
    // If a popup is already open, just focus it
    if(popupOpen && popupRef.current){
      popupRef.current.focus();
      return;
    }

    setPopupOpen(provider);

    try{
      let fetchOptions: any = { method: 'POST' };
      let uaData = (navigator as any).userAgentData;
      if(uaData){
        fetchOptions.json = { uad: uaData.toJSON() };
      }

      const response: any = await httpRequest(
        `auth/${provider}/redirect`, 
        fetchOptions
      ).json();

      if(!response?.success){
        setPopupOpen(null);
        return;
      }

      const bc = new BroadcastChannel(import.meta.env.VITE_BC_NAME);
      let completed = false;

      const handleBeforeUnload = () => {
        if(popupRef.current && !popupRef.current.closed){
          popupRef.current.close();
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      bc.onmessage = async (evt) => {
        if(evt.data?.type !== 'OAUTH_SUCCESS') return;

        completed = true;
        cleanUp(bc);
        window.removeEventListener('beforeunload', handleBeforeUnload);

        // Await the setup telemetry process completely before moving forward
        try {
          const fullMeta = await getMeta();
          
          const response: any = await httpRequest.post("setup", { 
            json: { meta: fullMeta },
            keepalive: true
          }).json();

          // Synchronize Refine's expected sessionStorage payload
          if (response?.success && response?.data) {
            updateUser({ 
              ...response.data, 
              avatar: getAvatarUrl(response.data.avatar),
              authenticated: true 
            });
          }
        } catch {
          // console.error("Telemetry registration failed:", err);
        }

        /**
         * Use callback if provided, 
         * otherwise default redirect to '/'
         * or reload if current location is '/'
         */
        if(options.onSuccess){
          options.onSuccess();
        }else{
          let windowLocation = window.location;
          windowLocation.pathname !== '/'
            ? windowLocation.replace('/')
            : windowLocation.reload();
        }
      };

      const popup = openWindow({
        url: response.data,
        title: 'Auth ' + provider,
        width: screen.width / 2,
        height: screen.height - 215,
        onClose: () => {
          window.removeEventListener('beforeunload', handleBeforeUnload);
          if(completed) return;
          cleanUp(bc);
        }
      });

      popupRef.current = popup;

      if(!popup){
        window.removeEventListener('beforeunload', handleBeforeUnload);
        cleanUp(bc);
        // alert('Please allow popups for this site.');
      }
    }catch{
      setPopupOpen(null);
    }
  };

  useEffect(() => {
    return () => {
      if(popupRef.current && !popupRef.current.closed){
        popupRef.current.close();
      }
    };
  }, []);

  return { popupOpen, handleAuth };
};
