import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";

import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/utils/api";
import { useCurrency } from "@/providers/Currency";
import { useCart } from "@/providers/Cart";
import {
  colors,
  fonts,
  fontSizes,
  radii,
  spacing,
} from "@/constants/theme";
import {
  verticalScale,
  horizontalScale,
  moderateScale,
} from "@/constants/responsive";

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const trpc = useTRPC();
  const { formatPrice } = useCurrency();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

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

  const price = product.effectivePrice ?? product.priceInINR ?? 0;
  const totalPrice = price * quantity;

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addItem({
        productId: product.id,
        productTitle: product.title ?? "Product",
        productSlug: product.slug ?? slug,
        productImageUrl: imageUrl ?? null,
        priceInINR: price,
      });
      setQuantity(1);
      Alert.alert("Added to cart", product.title + " has been added to your cart.");
    } catch {
      Alert.alert("Error", "Failed to add item to cart. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const categoriesText =
    product.categories
      ?.filter((c): c is { name: string } => typeof c === "object" && c !== null)
      .map((c) => c.name)
      .filter(Boolean)
      .join(", ") || null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.scrollArea}>
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
          {categoriesText && (
            <Text style={styles.category}>{categoriesText}</Text>
          )}

          <Text style={styles.title}>{product.title}</Text>

          {product.shortDescription && (
            <Text style={styles.description}>{product.shortDescription}</Text>
          )}

          <Text style={styles.price}>{formatPrice(price)}</Text>

          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <HugeiconsIcon
                  icon={MinusSignIcon}
                  size={16}
                  color={colors.foreground}
                  strokeWidth={2}
                />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  size={16}
                  color={colors.foreground}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.stickyBottom}>
        <View style={styles.stickyRow}>
          <View>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.addToCartButton, adding && styles.addToCartDisabled]}
            onPress={handleAddToCart}
            disabled={adding}
          >
            <Text style={styles.addToCartText}>
              {adding ? "Adding..." : "Add to Bag"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollArea: {
    flex: 1,
  },
  image: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: colors.muted,
  },
  imagePlaceholder: {
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
  details: {
    padding: moderateScale(spacing[4]),
    gap: verticalScale(spacing[2]),
    paddingBottom: verticalScale(spacing[16]),
  },
  category: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(10),
    color: colors.mutedForeground,
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
    fontFamily: fonts.sans.semiBold,
    fontSize: moderateScale(fontSizes.xl),
    color: colors.primary,
    marginTop: verticalScale(spacing[2]),
  },
  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: verticalScale(spacing[6]),
    paddingTop: verticalScale(spacing[4]),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  quantityLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[2]),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: verticalScale(spacing[1]),
  },
  quantityButton: {
    width: horizontalScale(32),
    height: verticalScale(32),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.muted,
    borderRadius: radii.sm,
  },
  quantityValue: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.base),
    color: colors.foreground,
    minWidth: horizontalScale(24),
    textAlign: "center",
  },
  stickyBottom: {
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingVertical: verticalScale(spacing[3]),
    paddingBottom: verticalScale(spacing[4]),
  },
  stickyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
  },
  totalPrice: {
    fontFamily: fonts.sans.semiBold,
    fontSize: moderateScale(fontSizes.xl),
    color: colors.foreground,
  },
  addToCartButton: {
    backgroundColor: colors.primary,
    paddingVertical: verticalScale(spacing[3]),
    paddingHorizontal: horizontalScale(spacing[6]),
    borderRadius: radii.full,
  },
  addToCartDisabled: {
    opacity: 0.5,
  },
  addToCartText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.base),
    color: colors.primaryForeground,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.base),
    color: colors.mutedForeground,
  },
});
