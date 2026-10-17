import { useEffect } from 'react';
import { SplashScreen } from '@/components/SplashScreen';

export const CrossZoneRedirect = ({ to }: { to: string }) => {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return <SplashScreen />;
};
