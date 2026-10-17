export interface IThemedLayoutContext {
	siderCollapsed: boolean;
	mobileSiderOpen: boolean;
	setSiderCollapsed: (visible: boolean) => void;
	setMobileSiderOpen: (visible: boolean) => void;
}
