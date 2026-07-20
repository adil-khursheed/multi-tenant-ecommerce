import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/providers/Auth";
import { useCart } from "@/providers/Cart";
import { useCurrency } from "@/providers/Currency";
import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";
import { verticalScale, horizontalScale, moderateScale } from "@/constants/responsive";

export function CartSummary() {
  const { formatPrice } = useCurrency();
  const { itemCount, subtotal } = useCart();
  const { status } = useAuth();
  const router = useRouter();

  if (itemCount === 0) return null;

  const isLoggedIn = status === "loggedIn";

  const handleCheckout = () => {
    if (isLoggedIn) {
      router.push("/checkout");
    } else {
      router.push("/(modals)/login");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.label}>
          Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
        </Text>
        <Text style={styles.value}>{formatPrice(subtotal)}</Text>
      </View>

      <Text
        style={[styles.button, !isLoggedIn && styles.buttonOutlined]}
        onPress={handleCheckout}
      >
        {isLoggedIn ? "Proceed to Checkout" : "Login to Checkout"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingVertical: verticalScale(spacing[3]),
    paddingBottom: verticalScale(spacing[4]),
    backgroundColor: colors.card,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginBottom: verticalScale(spacing[3]),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(spacing[3]),
  },
  label: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
  },
  value: {
    fontFamily: fonts.sans.semiBold,
    fontSize: moderateScale(fontSizes.base),
    color: colors.foreground,
  },
  button: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.base),
    color: colors.primaryForeground,
    backgroundColor: colors.primary,
    textAlign: "center",
    paddingVertical: verticalScale(spacing[3]),
    borderRadius: radii.full,
    overflow: "hidden",
  },
  buttonOutlined: {
    backgroundColor: colors.transparent,
    color: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
  },
});
