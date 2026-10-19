import { createContext } from "react";
import type { IThemedLayoutContext } from "./types";

export const ThemedLayoutContext = createContext<IThemedLayoutContext>({
  siderCollapsed: false,
  mobileSiderOpen: false,
  setSiderCollapsed: () => {},
  setMobileSiderOpen: () => {},
});
