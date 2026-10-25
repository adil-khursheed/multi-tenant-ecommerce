import { Pressable, StyleSheet, Text, View } from "react-native";

import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import {
  colors,
  fonts,
  fontSizes,
  radii,
  shadows,
  spacing,
} from "@/constants/theme";
import { useCurrency } from "@/providers/Currency";
import { getImageUrl, type MediaSource } from "@/utils/media";

type ProductTileProps = {
  slug: string;
  title?: string | null;
  price: number | null;
  image: MediaSource;
  height?: number;
};

export function ProductTile({
  slug,
  title,
  price,
  image,
  height,
}: ProductTileProps) {
  const router = useRouter();
  const { formatPrice } = useCurrency();

  const imageUrl = getImageUrl(image);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title ? `View ${title}` : "View product"}
      style={({ pressed }) => [
        styles.shadow,
        pressed && styles.shadowPressed,
        { height, aspectRatio: height ? undefined : 1 },
        pressed && styles.pressed,
      ]}
      onPress={() => router.push(`/(shop)/${slug}`)}
    >
      <View style={styles.tile}>
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
        <LinearGradient
          pointerEvents="none"
          colors={["transparent", "rgba(0,0,0,0.72)"]}
          locations={[0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.overlay}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {price != null ? (
            <View style={styles.pricePill}>
              <Text style={styles.priceText}>{formatPrice(price)}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    width: "100%",
    backgroundColor: colors.card,
    ...shadows.sm,
  },
  shadowPressed: {
    backgroundColor: colors.card,
    ...shadows.md,
  },
  tile: {
    flex: 1,
    width: "100%",
    borderRadius: radii.none,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${colors.border}B3`,
    backgroundColor: colors.secondary,
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
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(fontSizes.lg),
    lineHeight: moderateScale(fontSizes.lg * 1.05),
    color: colors.white,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  pricePill: {
    backgroundColor: colors.primary,
    borderRadius: radii.none,
    paddingHorizontal: horizontalScale(spacing[2.5]),
    paddingVertical: verticalScale(spacing[1]),
  },
  priceText: {
    fontFamily: fonts.sans.semiBold,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.white,
  },
});
