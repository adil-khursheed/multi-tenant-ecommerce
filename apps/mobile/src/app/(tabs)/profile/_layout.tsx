import { Pressable, StyleSheet, Text, View } from "react-native";

import { User02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useRouter } from "expo-router";
import { TopTabs } from "expo-router/js-top-tabs";

import { ProfileHeader } from "@/components/profile";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";
import { useAuth } from "@/providers/Auth";

export default function ProfileLayout() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loggedOutContainer}>
          <HugeiconsIcon
            icon={User02Icon}
            size={moderateScale(48)}
            color={colors.muted}
            strokeWidth={1.5}
          />
          <Text style={styles.loggedOutTitle}>
            Sign in to manage your account
          </Text>
          <Text style={styles.loggedOutSubtext}>
            View your orders, addresses, and account settings
          </Text>
          <Pressable
            style={styles.loginButton}
            onPress={() => router.push("/(modals)/login")}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ProfileHeader name={user.name ?? ""} email={user.email ?? ""} />

      <TopTabs
        style={styles.tabs}
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.mutedForeground,
          tabBarIndicatorStyle: {
            backgroundColor: colors.primary,
          },
          tabBarLabelStyle: {
            fontFamily: fonts.sans.medium,
            fontSize: moderateScale(fontSizes.sm),
            textTransform: "uppercase",
            letterSpacing: 0.5,
          },
          tabBarStyle: {
            backgroundColor: colors.card,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
          },
        }}
      >
        <TopTabs.Screen name="index" options={{ tabBarLabel: "Profile" }} />
        <TopTabs.Screen
          name="addresses"
          options={{ tabBarLabel: "Addresses" }}
        />
        <TopTabs.Screen name="orders" options={{ tabBarLabel: "Orders" }} />
      </TopTabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    flex: 1,
  },
  loggedOutContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: verticalScale(spacing[3]),
    paddingHorizontal: horizontalScale(spacing[8]),
  },
  loggedOutTitle: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.base),
    color: colors.foreground,
    textAlign: "center",
  },
  loggedOutSubtext: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: verticalScale(spacing[3.5]),
    paddingHorizontal: horizontalScale(spacing[8]),
    marginTop: verticalScale(spacing[2]),
  },
  loginButtonText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.base),
    color: colors.primaryForeground,
  },
});
