import { useState, useMemo } from "react";
import { ThemedLayoutContext } from './Context';

interface ProviderProps {
	children: React.ReactNode;
	initialSiderCollapsed?: boolean;
}

export const Provider = ({ children, initialSiderCollapsed }: ProviderProps) => {
	const [siderCollapsed, setSiderCollapsed] = useState(!!initialSiderCollapsed);
	const [mobileSiderOpen, setMobileSiderOpen] = useState(false);

	const contextValue = useMemo(() => ({
		siderCollapsed,
		mobileSiderOpen,
		// The setter functions from useState are guaranteed to be stable
		// and won't cause unnecessary re-renders.
		setSiderCollapsed, 
		setMobileSiderOpen
	}), [siderCollapsed, mobileSiderOpen]);

	return (
		<ThemedLayoutContext.Provider value={contextValue}>
			{children}
		</ThemedLayoutContext.Provider>
	);
};
