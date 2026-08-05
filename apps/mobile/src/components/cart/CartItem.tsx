import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  Delete02Icon,
  MinusSignIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, fontSizes, spacing } from "@/constants/theme";
import { useCart, type FlattenedCartItem } from "@/providers/Cart";
import { useCurrency } from "@/providers/Currency";

type Props = {
  item: FlattenedCartItem;
};

export function CartItem({ item }: Props) {
  const { formatPrice } = useCurrency();
  const { incrementItem, decrementItem, removeItem, isLoading } = useCart();
  const router = useRouter();

  const isMutating = isLoading;

  const hasDiscount =
    item.effectivePrice > 0 && item.priceInINR > item.effectivePrice;
  const discountPct = hasDiscount
    ? (item.discountPercent ??
      Math.round(
        ((item.priceInINR - item.effectivePrice) / item.priceInINR) * 100,
      ))
    : null;

  const atMax =
    item.inventory != null &&
    item.inventory > 0 &&
    item.quantity >= item.inventory;

  const variantLabel = item.variantOptionsLabel ?? item.variantTitle;

  const handleProductPress = () => {
    if (item.productSlug) router.push(`/(shop)/${item.productSlug}`);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.deleteButton}
        onPress={() => removeItem(item.id)}
        hitSlop={8}
        disabled={isMutating}
      >
        <HugeiconsIcon
          icon={Delete02Icon}
          size={16}
          color={colors.mutedForeground}
          strokeWidth={1.5}
        />
      </Pressable>

      <Pressable onPress={handleProductPress}>
        <View style={styles.imageContainer}>
          {item.productImageUrl ? (
            <Image
              source={{ uri: item.productImageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]} />
          )}
        </View>
      </Pressable>

      <View style={styles.info}>
        <Pressable onPress={handleProductPress}>
          <Text style={styles.title} numberOfLines={2}>
            {item.productTitle}
          </Text>
        </Pressable>

        {variantLabel ? (
          <Text style={styles.variantChip} numberOfLines={1}>
            {variantLabel}
          </Text>
        ) : null}

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(item.effectivePrice)}</Text>
          {hasDiscount && (
            <>
              <Text style={styles.originalPrice}>
                {formatPrice(item.priceInINR)}
              </Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{discountPct}% off</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.quantityControl}>
        <Pressable
          style={styles.quantityButton}
          onPress={() => decrementItem(item.id)}
          disabled={isMutating}
          hitSlop={4}
        >
          <HugeiconsIcon
            icon={MinusSignIcon}
            size={14}
            color={colors.foreground}
            strokeWidth={2}
          />
        </Pressable>

        <Text style={styles.quantityValue}>{item.quantity}</Text>

        <Pressable
          style={[
            styles.quantityButton,
            atMax && styles.quantityButtonDisabled,
          ]}
          onPress={() => incrementItem(item.id)}
          disabled={isMutating || atMax}
          hitSlop={4}
        >
          <HugeiconsIcon
            icon={PlusSignIcon}
            size={14}
            color={atMax ? colors.mutedForeground : colors.foreground}
            strokeWidth={2}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(spacing[3]),
    paddingHorizontal: horizontalScale(spacing[4]),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: horizontalScale(spacing[3]),
  },
  deleteButton: {
    alignSelf: "flex-start",
    marginTop: verticalScale(2),
    padding: moderateScale(spacing[1]),
  },
  imageContainer: {
    width: horizontalScale(64),
    height: verticalScale(80),
    overflow: "hidden",
    backgroundColor: colors.muted,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    backgroundColor: colors.muted,
  },
  info: {
    flex: 1,
    gap: verticalScale(spacing[1]),
  },
  title: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
    lineHeight: moderateScale(fontSizes.sm * 1.3),
  },
  variantChip: {
    alignSelf: "flex-start",
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
    backgroundColor: colors.muted,
    paddingHorizontal: horizontalScale(spacing[1.5]),
    paddingVertical: verticalScale(2),
    overflow: "hidden",
    textTransform: "capitalize",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[1.5]),
    marginTop: verticalScale(spacing[0.5]),
  },
  price: {
    fontFamily: fonts.sans.semiBold,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.primary,
  },
  originalPrice: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: horizontalScale(spacing[1]),
    paddingVertical: verticalScale(1),
  },
  discountText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(10),
    color: colors.primary,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[1.5]),
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: verticalScale(spacing[1]),
    paddingHorizontal: horizontalScale(spacing[1.5]),
  },
  quantityButton: {
    width: horizontalScale(28),
    height: verticalScale(28),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.muted,
  },
  quantityButtonDisabled: {
    opacity: 0.4,
  },
  quantityValue: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
    minWidth: horizontalScale(20),
    textAlign: "center",
  },
});
