import { StyleSheet, Text, View } from "react-native";
import { ShoppingCart01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useRouter } from "expo-router";

import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";
import { verticalScale, moderateScale } from "@/constants/responsive";

export function EmptyCart() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <HugeiconsIcon
          icon={ShoppingCart01Icon}
          size={48}
          color={colors.mutedForeground}
          strokeWidth={1}
        />
      </View>

      <Text style={styles.title}>Your cart is empty</Text>

      <Text style={styles.subtitle}>
      Looks like you haven&apos;t added anything yet. Browse our collection and find
      something you love.
      </Text>

      <Text
        style={styles.shopButton}
        onPress={() => router.push("/(tabs)/shop")}
      >
        Browse Products
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: moderateScale(spacing[8]),
    gap: verticalScale(spacing[3]),
  },
  iconContainer: {
    width: moderateScale(96),
    height: moderateScale(96),
    borderRadius: radii.full,
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(spacing[2]),
  },
  title: {
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(fontSizes["2xl"]),
    color: colors.foreground,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
    textAlign: "center",
    lineHeight: moderateScale(fontSizes.sm * 1.5),
  },
  shopButton: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.base),
    color: colors.primary,
    marginTop: verticalScale(spacing[4]),
    paddingVertical: verticalScale(spacing[3]),
    paddingHorizontal: moderateScale(spacing[8]),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.full,
    overflow: "hidden",
  },
});
