import { useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ArrowLeft02Icon,
  MinusSignIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";

import { CustomerReviews } from "@/components/product/CustomerReviews";
import { getImageUrl, ImageGallery } from "@/components/product/ImageGallery";
import { ProductDetailsSection } from "@/components/product/ProductDetailsSection";
import { ProductPrice } from "@/components/product/ProductPrice";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { StockIndicator } from "@/components/product/StockIndicator";
import { TrustSignals } from "@/components/product/TrustSignals";
import {
  getSelectedVariantId,
  VariantSelector,
} from "@/components/product/VariantSelector";
import { VendorCard } from "@/components/product/VendorCard";
import { WishlistButton } from "@/components/product/WishlistButton";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, fontSizes, shadows, spacing } from "@/constants/theme";
import { useCart } from "@/providers/Cart";
import { useCurrency } from "@/providers/Currency";
import { useTRPC } from "@/utils/api";

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const trpc = useTRPC();
  const { formatPrice } = useCurrency();
  const { addItem } = useCart();
  const { top } = useSafeAreaInsets();
  const { bottom } = useSafeAreaInsets();

  const scrollY = useSharedValue(0);
  const detailsLayoutY = useSharedValue(0);
  const titleLayoutY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const threshold = detailsLayoutY.value + titleLayoutY.value;
    const opacity = interpolate(
      scrollY.value,
      [0, threshold],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  const { data, isLoading } = useQuery(
    trpc.product.getProductBySlug.queryOptions({ slug: String(slug) }),
  );

  const product = data?.product;
  const reviews = data?.reviews?.docs ?? [];
  const sizeGuide = data?.sizeGuide ?? null;

  // Resolve selected variant
  const selectedVariantId = useMemo(() => {
    if (!product?.variants?.docs) return null;
    return getSelectedVariantId(selectedOptions, product.variants.docs);
  }, [selectedOptions, product]);

  const selectedVariant = useMemo(() => {
    if (!selectedVariantId || !product?.variants?.docs) return null;
    return (
      product.variants.docs.find(
        (v: any) =>
          typeof v === "object" &&
          v !== null &&
          String(v.id) === selectedVariantId,
      ) ?? null
    );
  }, [selectedVariantId, product]);

  // Price computation
  const priceData = useMemo(() => {
    if (!product) return { effectivePrice: 0, basePrice: 0 };
    const base = product.priceInINR ?? 0;
    const effective = product.effectivePrice ?? base;
    return { effectivePrice: effective, basePrice: base };
  }, [product]);

  // Stock computation
  const stockQuantity = useMemo(() => {
    if (!product) return 0;
    if (product.enableVariants && selectedVariant) {
      return (selectedVariant as any).inventory ?? 0;
    }
    return product.inventory ?? 0;
  }, [product, selectedVariant]);

  const maxQuantity = useMemo(() => {
    if (!product) return 0;
    if (product.enableVariants && selectedVariant) {
      return (selectedVariant as any).inventory ?? 0;
    }
    return product.inventory ?? 0;
  }, [product, selectedVariant]);

  const isAtMax = maxQuantity > 0 && quantity >= maxQuantity;

  const needsVariantSelection = !!(product?.enableVariants && !selectedVariant);

  const handleOptionSelect = useCallback(
    (typeName: string, optionId: string) => {
      setSelectedOptions((prev) => {
        const next = { ...prev };
        if (next[typeName] === optionId) {
          delete next[typeName];
        } else {
          next[typeName] = optionId;
        }
        return next;
      });
    },
    [],
  );

  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    setAdding(true);
    try {
      const imageUrl = getImageUrl(product.gallery?.[0]?.image);
      await addItem({
        productId: String(product.id),
        productTitle: product.title ?? "Product",
        productSlug: product.slug ?? "",
        productImageUrl: imageUrl ?? null,
        priceInINR: selectedVariant
          ? ((selectedVariant as any).effectivePrice ??
            (selectedVariant as any).priceInINR ??
            priceData.effectivePrice)
          : priceData.effectivePrice,
      });
      setQuantity(1);
      Alert.alert(
        "Added to cart",
        `${product.title} has been added to your cart.`,
      );
    } catch {
      Alert.alert("Error", "Failed to add item to cart. Please try again.");
    } finally {
      setAdding(false);
    }
  }, [product, selectedVariant, priceData, addItem]);

  const handleImagePress = useCallback(
    (index: number) => {
      if (!product?.gallery) return;
      const imageUrls = product.gallery
        .map((item: any) => getImageUrl(item.image))
        .filter(Boolean);
      if (imageUrls.length === 0) return;
      router.push({
        pathname: "/(modals)/gallery" as any,
        params: {
          images: JSON.stringify(imageUrls),
          index: String(index),
        },
      });
    },
    [product, router],
  );

  const currentPrice = useMemo(() => {
    if (selectedVariant) {
      return (
        (selectedVariant as any).effectivePrice ??
        (selectedVariant as any).priceInINR ??
        priceData.effectivePrice
      );
    }
    return priceData.effectivePrice;
  }, [selectedVariant, priceData]);

  const totalPrice = currentPrice * quantity;

  const categoriesText = useMemo(() => {
    if (!product?.categories) return null;
    return (
      product.categories
        ?.filter(
          (c: any): c is { name: string } =>
            typeof c === "object" && c !== null,
        )
        .map((c: any) => c.name)
        .filter(Boolean)
        .join(", ") || null
    );
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product?.relatedProducts) return [];
    return product.relatedProducts
      .filter((rp: any) => typeof rp === "object" && rp !== null)
      .slice(0, 4);
  }, [product]);

  // --- Loading state ---
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.imageSkeleton} />
        <View style={styles.contentSkeleton}>
          <View style={[styles.skeletonLine, { width: "40%" }]} />
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: "60%" }]} />
          <View style={[styles.skeletonLine, { width: "50%" }]} />
        </View>
      </View>
    );
  }

  // --- Empty state ---
  if (!product) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Product not found</Text>
      </View>
    );
  }

  // Tenant
  const tenant =
    typeof product.tenant === "object" && product.tenant !== null
      ? product.tenant
      : null;

  // Ratings
  const averageRating = product.ratings?.average ?? 0;
  const reviewCount = product.ratings?.count ?? 0;

  // Variant types
  const variantTypes = product.variantTypes ?? null;
  const variants = product.variants?.docs ?? null;

  return (
    <View style={styles.wrapper}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.animatedHeader,
          {
            paddingTop: top,
          },
          headerAnimatedStyle,
        ]}
      >
        <TouchableOpacity
          style={styles.headerBack}
          onPress={() => router.back()}
        >
          <HugeiconsIcon
            icon={ArrowLeft02Icon}
            size={moderateScale(22)}
            color={colors.foreground}
            strokeWidth={2}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.title}
        </Text>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollIndicatorInsets={{ bottom: 70 }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Image Gallery */}
        <ImageGallery
          gallery={(product.gallery ?? []) as any}
          isBestseller={product.flags?.isBestseller}
          onImagePress={handleImagePress}
        />

        {/* Product Info */}
        <View
          style={styles.details}
          onLayout={(e) => {
            detailsLayoutY.value = e.nativeEvent.layout.y;
          }}
        >
          {categoriesText && (
            <Text style={styles.category}>{categoriesText}</Text>
          )}

          <View
            onLayout={(e) => {
              titleLayoutY.value = e.nativeEvent.layout.y;
            }}
          >
            <Text style={styles.title}>{product.title}</Text>
          </View>

          {product.shortDescription && (
            <Text style={styles.shortDescription}>
              {product.shortDescription}
            </Text>
          )}

          {/* Rating */}
          {reviewCount > 0 && (
            <View style={styles.ratingRow}>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingNumber}>
                  {averageRating.toFixed(1)}
                </Text>
                <Text style={styles.ratingStar}>{"\u2605"}</Text>
              </View>
              <Text style={styles.reviewCount}>{reviewCount} Reviews</Text>
            </View>
          )}

          <View style={styles.separator} />

          {/* Price */}
          <ProductPrice
            effectivePrice={product.effectivePrice}
            basePrice={product.priceInINR}
            discountPercent={product.discountPercent}
            minEffectivePrice={product.minEffectivePrice}
            maxEffectivePrice={product.maxEffectivePrice}
            enableVariants={product.enableVariants}
            selectedVariant={selectedVariant as any}
          />
          <Text style={styles.taxNote}>Inclusive of all taxes</Text>

          {/* Variant Selector */}
          <VariantSelector
            variantTypes={variantTypes}
            variants={variants}
            enableVariants={product.enableVariants}
            selectedOptions={selectedOptions}
            onOptionSelect={handleOptionSelect}
          />

          {/* Stock Indicator */}
          {product.enableVariants && selectedVariant ? (
            <StockIndicator inventory={stockQuantity} />
          ) : !product.enableVariants ? (
            <StockIndicator inventory={stockQuantity} />
          ) : null}

          {/* Quantity */}
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
                style={[styles.quantityButton, isAtMax && { opacity: 0.4 }]}
                onPress={() => {
                  if (!isAtMax) setQuantity(quantity + 1);
                }}
                disabled={isAtMax}
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

          {/* Add to Bag + Wishlist */}
          <View style={styles.cartRow}>
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                adding && styles.addToCartDisabled,
                stockQuantity === 0 &&
                  !needsVariantSelection &&
                  styles.addToCartDisabled,
              ]}
              onPress={handleAddToCart}
              disabled={
                adding || (stockQuantity === 0 && !needsVariantSelection)
              }
            >
              <Text style={styles.addToCartText}>
                {adding ? "Adding..." : "Add to Bag"}
              </Text>
            </TouchableOpacity>
            {product && (
              <WishlistButton
                productId={String(product.id)}
                size={20}
                style={styles.wishlistButton}
              />
            )}
          </View>

          {/* Trust Signals */}
          <TrustSignals />
        </View>

        {/* Product Details Accordion */}
        <View style={styles.sectionPadding}>
          <ProductDetailsSection
            description={product.description}
            countryOfOrigin={product.countryOfOrigin}
            careInstructions={product.careInstructions}
            materials={product.materials as any}
            sizeGuide={sizeGuide as any}
            tenant={tenant as any}
          />
        </View>

        {/* Vendor Card */}
        <View style={styles.sectionPadding}>
          <VendorCard tenant={tenant as any} />
        </View>

        {/* Customer Reviews */}
        <View style={styles.sectionPadding}>
          <CustomerReviews
            reviews={reviews as any}
            averageRating={averageRating}
            reviewCount={reviewCount}
          />
        </View>

        {/* Related Products */}
        <View style={styles.sectionPadding}>
          <RelatedProducts
            products={relatedProducts as any}
            onShopAll={() => router.push("/shop")}
          />
          <View style={styles.bottomSpacer} />
        </View>
      </Animated.ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={[styles.stickyBottom, { paddingBottom: bottom }]}>
        <View style={styles.stickyRow}>
          <View style={styles.stickyInfo}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.stickyCartButton,
              (adding || (stockQuantity === 0 && !needsVariantSelection)) &&
                styles.addToCartDisabled,
            ]}
            onPress={handleAddToCart}
            disabled={adding || (stockQuantity === 0 && !needsVariantSelection)}
          >
            <Text style={styles.stickyCartText}>
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
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[3]),
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingBottom: verticalScale(spacing[3]),
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerBack: {
    width: moderateScale(40),
    height: moderateScale(40),
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.base),
    color: colors.foreground,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(spacing[20]) + verticalScale(70),
  },
  details: {
    padding: moderateScale(spacing[4]),
    gap: verticalScale(spacing[2]),
  },
  sectionPadding: {
    paddingHorizontal: moderateScale(spacing[4]),
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
  shortDescription: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
    lineHeight: moderateScale(fontSizes.sm * 1.5),
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[3]),
    marginTop: verticalScale(spacing[1]),
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[1]),
    backgroundColor: colors.muted,
    paddingHorizontal: horizontalScale(spacing[2]),
    paddingVertical: verticalScale(spacing[1]),
  },
  ratingNumber: {
    fontFamily: fonts.sans.semiBold,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.foreground,
  },
  ratingStar: {
    fontSize: moderateScale(fontSizes.xs),
    color: colors.primary,
  },
  reviewCount: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
    textDecorationLine: "underline",
    textDecorationColor: colors.mutedForeground,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: verticalScale(spacing[2]),
  },
  taxNote: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(10),
    color: colors.mutedForeground,
  },
  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: verticalScale(spacing[3]),
    paddingTop: verticalScale(spacing[3]),
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
    padding: verticalScale(spacing[1]),
  },
  quantityButton: {
    width: horizontalScale(32),
    height: verticalScale(32),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.muted,
  },
  quantityValue: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.base),
    color: colors.foreground,
    minWidth: horizontalScale(24),
    textAlign: "center",
  },
  cartRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[3]),
    marginTop: verticalScale(spacing[3]),
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: verticalScale(spacing[3]),
    alignItems: "center",
    justifyContent: "center",
  },
  addToCartDisabled: {
    opacity: 0.5,
  },
  addToCartText: {
    fontFamily: fonts.sans.semiBold,
    fontSize: moderateScale(fontSizes.base),
    color: colors.primaryForeground,
  },
  wishlistButton: {
    width: moderateScale(48),
    height: moderateScale(48),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  stickyBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingVertical: verticalScale(spacing[3]),
    ...shadows.md,
  },
  stickyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: horizontalScale(spacing[3]),
  },
  stickyInfo: {
    flex: 1,
  },
  totalLabel: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
  },
  totalPrice: {
    fontFamily: fonts.sans.semiBold,
    fontSize: moderateScale(fontSizes.lg),
    color: colors.foreground,
  },
  stickyCartButton: {
    backgroundColor: colors.primary,
    paddingVertical: verticalScale(spacing[3]),
    paddingHorizontal: horizontalScale(spacing[6]),
  },
  stickyCartText: {
    fontFamily: fonts.sans.semiBold,
    fontSize: moderateScale(fontSizes.base),
    color: colors.primaryForeground,
  },
  bottomSpacer: {
    height: verticalScale(spacing[8]),
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
