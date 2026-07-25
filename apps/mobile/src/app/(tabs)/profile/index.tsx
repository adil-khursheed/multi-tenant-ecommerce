import { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { LogoutIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";

import { AccountSettingsForm } from "@/components/profile";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";
import { useAuth } from "@/providers/Auth";

export default function ProfileTab() {
  const { logout } = useAuth();

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <AccountSettingsForm />
      <View style={styles.divider} />
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <HugeiconsIcon
          icon={LogoutIcon}
          size={moderateScale(18)}
          color={colors.destructive}
          strokeWidth={1.5}
        />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingTop: verticalScale(spacing[4]),
    paddingBottom: verticalScale(spacing[10]),
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: verticalScale(spacing[4]),
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: horizontalScale(spacing[2]),
    borderWidth: 1,
    borderColor: colors.destructive,
    borderRadius: radii.md,
    paddingVertical: verticalScale(spacing[3]),
  },
  logoutText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.destructive,
  },
});
