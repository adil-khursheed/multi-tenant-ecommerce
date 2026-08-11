import { Pressable, StyleSheet, Text } from "react-native";

import { useRouter } from "expo-router";

import { horizontalScale, moderateScale, verticalScale } from "@/constants/responsive";
import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";
import { navigateToHref } from "@/utils/navigation";

type LinkButtonProps = {
  label: string;
  href: string;
  appearance?: "default" | "outline" | "inline";
  size?: "default" | "lg";
  onPress?: () => void;
};

export function LinkButton({
  label,
  href,
  appearance = "default",
  size = "default",
  onPress,
}: LinkButtonProps) {
  const router = useRouter();

  const isInline = appearance === "inline";
  const isOutline = appearance === "outline";

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    navigateToHref(href, router);
  };

  if (isInline) {
    return (
      <Pressable onPress={handlePress} style={styles.inline}>
        <Text style={[styles.inlineText, isOutline && styles.outlineText]}>
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        size === "lg" ? styles.buttonLg : styles.buttonDefault,
        isOutline ? styles.outline : styles.default,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === "lg" ? styles.textLg : styles.textDefault,
          isOutline ? styles.outlineText : styles.defaultText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDefault: {
    paddingHorizontal: horizontalScale(spacing[5]),
    paddingVertical: verticalScale(spacing[2.5]),
  },
  buttonLg: {
    paddingHorizontal: horizontalScale(spacing[6]),
    paddingVertical: verticalScale(spacing[3]),
  },
  default: {
    backgroundColor: colors.primary,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.foreground,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    fontFamily: fonts.sans.medium,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  textDefault: {
    fontSize: moderateScale(fontSizes.xs),
  },
  textLg: {
    fontSize: moderateScale(fontSizes.sm),
  },
  defaultText: {
    color: colors.primaryForeground,
  },
  outlineText: {
    color: colors.foreground,
  },
  inline: {
    paddingVertical: verticalScale(spacing[1]),
  },
  inlineText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.primary,
    textDecorationLine: "underline",
  },
});
