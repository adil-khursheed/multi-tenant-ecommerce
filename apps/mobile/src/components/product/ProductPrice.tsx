import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, fontSizes, spacing, radii } from "@/constants/theme";
import { moderateScale, horizontalScale, verticalScale } from "@/constants/responsive";
import { useCurrency } from "@/providers/Currency";

type ProductPriceProps = {
  effectivePrice?: number | null;
  basePrice?: number | null;
  discountPercent?: number | null;
  minEffectivePrice?: number | null;
  maxEffectivePrice?: number | null;
  enableVariants?: boolean | null;
  selectedVariant?: {
    effectivePrice?: number | null;
    priceInINR?: number | null;
  } | null;
};

export function ProductPrice({
  effectivePrice,
  basePrice,
  discountPercent,
  minEffectivePrice,
  maxEffectivePrice,
  enableVariants,
  selectedVariant,
}: ProductPriceProps) {
  const { formatPrice } = useCurrency();

  // With a selected variant
  if (selectedVariant) {
    const vOriginal = selectedVariant.priceInINR ?? basePrice ?? 0;
    const vEffective = selectedVariant.effectivePrice ?? vOriginal;
    const vDiscount =
      vOriginal > vEffective
        ? Math.round(((vOriginal - vEffective) / vOriginal) * 100)
        : null;

    return (
      <View style={styles.container}>
        <Text style={styles.price}>{formatPrice(vEffective)}</Text>
        {vDiscount && vDiscount > 0 && (
          <>
            <Text style={styles.originalPrice}>{formatPrice(vOriginal)}</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{vDiscount}% off</Text>
            </View>
          </>
        )}
      </View>
    );
  }

  // With variants but no selection -- show range
  if (
    enableVariants &&
    minEffectivePrice != null &&
    maxEffectivePrice != null &&
    minEffectivePrice !== maxEffectivePrice
  ) {
    return (
      <View style={styles.container}>
        <Text style={styles.price}>
          {formatPrice(minEffectivePrice)} - {formatPrice(maxEffectivePrice)}
        </Text>
      </View>
    );
  }

  // Single product or fallback
  const effective = effectivePrice ?? basePrice ?? 0;
  const original = basePrice ?? 0;
  const hasDiscount = original > effective && discountPercent && discountPercent > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.price}>{formatPrice(effective)}</Text>
      {hasDiscount && (
        <>
          <Text style={styles.originalPrice}>{formatPrice(original)}</Text>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercent}% off</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: horizontalScale(spacing[2]),
  },
  price: {
    fontFamily: fonts.sans.semiBold,
    fontSize: moderateScale(fontSizes.xl),
    color: colors.foreground,
  },
  originalPrice: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: horizontalScale(spacing[1.5]),
    paddingVertical: verticalScale(1),
    borderRadius: radii.sm,
  },
  discountText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(10),
    color: colors.primary,
  },
});
