import type { PropsWithChildren } from "react";
import { ConfigProvider, App as AntdApp } from "antd";
import type { Locale } from "antd/es/locale";

interface AppThemeProps extends PropsWithChildren {
  locale?: Locale;
}

export const AppTheme = ({
  locale,
  children,
}: AppThemeProps) => {
  return (
    <ConfigProvider 
      csp={{ nonce: APP.csp }}
      locale={locale}
      wave={{
        disabled: true,
      }}

      /**
       * Default = "ant"
       * NOTE: Change in scss / css files too
       */
      prefixCls="a" 

      /**
       * Default = "anticon"
       * NOTE: Change in scss / css files too
       * Previous projects using "ai"
       */
      iconPrefixCls="i" 

      /**
       * For disabled components: Button, Input, Checkbox, Dropdown Button, 
       */
      // componentDisabled={true} 
      theme={{
        /** @OPTION : Using color scheme light / dark */
        // algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        // algorithm: theme === "dark" ? AntdTheme.darkAlgorithm : AntdTheme.defaultAlgorithm,
        // token: {
        //   // motion: false,
        //   // fontFamily: "'Lato',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'",
        //   // fontSize: 14,
        //   // lineHeight: 1.6, // default: 1.5714285714285714,
        //   // colorText: "",
        //   // colorLink: "#ff7a00",
        //   // colorPrimary: "#fbdd0b",
        //   // colorTextLightSolid: "#555",
        //   // colorTextBase: "#fff",
        //   // colorBgElevated: "#16085f",
        //   // colorBgLayout: "#f4f4f4", // #f5f5f5
          
        //   // zIndexPopupBase: 1055, // For Modal
        //   // borderRadius: 8, // 6
        //   // borderRadiusLG: 10, // 8
        //   // borderRadiusSM: 6, // 4
        // },
        components: {
          // Button: {
          //   fontWeight: 600, // 500
          //   primaryColor: "#333",
          // },
          // Input: {
          //   activeShadow: "none",
          //   errorActiveShadow: "none",
          // },
          Menu: {
            algorithm: true, // Enable algorithm
            itemPaddingInline: 9, // Default: 16
            // itemSelectedColor: "#fb7800",
          },
          Table: {
            cellPaddingBlockSM: 5,
            // cellFontSizeSM: 13,
          },
          Modal: {
            zIndexPopupBase: 1055,
          },
          // Dropdown: {
          //   // zIndexPopup: 999,
          //   itemSelectedColor: "#fb7800", // NOT WORK
          // },
          Notification: {
            zIndexPopup: 2056, // Default 1060
          },
          // DatePicker: {
          //   zIndexPopup: 999, // Default 1050
          // },
          Popconfirm: {
            zIndexPopup: 999, // Default 1030
          },
          // Tooltip: {
          //   zIndexPopup: 999, // Default 1070
          // },
        },
      }}
    >
      <AntdApp
        // notification={{ bottom: 0 }}
      >
        {children}
      </AntdApp>
    </ConfigProvider>
  );
};
