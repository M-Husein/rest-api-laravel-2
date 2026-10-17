import { useContext } from "react";
import { ThemedLayoutContext, type IThemedLayoutContext } from "@/contexts/themedLayout";

export const useThemedLayoutContext = (): IThemedLayoutContext => {
	const context = useContext(ThemedLayoutContext);

	/**
	 * --- Vite Environment Check for Dead Code Elimination (DCE) ---
	 * import.meta.env.DEV is:
	 * - `true` in development (the code runs)
	 * - `false` during a production build (the code is removed)
	 */
	if (import.meta.env.DEV && !context) {
    throw new Error("useThemedLayoutContext must be used within an ThemedLayoutContextProvider");
  }

	/**
	 * The context is returned in all cases. In production, the check above is gone.
	 * We use `as` here to assure TypeScript that the context is valid, as the runtime check 
	 * (which removes the error path in production) guarantees it.
	 */
	return context as IThemedLayoutContext;
};
