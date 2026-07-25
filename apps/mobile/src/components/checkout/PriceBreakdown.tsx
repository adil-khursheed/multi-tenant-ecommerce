import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, fonts, fontSizes, spacing } from "@/constants/theme";
import { horizontalScale, verticalScale, moderateScale } from "@/constants/responsive";

const COD_FEE = 50;

type Props = {
  subtotal: number;
  discount: number;
  couponCode: string | null | undefined;
  selectedPaymentMethod?: "razorpay" | "cod";
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  couponLoading: boolean;
  couponError: string | null;
};

export function PriceBreakdown({
  subtotal,
  discount,
  couponCode,
  selectedPaymentMethod,
  onApplyCoupon,
  onRemoveCoupon,
  couponLoading,
  couponError,
}: Props) {
  const [couponInput, setCouponInput] = useState("");

  const isCOD = selectedPaymentMethod === "cod";
  const totalAfterDiscount = subtotal - discount;
  const grandTotal = isCOD ? totalAfterDiscount + COD_FEE : totalAfterDiscount;

  const handleApply = () => {
    if (couponInput.trim()) {
      onApplyCoupon(couponInput.trim());
      setCouponInput("");
    }
  };

  return (
    <View style={styles.container}>
      {!couponCode ? (
        <View style={styles.couponRow}>
          <TextInput
            style={styles.couponInput}
            placeholder="Coupon code"
            placeholderTextColor={colors.mutedForeground}
            value={couponInput}
            onChangeText={setCouponInput}
            autoCapitalize="characters"
          />
          <Pressable
            style={[styles.couponButton, couponLoading && styles.couponButtonDisabled]}
            onPress={handleApply}
            disabled={couponLoading || !couponInput.trim()}
          >
            <Text style={styles.couponButtonText}>
              {couponLoading ? "..." : "Apply"}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.appliedCoupon}>
          <Text style={styles.couponLabel}>Coupon ({couponCode})</Text>
          <View style={styles.couponRight}>
            <Text style={styles.discountAmount}>-₹{(discount / 100).toFixed(2)}</Text>
            <Pressable onPress={onRemoveCoupon} disabled={couponLoading}>
              <Text style={styles.removeButton}>Remove</Text>
            </Pressable>
          </View>
        </View>
      )}

      {couponError ? <Text style={styles.couponError}>{couponError}</Text> : null}

      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>₹{(subtotal / 100).toFixed(2)}</Text>
      </View>

      {discount > 0 && (
        <View style={styles.row}>
          <Text style={styles.discountLabel}>Discount</Text>
          <Text style={styles.discountAmount}>-₹{(discount / 100).toFixed(2)}</Text>
        </View>
      )}

      <View style={styles.row}>
        <Text style={styles.label}>Shipping{isCOD ? " (COD)" : ""}</Text>
        {isCOD ? (
          <Text style={styles.value}>₹{(COD_FEE / 100).toFixed(2)}</Text>
        ) : (
          <Text style={styles.freeLabel}>Free</Text>
        )}
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>₹{(grandTotal / 100).toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: verticalScale(spacing[2]),
  },
  couponRow: {
    flexDirection: "row",
    gap: horizontalScale(spacing[2]),
    marginBottom: verticalScale(spacing[1]),
  },
  couponInput: {
    flex: 1,
    height: verticalScale(36),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: horizontalScale(spacing[3]),
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.foreground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  couponButton: {
    paddingHorizontal: horizontalScale(spacing[3]),
    height: verticalScale(36),
    backgroundColor: colors.foreground,
    alignItems: "center",
    justifyContent: "center",
  },
  couponButtonDisabled: {
    opacity: 0.5,
  },
  couponButtonText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.white,
  },
  appliedCoupon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(spacing[1]),
  },
  couponLabel: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  couponRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[2]),
  },
  removeButton: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.primary,
  },
  couponError: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.destructive,
    marginBottom: verticalScale(spacing[1]),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
  },
  value: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
  },
  discountLabel: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.destructive,
  },
  discountAmount: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.destructive,
  },
  freeLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: verticalScale(spacing[2]),
    marginTop: verticalScale(spacing[1]),
  },
  totalLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.base),
    color: colors.foreground,
  },
  totalValue: {
    fontFamily: fonts.sans.bold,
    fontSize: moderateScale(fontSizes.lg),
    color: colors.foreground,
  },
});
