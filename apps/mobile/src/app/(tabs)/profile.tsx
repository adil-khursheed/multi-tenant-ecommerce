import { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import {
  User02Icon,
  LogoutIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";

import { useAuth } from "@/providers/Auth";
import {
  ProfileHeader,
  AccountSettingsForm,
  AddressesSection,
  OrdersSection,
} from "@/components/profile";
import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";
import { horizontalScale, moderateScale, verticalScale } from "@/constants/responsive";

const TABS = ["Profile", "Addresses", "Orders"] as const;
type TabKey = (typeof TABS)[number];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>("Profile");

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.header,
            { paddingTop: top + verticalScale(spacing[4]) },
          ]}
        >
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.loggedOutContainer}>
          <HugeiconsIcon
            icon={User02Icon}
            size={moderateScale(48)}
            color={colors.muted}
            strokeWidth={1.5}
          />
          <Text style={styles.loggedOutTitle}>Sign in to manage your account</Text>
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
      <View
        style={[
          styles.header,
          { paddingTop: top + verticalScale(spacing[4]) },
        ]}
      >
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(300)}>
          <ProfileHeader name={user.name ?? ""} email={user.email ?? ""} />
        </Animated.View>

        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <Pressable
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.tabActive,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.tabContent}>
          {activeTab === "Profile" && (
            <>
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
            </>
          )}

          {activeTab === "Addresses" && <AddressesSection />}

          {activeTab === "Orders" && <OrdersSection />}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingBottom: verticalScale(spacing[3]),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    borderBottomLeftRadius: moderateScale(radii["2xl"]),
    borderBottomRightRadius: moderateScale(radii["2xl"]),
  },
  headerTitle: {
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(fontSizes["2xl"]),
    color: colors.primaryForeground,
    paddingVertical: verticalScale(spacing[3]),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(spacing[10]),
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: verticalScale(spacing[3]),
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: colors.primary,
  },
  tabContent: {
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingTop: verticalScale(spacing[4]),
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
