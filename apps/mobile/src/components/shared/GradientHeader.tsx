import { ReactNode } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LinearGradient } from "expo-linear-gradient";

import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";

type GradientHeaderProps = {
  title?: string;
  subtitle?: string;
  gradientColors: readonly [string, string, ...string[]];
  left?: ReactNode;
  right?: ReactNode;
  onBack?: () => void;
  height?: number;
  titleNumberOfLines?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

export function GradientHeader({
  title,
  subtitle,
  gradientColors,
  left,
  right,
  onBack,
  height,
  titleNumberOfLines = 1,
  style,
  children,
}: GradientHeaderProps) {
  const { top } = useSafeAreaInsets();

  const hasLeft = left !== undefined || onBack !== undefined;

  return (
    <LinearGradient
      colors={gradientColors}
      style={[
        styles.container,
        { paddingTop: top },
        height != null ? { height } : null,
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingBottom: verticalScale(spacing[4]),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[3]),
  },
  side: {
    width: moderateScale(40),
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    gap: verticalScale(spacing[0.5]),
  },
  title: {
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(fontSizes["2xl"]),
    color: colors.white,
  },
  subtitle: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.white,
    opacity: 0.85,
  },
});
