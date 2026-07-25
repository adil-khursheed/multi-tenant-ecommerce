import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { Image } from "expo-image";

import { RichText } from "@/components/rich-text/RichText";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
  width as SCREEN_WIDTH,
} from "@/constants/responsive";
import { colors, fontSizes, fonts, radii, spacing } from "@/constants/theme";

type Link = {
  href: string;
  label: string;
  appearance: string;
};

type FeaturedProduct = {
  title: string | null;
  slug: string | null;
  priceInINR: number | null;
  effectivePrice: number | null;
  discountPercent: number | null;
  imageUrl: string | null;
};

export type HighImpactHeroProps = {
  richText: unknown;
  mediaUrl: string | null;
  links: Link[];
  featuredProduct: FeaturedProduct | null;
};

function formatPrice(amount: number): string {
  return `\u20B9${amount.toLocaleString("en-IN")}`;
}

export function HighImpactHero({
  richText,
  mediaUrl,
  links,
  featuredProduct,
}: HighImpactHeroProps) {
  const router = useRouter();
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.04, {
        duration: 4000,
        easing: Easing.inOut(Easing.linear),
      }),
      -1,
      true,
    );
  }, [scale]);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const displayUrl = featuredProduct?.imageUrl || mediaUrl;

  return (
    <View style={styles.container}>
      {/* Image area */}
      <View style={styles.imageContainer}>
        {displayUrl && (
          <Animated.View style={[styles.imageWrapper, animatedImageStyle]}>
            <Image
              source={{ uri: displayUrl }}
              style={styles.image}
              contentFit="cover"
              transition={300}
            />
          </Animated.View>
        )}

        {/* Featured product overlay */}
        {featuredProduct && (
          <View style={styles.productOverlay}>
            <View style={styles.productInfo}>
              {featuredProduct.title && (
                <Text style={styles.productTitle}>
                  {featuredProduct.title}
                </Text>
              )}
              {featuredProduct.effectivePrice != null && (
                <View style={styles.priceRow}>
                  <Text style={styles.price}>
                    {formatPrice(featuredProduct.effectivePrice)}
                  </Text>
                  {featuredProduct.priceInINR != null &&
                    featuredProduct.priceInINR !==
                      featuredProduct.effectivePrice && (
                      <Text style={styles.originalPrice}>
                        {formatPrice(featuredProduct.priceInINR)}
                      </Text>
                    )}
                  {featuredProduct.discountPercent != null &&
                    featuredProduct.discountPercent > 0 && (
                      <Text style={styles.discount}>
                        {featuredProduct.discountPercent}% off
                      </Text>
                    )}
                </View>
              )}
            </View>
            {featuredProduct.slug && (
              <Pressable
                style={styles.productButton}
                onPress={() =>
                  router.push(`/(shop)/${featuredProduct.slug}`)
                }
              >
                <Text style={styles.productButtonText}>View</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* Content area */}
      <View style={styles.content}>
        {richText != null && <RichText data={richText as any} />}

        {links.length > 0 && (
          <View style={styles.links}>
            {links.map((link, i) => (
              <Pressable
                key={i}
                style={[
                  styles.linkButton,
                  i === 0 ? styles.linkButtonPrimary : styles.linkButtonSecondary,
                ]}
                onPress={() => {
                  if (link.href.startsWith("http")) {
                    // external link — could use Linking.openURL
                  } else {
                    router.push(link.href as any);
                  }
                }}
              >
                <Text
                  style={[
                    styles.linkText,
                    i === 0
                      ? styles.linkTextPrimary
                      : styles.linkTextSecondary,
                  ]}
                >
                  {link.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  imageContainer: {
    width: "100%",
    height: SCREEN_WIDTH * (4 / 3),
    backgroundColor: colors.muted,
    overflow: "hidden",
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  productOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingVertical: verticalScale(spacing[3]),
    backgroundColor: "rgba(250,248,246,0.9)",
    backdropFilter: "blur(8px)",
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(fontSizes.lg),
    color: colors.foreground,
    marginBottom: verticalScale(spacing[0.5]),
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[2]),
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
  discount: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.success,
  },
  productButton: {
    backgroundColor: colors.foreground,
    paddingHorizontal: horizontalScale(spacing[3]),
    paddingVertical: verticalScale(spacing[1.5]),
    borderRadius: radii.sm,
  },
  productButtonText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.white,
  },
  content: {
    paddingHorizontal: horizontalScale(spacing[5]),
    paddingVertical: verticalScale(spacing[6]),
  },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: horizontalScale(spacing[3]),
    marginTop: verticalScale(spacing[4]),
  },
  linkButton: {
    paddingHorizontal: horizontalScale(spacing[5]),
    paddingVertical: verticalScale(spacing[2.5]),
    borderRadius: radii.sm,
  },
  linkButtonPrimary: {
    backgroundColor: colors.primary,
  },
  linkButtonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.foreground,
  },
  linkText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  linkTextPrimary: {
    color: colors.primaryForeground,
  },
  linkTextSecondary: {
    color: colors.foreground,
  },
});
