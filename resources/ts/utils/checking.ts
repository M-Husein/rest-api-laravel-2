// import { getParser } from "bowser"; // Bowser

export const isTouchDevice = (): boolean => 
  'ontouchstart' in window || navigator.maxTouchPoints > 0;

/**
 * Detects if the user is on a physical mobile/tablet device.
 * Relies on hardware capabilities (touch + screen resolution) rather than spoofable user agents.
 *
 * @returns `true` if the device is a mobile phone or tablet, `false` otherwise.
 */
export const isMobile = (): boolean => {
  // SSR safety
  // if (typeof window === 'undefined') return false;

  // 1. Check for touch support (hardware capability)
  // 2. Check physical screen width (CSS pixels). Desktops are almost always > 1024.
  //    Include <= 1024 to catch the largest iPad Pro.
  return isTouchDevice() && window.screen.width <= 1024;
};

// const isMobileWidth = (): boolean => {
//   if (typeof window === 'undefined') return false;
//   return window.matchMedia('(max-width: 768px)').matches;
// };

const hasVirtualKeyboard = () =>
  typeof window !== "undefined" && 
  window.matchMedia("(pointer: fine)").matches && 
  window.matchMedia("(hover: hover)").matches;
