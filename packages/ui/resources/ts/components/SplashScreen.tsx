import { useEffect } from 'react';
import { toggleLoaderApp } from '@/utils/dom';

export const SplashScreen = () => {
  useEffect(() => {
    toggleLoaderApp(false);
    
    // Hide loading
    return () => {
      toggleLoaderApp(true);
    }
  }, []);

  return null;
}

// useEffect(() => {
//   const loader = document.getElementById('loaderApp');
//   // Show loading
//   loader?.classList.remove('hidden');
  
//   return () => { // Hide loading
//     loader?.classList.add('hidden');
//   }
// }, []);
