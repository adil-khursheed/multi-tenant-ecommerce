import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";

import { useCurrency } from "@/providers/Currency";
import { colors, fonts, fontSizes, spacing } from "@/constants/theme";
import { horizontalScale, verticalScale, moderateScale } from "@/constants/responsive";

type CartItem = {
  id: string;
  productTitle: string;
  productImageUrl: string | null;
  variantTitle: string | null;
  priceInINR: number;
  quantity: number;
};

type Props = {
  items: CartItem[];
};

export function OrderSummaryItems({ items }: Props) {
  const { formatPrice } = useCurrency();

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item.id} style={styles.row}>
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
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityText}>{item.quantity}</Text>
            </View>
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
            <Text style={styles.price}>
              {formatPrice(item.priceInINR * item.quantity)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: verticalScale(spacing[3]),
  },
  row: {
    flexDirection: "row",
    gap: horizontalScale(spacing[3]),
  },
  imageContainer: {
    width: horizontalScale(56),
    height: verticalScale(72),
    overflow: "hidden",
    backgroundColor: colors.muted,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    backgroundColor: colors.muted,
  },
  quantityBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: colors.foreground,
    paddingHorizontal: horizontalScale(spacing[1]),
    paddingVertical: verticalScale(1),
    margin: 4,
  },
  quantityText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(10),
    color: colors.white,
  },
  info: {
    flex: 1,
    gap: verticalScale(spacing[0.5]),
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
    lineHeight: moderateScale(fontSizes.sm * 1.3),
  },
  variant: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
  },
  price: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
  },
});
