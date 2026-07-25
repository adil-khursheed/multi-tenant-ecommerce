import { StyleSheet, Text, View } from "react-native";

import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";

type Props = {
  name: string;
  email: string;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileHeader({ name, email }: Props) {
  const initials = getInitials(name);

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[4]),
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingVertical: verticalScale(spacing[4]),
  },
  avatar: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontFamily: fonts.sans.semiBold,
    fontSize: moderateScale(fontSizes.xl),
    color: colors.primaryForeground,
  },
  info: {
    flex: 1,
    gap: verticalScale(spacing[0.5]),
  },
  name: {
    fontFamily: fonts.sans.semiBold,
    fontSize: moderateScale(fontSizes.lg),
    color: colors.foreground,
  },
  email: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
  },
});
