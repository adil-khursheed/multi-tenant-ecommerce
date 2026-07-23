import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/providers/Auth";
import { colors, fonts, fontSizes, spacing } from "@/constants/theme";
import { horizontalScale, verticalScale, moderateScale } from "@/constants/responsive";

export default function CheckoutContact() {
  const { user } = useAuth();
  const router = useRouter();
  const { top } = useSafeAreaInsets();

  useEffect(() => {
    if (user) {
      router.replace("/(shop)/checkout/address");
    }
  }, [user, router]);

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: top + verticalScale(spacing[4]) }]}>
        <Text style={styles.message}>Please log in to continue checkout.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: top + verticalScale(spacing[4]) }]}>
      <Text style={styles.message}>Redirecting...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: horizontalScale(spacing[4]),
  },
  message: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
    textAlign: "center",
    marginTop: verticalScale(spacing[8]),
  },
});
