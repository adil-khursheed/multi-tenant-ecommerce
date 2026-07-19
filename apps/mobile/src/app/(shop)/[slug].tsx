import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";

import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/utils/api";
import { useCurrency } from "@/providers/Currency";
import { colors, fonts, fontSizes, spacing, radii } from "@/constants/theme";
import { verticalScale, horizontalScale, moderateScale } from "@/constants/responsive";

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const trpc = useTRPC();
  const { formatPrice } = useCurrency();

  const { data, isLoading } = useQuery(
    trpc.product.getProductBySlug.queryOptions({ slug: slug! }),
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.imageSkeleton} />
        <View style={styles.contentSkeleton}>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: "60%" }]} />
          <View style={[styles.skeletonLine, { width: "40%" }]} />
        </View>
      </View>
    );
  }

  const product = data?.product;

  if (!product) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Product not found</Text>
      </View>
    );
  }

  const image =
    product.gallery?.[0]?.image && typeof product.gallery[0].image !== "string"
      ? product.gallery[0].image
      : null;

  const imageUrl =
    image && typeof image === "object" && "url" in image
      ? (image as { url: string }).url
      : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}

      <View style={styles.details}>
        {product.categories?.[0] &&
          typeof product.categories[0] === "object" &&
          "name" in product.categories[0] && (
            <Text style={styles.category}>
              {(product.categories[0] as { name: string }).name}
            </Text>
          )}

        <Text style={styles.title}>{product.title}</Text>

        {product.shortDescription && (
          <Text style={styles.description}>{product.shortDescription}</Text>
        )}

        <Text style={styles.price}>
          {formatPrice(product.effectivePrice ?? product.priceInINR ?? 0)}
        </Text>

        <View style={styles.placeholderSection}>
          <Text style={styles.placeholderText}>
            Product details coming soon...
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: verticalScale(spacing[10]),
  },
  image: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: colors.muted,
  },
  imagePlaceholder: {
    backgroundColor: colors.muted,
  },
  details: {
    padding: moderateScale(spacing[4]),
    gap: verticalScale(spacing[2]),
  },
  category: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(10),
    color: colors.accentForeground,
    textTransform: "uppercase",
    letterSpacing: 0.1,
  },
  title: {
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(fontSizes["2xl"]),
    color: colors.foreground,
    lineHeight: moderateScale(fontSizes["2xl"] * 1.3),
  },
  description: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
    lineHeight: moderateScale(fontSizes.sm * 1.5),
    marginTop: verticalScale(spacing[2]),
  },
  price: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xl),
    color: colors.primary,
    marginTop: verticalScale(spacing[2]),
  },
  placeholderSection: {
    marginTop: verticalScale(spacing[6]),
    padding: moderateScale(spacing[4]),
    backgroundColor: colors.muted,
    borderRadius: radii.md,
  },
  placeholderText: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imageSkeleton: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: colors.muted,
  },
  contentSkeleton: {
    padding: moderateScale(spacing[4]),
    gap: verticalScale(spacing[3]),
  },
  skeletonLine: {
    height: verticalScale(16),
    backgroundColor: colors.muted,
    borderRadius: radii.sm,
    width: "80%",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  emptyText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.base),
    color: colors.mutedForeground,
  },
});
