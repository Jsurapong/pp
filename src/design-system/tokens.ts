/**
 * Design System Tokens — synced from Claude Design
 * Source: https://api.anthropic.com/v1/design/h/K4LHfUzCcNr1vwrSXUjn-Q
 *
 * DO NOT edit by hand. Run `npm run sync-design` to update from the latest bundle.
 * This file is the single source of truth for both CSS variables and Ant Design theme.
 */

export const tokens = {
  color: {
    primary:        "#1677ff",
    primaryHover:   "#4096ff",
    primaryActive:  "#0958d9",
    primaryBg:      "#e6f4ff",
    primaryBorder:  "#91caff",

    success:        "#52c41a",
    successBg:      "#f6ffed",
    successBorder:  "#b7eb8f",

    warning:        "#faad14",
    warningBg:      "#fffbe6",
    warningBorder:  "#ffe58f",

    error:          "#ff4d4f",
    errorBg:        "#fff2f0",
    errorBorder:    "#ffccc7",

    purple:         "#722ed1",
    purpleBg:       "#f9f0ff",
    purpleBorder:   "#d3adf7",

    cyan:           "#13c2c2",
    cyanBg:         "#e6fffb",
    cyanBorder:     "#87e8de",

    orange:         "#d46b08",
    orangeBg:       "#fff7e6",
    orangeBorder:   "#ffd591",

    magenta:        "#eb2f96",
  },

  text: {
    default:     "rgba(0, 0, 0, 0.88)",
    secondary:   "rgba(0, 0, 0, 0.65)",
    tertiary:    "rgba(0, 0, 0, 0.45)",
    quaternary:  "rgba(0, 0, 0, 0.25)",
  },

  bg: {
    default:  "#f5f5f5",
    elevated: "#fafafa",
    layout:   "#f0f2f5",
    card:     "#ffffff",
  },

  border: {
    default:   "#d9d9d9",
    secondary: "#f0f0f0",
    divider:   "rgba(5, 5, 5, 0.06)",
  },

  sider: {
    bg:        "#001529",
    item:      "rgba(255, 255, 255, 0.65)",
    itemActive:"#ffffff",
    bgActive:  "#1677ff",
    divider:   "rgba(255, 255, 255, 0.08)",
  },

  radius: {
    base: 8,
    sm:   6,
    xs:   4,
  },

  shadow: {
    sm: "0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)",
    md: "0 6px 16px 0 rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12), 0 9px 28px 8px rgba(0,0,0,0.05)",
  },

  font: {
    sans:    `"Geist", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif`,
    mono:    `"Geist Mono", "JetBrains Mono", "SF Mono", ui-monospace, monospace`,
    display: `"Instrument Serif", "Times New Roman", serif`,
    size: {
      base: 14,
      sm:   12,
      lg:   16,
      xl:   20,
    },
    lineHeight: 1.5715,
  },
} as const;

export type DesignTokens = typeof tokens;
