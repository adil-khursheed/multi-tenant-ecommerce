import { Pressable, StyleSheet, Text, View } from "react-native";

import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { horizontalScale, moderateScale, verticalScale } from "@/constants/responsive";
import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";
import { useCurrency } from "@/providers/Currency";
import { getImageUrl, type MediaSource } from "@/utils/media";

type ProductTileProps = {
  slug: string;
  title?: string | null;
  price: number | null;
  image: MediaSource;
  height?: number;
};

export function ProductTile({ slug, title, price, image, height }: ProductTileProps) {
  const router = useRouter();
  const { formatPrice } = useCurrency();

  const imageUrl = getImageUrl(image);

  return (
    <Pressable
      style={({ pressed }) => [styles.tile, { height }, pressed && styles.pressed]}
      onPress={() => router.push(`/(shop)/${slug}`)}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      <View style={styles.overlay}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {price != null ? (
          <View style={styles.pricePill}>
            <Text style={styles.priceText}>{formatPrice(price)}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.card,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    backgroundColor: colors.muted,
  },
  pressed: {
    opacity: 0.85,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: horizontalScale(spacing[2]),
    padding: horizontalScale(spacing[3]),
  },
  title: {
    flex: 1,
    fontFamily: fonts.sans.semiBold,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.white,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  pricePill: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: horizontalScale(spacing[3]),
    paddingVertical: verticalScale(spacing[1]),
  },
  priceText: {
    fontFamily: fonts.sans.semiBold,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.white,
  },
});
