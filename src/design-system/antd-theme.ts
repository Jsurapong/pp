import type { ThemeConfig } from "antd";
import { tokens } from "./tokens";

/**
 * Ant Design ConfigProvider theme — derived from design tokens.
 * Import this in AntdProvider. Do not hardcode values here.
 */
export const antdTheme: ThemeConfig = {
  token: {
    // Brand colors
    colorPrimary:          tokens.color.primary,
    colorSuccess:          tokens.color.success,
    colorWarning:          tokens.color.warning,
    colorError:            tokens.color.error,

    // Text
    colorText:             tokens.text.default,
    colorTextSecondary:    tokens.text.secondary,
    colorTextTertiary:     tokens.text.tertiary,
    colorTextQuaternary:   tokens.text.quaternary,

    // Backgrounds
    colorBgContainer:      tokens.bg.card,
    colorBgLayout:         tokens.bg.layout,
    colorBgElevated:       tokens.bg.elevated,

    // Borders
    colorBorder:           tokens.border.default,
    colorBorderSecondary:  tokens.border.secondary,
    colorSplit:            tokens.border.divider,

    // Shape
    borderRadius:   tokens.radius.base,
    borderRadiusSM: tokens.radius.sm,
    borderRadiusXS: tokens.radius.xs,

    // Elevation
    boxShadow:          tokens.shadow.sm,
    boxShadowSecondary: tokens.shadow.md,

    // Typography
    fontFamily:     tokens.font.sans,
    fontFamilyCode: tokens.font.mono,
    fontSize:       tokens.font.size.base,
    lineHeight:     tokens.font.lineHeight,
  },

  components: {
    Layout: {
      siderBg:  tokens.sider.bg,
      headerBg: tokens.bg.card,
      bodyBg:   tokens.bg.layout,
    },
    Menu: {
      darkItemBg:          tokens.sider.bg,
      darkSubMenuItemBg:   tokens.sider.bg,
      darkItemColor:       tokens.sider.item,
      darkItemSelectedBg:  tokens.sider.bgActive,
      darkItemSelectedColor: tokens.sider.itemActive,
    },
    Card: {
      boxShadow: tokens.shadow.sm,
    },
    Table: {
      headerBg:  tokens.bg.elevated,
      rowHoverBg: tokens.bg.elevated,
    },
    Button: {
      borderRadius: tokens.radius.sm,
    },
    Input: {
      borderRadius: tokens.radius.sm,
    },
  },
};
