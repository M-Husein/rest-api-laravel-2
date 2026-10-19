export const MIN_SIZE = 0.005; // 0.5% minimum size, smaller min size for 0-1 scale

// Cursors mapping for handles
export const handleCursors: Record<string, string> = {
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  nw: "nwse-resize",
  se: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  // rot: "alias",
};

export const uid = () => crypto.randomUUID();
export const clamp = (v: number) => Math.max(0, Math.min(1, v));

/** 
 * Helper to calculate angle between center and mouse.
 * Uses natural pixel dimensions to ensure accuracy.
 */
export const calculateAngleToMouse = (
  dims: { w: number, h: number }, 
  center_normalized: { x: number, y: number }, 
  mouse_normalized: { x: number, y: number }
): number => {
  const cx = center_normalized.x * dims.w;
  const cy = center_normalized.y * dims.h;
  const px = mouse_normalized.x * dims.w;
  const py = mouse_normalized.y * dims.h;
  return Math.atan2(py - cy, px - cx) * 180 / Math.PI;
};

export const noDefault = (e: any) => {
  e.preventDefault();
  e.stopPropagation();
}
