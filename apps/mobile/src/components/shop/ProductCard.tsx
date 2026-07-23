import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { Image } from "expo-image";
import { useRouter } from "expo-router";

import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";
import { useCurrency } from "@/providers/Currency";

export type ShopProduct = {
  id: string | number;
  title?: string | null;
  slug?: string | null;
  shortDescription?: string | null;
  priceInINR?: number | null;
  effectivePrice?: number | null;
  discountPercent?: number | null;
  enableVariants?: boolean | null;
  minEffectivePrice?: number | null;
  maxEffectivePrice?: number | null;
  gallery?:
    | {
        image: string | { url: string; [k: string]: unknown };
        id?: string | null;
      }[]
    | null;
  categories?:
    | (string | { name?: string | null; id?: string | number })[]
    | null;
  tenant?:
    | (string | null)
    | { storeName?: string | null; storeSlug?: string | null }
    | null;
  ratings?: { average?: number | null; count?: number | null } | null;
  flags?: {
    isNewArrival?: boolean | null;
    isFeatured?: boolean | null;
    isBestseller?: boolean | null;
    isExclusive?: boolean | null;
  } | null;
};

type ProductCardProps = {
  product: ShopProduct;
  viewMode?: "grid" | "list";
};

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <Text style={[styles.star, filled && styles.starFilled]}>
      {filled ? "★" : "☆"}
    </Text>
  );
}

function StarRatingRow({ rating, count }: { rating: number; count: number }) {
  const fullStars = Math.floor(rating);
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(<StarIcon key={i} filled={i <= fullStars} />);
  }

  return (
    <View style={styles.ratingRow}>
      {stars}
      <Text style={styles.ratingCount}>({count})</Text>
    </View>
  );
}

function PriceDisplay({
  amount,
  originalAmount,
  discountPercent,
  enableVariants,
  minEffectivePrice,
  maxEffectivePrice,
}: {
  amount: number | null | undefined;
  originalAmount: number | null | undefined;
  discountPercent: number | null | undefined;
  enableVariants: boolean | null | undefined;
  minEffectivePrice: number | null | undefined;
  maxEffectivePrice: number | null | undefined;
}) {
  const { formatPrice } = useCurrency();

  if (
    enableVariants &&
    minEffectivePrice != null &&
    maxEffectivePrice != null &&
    minEffectivePrice !== maxEffectivePrice
  ) {
    return (
      <Text style={styles.price}>
        {formatPrice(minEffectivePrice)} - {formatPrice(maxEffectivePrice)}
      </Text>
    );
  }

  const effective = amount ?? originalAmount ?? 0;
  const hasDiscount =
    originalAmount != null && originalAmount > effective && discountPercent;

  return (
    <View style={styles.priceRow}>
      <Text style={styles.price}>{formatPrice(effective)}</Text>
      {hasDiscount && (
        <>
          <Text style={styles.originalPrice}>
            {formatPrice(originalAmount!)}
          </Text>
          <Text style={styles.discountBadge}>{discountPercent}% off</Text>
        </>
      )}
    </View>
  );
}

function getRibbon(
  flags: ShopProduct["flags"],
): "NEW" | "SALE" | "TRENDING" | null {
  if (flags?.isNewArrival) return "NEW";
  if (flags?.isExclusive) return "SALE";
  if (flags?.isBestseller) return "TRENDING";
  return null;
}

function getRibbonStyle(ribbon: string) {
  switch (ribbon) {
    case "NEW":
      return {
        backgroundColor: colors.primary,
        color: colors.primaryForeground,
      };
    case "SALE":
      return { backgroundColor: colors.foreground, color: colors.background };
    case "TRENDING":
      return {
        backgroundColor: colors.accentForeground,
        color: colors.background,
      };
    default:
      return { backgroundColor: colors.muted, color: colors.foreground };
  }
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const router = useRouter();
  const { formatPrice } = useCurrency();

  const {
    title,
    slug,
    gallery,
    categories,
    priceInINR,
    effectivePrice,
    discountPercent,
    ratings,
    tenant,
    shortDescription,
    enableVariants,
    minEffectivePrice,
    maxEffectivePrice,
    flags,
  } = product;

  const image =
    gallery?.[0]?.image && typeof gallery[0].image !== "string"
      ? gallery[0].image
      : null;

  const imageUrl =
    image && typeof image === "object" && "url" in image
      ? `https://right-mayfly-vocal.ngrok-free.app${(image as { url: string }).url}`
      : null;
  console.log(imageUrl);

  const ribbon = getRibbon(flags);
  const categoryName =
    categories?.[0] &&
    typeof categories[0] === "object" &&
    "name" in categories[0]
      ? (categories[0] as { name: string }).name
      : null;

  const tenantName =
    tenant && typeof tenant === "object" && "storeName" in tenant
      ? (tenant as { storeName: string }).storeName
      : null;

  const navigateToProduct = () => {
    router.push(`/(shop)/${slug}`);
  };

  if (viewMode === "list") {
    return (
      <Animated.View style={styles.listContainer}>
        <Pressable style={styles.listRow} onPress={navigateToProduct}>
          <View style={styles.listImageContainer}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.listImage}
                contentFit="cover"
                transition={300}
              />
            ) : (
              <View style={[styles.listImage, styles.listImagePlaceholder]} />
            )}
            {ribbon && (
              <View style={[styles.listRibbon, getRibbonStyle(ribbon)]}>
                <Text
                  style={[
                    styles.ribbonText,
                    { color: getRibbonStyle(ribbon).color },
                  ]}
                >
                  {ribbon}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.listContent}>
            <View style={styles.listBadges}>
              {tenantName && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tenantName}</Text>
                </View>
              )}
              {categoryName && (
                <Text style={styles.categoryLabel}>{categoryName}</Text>
              )}
            </View>

            <Text style={styles.listTitle} numberOfLines={2}>
              {title}
            </Text>

            {shortDescription && (
              <Text style={styles.listDescription} numberOfLines={2}>
                {shortDescription}
              </Text>
            )}

            {ratings &&
              typeof ratings.average === "number" &&
              ratings.count &&
              ratings.count > 0 && (
                <StarRatingRow rating={ratings.average} count={ratings.count} />
              )}

            <PriceDisplay
              amount={effectivePrice}
              originalAmount={priceInINR}
              discountPercent={discountPercent}
              enableVariants={enableVariants}
              minEffectivePrice={minEffectivePrice}
              maxEffectivePrice={maxEffectivePrice}
            />
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={styles.gridContainer}>
      <Pressable onPress={navigateToProduct}>
        <View style={styles.gridImageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.gridImage}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={[styles.gridImage, styles.gridImagePlaceholder]} />
          )}
          {ribbon && (
            <View style={[styles.gridRibbon, getRibbonStyle(ribbon)]}>
              <Text
                style={[
                  styles.ribbonText,
                  { color: getRibbonStyle(ribbon).color },
                ]}
              >
                {ribbon}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.gridContent}>
          {categoryName && (
            <Text style={styles.categoryLabel}>{categoryName}</Text>
          )}

          <Text style={styles.gridTitle} numberOfLines={2}>
            {title}
          </Text>

          {ratings &&
            typeof ratings.average === "number" &&
            ratings.count &&
            ratings.count > 0 && (
              <StarRatingRow rating={ratings.average} count={ratings.count} />
            )}

          <PriceDisplay
            amount={effectivePrice}
            originalAmount={priceInINR}
            discountPercent={discountPercent}
            enableVariants={enableVariants}
            minEffectivePrice={minEffectivePrice}
            maxEffectivePrice={maxEffectivePrice}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flex: 1,
    marginBottom: verticalScale(spacing[6]),
  },
  gridImageContainer: {
    position: "relative",
    aspectRatio: 3 / 4,
    backgroundColor: colors.muted,
    overflow: "hidden",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  gridImagePlaceholder: {
    backgroundColor: colors.muted,
  },
  gridRibbon: {
    position: "absolute",
    top: 0,
    left: 0,
    paddingHorizontal: horizontalScale(spacing[2]),
    paddingVertical: verticalScale(spacing[1]),
  },
  gridContent: {
    marginTop: verticalScale(spacing[3]),
    gap: verticalScale(spacing[1]),
  },
  gridTitle: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
    lineHeight: moderateScale(fontSizes.sm * 1.3),
  },
  listContainer: {
    paddingVertical: verticalScale(spacing[4]),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  listRow: {
    flexDirection: "row",
    gap: horizontalScale(spacing[4]),
  },
  listImageContainer: {
    position: "relative",
    width: horizontalScale(120),
    height: verticalScale(160),
    backgroundColor: colors.muted,
    overflow: "hidden",
    borderRadius: radii.sm,
  },
  listImage: {
    width: "100%",
    height: "100%",
  },
  listImagePlaceholder: {
    backgroundColor: colors.muted,
  },
  listRibbon: {
    position: "absolute",
    top: 0,
    left: 0,
    paddingHorizontal: horizontalScale(spacing[2]),
    paddingVertical: verticalScale(spacing[1]),
  },
  listContent: {
    flex: 1,
    justifyContent: "center",
    gap: verticalScale(spacing[1.5]),
  },
  listBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[2]),
  },
  listTitle: {
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(fontSizes.lg),
    color: colors.foreground,
    lineHeight: moderateScale(fontSizes.lg * 1.3),
  },
  listDescription: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
    lineHeight: moderateScale(fontSizes.sm * 1.4),
  },
  badge: {
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: horizontalScale(spacing[2]),
    paddingVertical: verticalScale(spacing[0.5]),
    borderRadius: radii.sm,
  },
  badgeText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(9),
    color: colors.foreground,
    textTransform: "uppercase",
    letterSpacing: 0.1,
  },
  categoryLabel: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(10),
    color: colors.accentForeground,
    textTransform: "uppercase",
    letterSpacing: 0.1,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[0.5]),
    marginTop: verticalScale(spacing[1]),
  },
  star: {
    fontSize: moderateScale(10),
    color: colors.muted,
  },
  starFilled: {
    color: colors.primary,
  },
  ratingCount: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(10),
    color: colors.mutedForeground,
    marginLeft: horizontalScale(spacing[1]),
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: horizontalScale(spacing[2]),
    marginTop: verticalScale(spacing[1]),
  },
  price: {
    fontFamily: fonts.sans.medium,
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
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(10),
    color: colors.primary,
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: horizontalScale(spacing[1.5]),
    paddingVertical: verticalScale(1),
    borderRadius: radii.sm,
  },
  ribbonText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(9),
    textTransform: "uppercase",
    letterSpacing: 0.1,
  },
});
