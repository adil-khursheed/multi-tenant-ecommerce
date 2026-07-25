import { StyleSheet, Text, View } from "react-native";

import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";

import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, fontSizes, spacing } from "@/constants/theme";

type Props = {
  number: string;
  title: string;
  subtitle?: string;
  isCompleted?: boolean;
  isCurrent?: boolean;
};

export function StepHeader({
  number,
  title,
  subtitle,
  isCompleted,
  isCurrent,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View
          style={[
            styles.numberBadge,
            isCompleted && styles.numberBadgeCompleted,
            isCurrent && styles.numberBadgeCurrent,
          ]}
        >
          {isCompleted ? (
            <HugeiconsIcon
              icon={Tick02Icon}
              size={12}
              color={colors.white}
              strokeWidth={2.5}
            />
          ) : (
            <Text
              style={[styles.numberText, isCurrent && styles.numberTextCurrent]}
            >
              {number}
            </Text>
          )}
        </View>
        <View style={styles.textGroup}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(spacing[4]),
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[3]),
  },
  numberBadge: {
    width: moderateScale(28),
    height: moderateScale(28),
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  numberBadgeCompleted: {
    backgroundColor: colors.foreground,
  },
  numberBadgeCurrent: {
    backgroundColor: colors.foreground,
  },
  numberText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
  },
  numberTextCurrent: {
    color: colors.white,
  },
  textGroup: {
    gap: 2,
  },
  title: {
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(fontSizes.xl),
    color: colors.foreground,
  },
  subtitle: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
  },
});
