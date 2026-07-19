import { StyleSheet } from "react-native";

export const colors = {
  background: "#faf8f6",
  foreground: "#221b19",

  card: "#ffffff",
  cardForeground: "#221b19",

  primary: "#914216",
  primaryForeground: "#ffffff",

  secondary: "#fdf4ef",
  secondaryForeground: "#6b3d24",

  muted: "#f2ede8",
  mutedForeground: "#79706a",

  accent: "#f5dbc7",
  accentForeground: "#6b3d24",

  destructive: "#c42a2a",
  destructiveForeground: "#ffffff",

  border: "#e2dad3",
  input: "#e2dad3",
  ring: "#914216",

  success: "#00894a",
  warning: "#d9a150",
  error: "#c42a2a",

  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
} as const;

export const fonts = {
  sans: {
    light: "DMSans-Light",
    regular: "DMSans-Regular",
    medium: "DMSans-Medium",
    semiBold: "DMSans-SemiBold",
    bold: "DMSans-Bold",
  },
  serif: {
    light: "CormorantGaramond-Light",
    regular: "CormorantGaramond-Regular",
    medium: "CormorantGaramond-Medium",
    semiBold: "CormorantGaramond-SemiBold",
    bold: "CormorantGaramond-Bold",
  },
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
} as const;

export const fontWeights = {
  light: "300" as const,
  normal: "400" as const,
  medium: "500" as const,
  semiBold: "600" as const,
  bold: "700" as const,
};

export const lineHeights = {
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const radii = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: "#241005",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: "#241005",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: "#241005",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
} as const;

export const typography = StyleSheet.create({
  heading1: {
    fontFamily: fonts.serif.regular,
    fontSize: fontSizes["4xl"],
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes["4xl"] * lineHeights.tight,
    color: colors.foreground,
  },
  heading2: {
    fontFamily: fonts.serif.regular,
    fontSize: fontSizes["3xl"],
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes["3xl"] * lineHeights.tight,
    color: colors.foreground,
  },
  heading3: {
    fontFamily: fonts.serif.regular,
    fontSize: fontSizes["2xl"],
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes["2xl"] * lineHeights.tight,
    color: colors.foreground,
  },
  heading4: {
    fontFamily: fonts.sans.medium,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.xl * lineHeights.tight,
    color: colors.foreground,
  },
  body: {
    fontFamily: fonts.sans.regular,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.base * lineHeights.normal,
    color: colors.foreground,
  },
  bodySmall: {
    fontFamily: fonts.sans.regular,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.sm * lineHeights.normal,
    color: colors.foreground,
  },
  caption: {
    fontFamily: fonts.sans.regular,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.xs * lineHeights.normal,
    color: colors.mutedForeground,
  },
  label: {
    fontFamily: fonts.sans.medium,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.snug,
    color: colors.foreground,
  },
  subtitle: {
    fontFamily: fonts.sans.regular,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.lg * lineHeights.normal,
    color: colors.mutedForeground,
  },
  button: {
    fontFamily: fonts.sans.medium,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.base * lineHeights.snug,
    color: colors.primaryForeground,
  },
});

export type ThemeColors = typeof colors;
export type Theme = {
  colors: ThemeColors;
  fonts: typeof fonts;
  fontSizes: typeof fontSizes;
  fontWeights: typeof fontWeights;
  lineHeights: typeof lineHeights;
  spacing: typeof spacing;
  radii: typeof radii;
  shadows: typeof shadows;
};
