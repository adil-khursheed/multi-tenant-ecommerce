import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Delete02Icon, MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";

import { useCurrency } from "@/providers/Currency";
import { type FlattenedCartItem, useCart } from "@/providers/Cart";
import { colors, fonts, fontSizes, spacing } from "@/constants/theme";
import { verticalScale, horizontalScale, moderateScale } from "@/constants/responsive";

type Props = {
  item: FlattenedCartItem;
};

export function CartItem({ item }: Props) {
  const { formatPrice } = useCurrency();
  const { incrementItem, decrementItem, removeItem, isLoading } = useCart();

  const isMutating = isLoading;

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

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {item.productTitle}
        </Text>

        {item.variantTitle ? (
          <Text style={styles.variant} numberOfLines={1}>
            {item.variantTitle}
          </Text>
        ) : null}

        <Text style={styles.price}>{formatPrice(item.priceInINR)}</Text>
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
          style={styles.quantityButton}
          onPress={() => incrementItem(item.id)}
          disabled={isMutating}
          hitSlop={4}
        >
          <HugeiconsIcon
            icon={PlusSignIcon}
            size={14}
            color={colors.foreground}
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
  variant: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
    textTransform: "capitalize",
  },
  price: {
    fontFamily: fonts.sans.semiBold,
    fontSize: moderateScale(fontSizes.sm),
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
  quantityValue: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
    minWidth: horizontalScale(20),
    textAlign: "center",
  },
});
