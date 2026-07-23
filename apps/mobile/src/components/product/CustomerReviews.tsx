import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, fontSizes, spacing, radii } from "@/constants/theme";
import { moderateScale, horizontalScale, verticalScale } from "@/constants/responsive";

type Review = {
  id: string | number;
  rating: number;
  title?: string | null;
  description?: string | null;
  createdAt?: string | null;
  user?:
    | { name?: string | null; [k: string]: unknown }
    | string
    | null;
};

type CustomerReviewsProps = {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
};

function StarIcon({ filled, size = 12 }: { filled: boolean; size?: number }) {
  return (
    <Text
      style={[
        styles.starIcon,
        { fontSize: moderateScale(size) },
        filled && styles.starIconFilled,
      ]}
    >
      {filled ? "\u2605" : "\u2606"}
    </Text>
  );
}

function StarRatingDisplay({
  rating,
  maxStars = 5,
  size = 12,
}: {
  rating: number;
  maxStars?: number;
  size?: number;
}) {
  const fullStars = Math.floor(rating);
  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    stars.push(<StarIcon key={i} filled={i <= fullStars} size={size} />);
  }
  return <View style={styles.starsRow}>{stars}</View>;
}

function DistributionBar({ count, total, stars }: { count: number; total: number; stars: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <View style={styles.distributionRow}>
      <Text style={styles.distributionStars}>{stars}</Text>
      <StarIcon filled size={10} />
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.distributionCount}>{count}</Text>
    </View>
  );
}

export function CustomerReviews({
  reviews,
  averageRating,
  reviewCount,
}: CustomerReviewsProps) {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((review) => {
    const rounded = Math.round(review.rating);
    if (rounded >= 1 && rounded <= 5) {
      distribution[rounded as keyof typeof distribution]++;
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Customer Reviews</Text>
          <Text style={styles.subtitle}>
            Based on {reviewCount} reviews
          </Text>
        </View>
      </View>

      <View style={styles.summarySection}>
        <View style={styles.ratingBig}>
          <Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>
          <View>
            <StarRatingDisplay rating={averageRating} maxStars={5} size={18} />
            <Text style={styles.ratingCount}>{reviewCount} Ratings</Text>
          </View>
        </View>

        <View style={styles.distribution}>
          {[5, 4, 3, 2, 1].map((stars) => (
            <DistributionBar
              key={stars}
              stars={stars}
              count={distribution[stars as keyof typeof distribution]}
              total={reviewCount}
            />
          ))}
        </View>
      </View>

      {reviews.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No reviews yet. Be the first to review this product!
          </Text>
        </View>
      ) : (
        <View style={styles.reviewsList}>
          {reviews.map((review, i) => {
            const userName =
              typeof review.user === "object" && review.user !== null
                ? review.user.name || "Anonymous User"
                : "Anonymous User";

            const initial = userName.substring(0, 1).toUpperCase();

            return (
              <View key={review.id}>
                {i > 0 && <View style={styles.separator} />}
                <View style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{initial}</Text>
                    </View>
                    <View>
                      <Text style={styles.userName}>{userName}</Text>
                      <Text style={styles.reviewDate}>
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : ""}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.reviewBody}>
                    <StarRatingDisplay rating={review.rating} maxStars={5} size={12} />
                    {review.title ? (
                      <Text style={styles.reviewTitle}>{review.title}</Text>
                    ) : null}
                    {review.description ? (
                      <Text style={styles.reviewDescription}>
                        {review.description}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: verticalScale(spacing[8]),
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: verticalScale(spacing[5]),
  },
  heading: {
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(fontSizes["2xl"]),
    color: colors.foreground,
    marginBottom: verticalScale(spacing[1]),
  },
  subtitle: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
  },
  summarySection: {
    gap: verticalScale(spacing[5]),
    marginBottom: verticalScale(spacing[6]),
  },
  ratingBig: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[4]),
  },
  ratingNumber: {
    fontFamily: fonts.serif.bold,
    fontSize: moderateScale(fontSizes["5xl"]),
    color: colors.foreground,
  },
  starsRow: {
    flexDirection: "row",
    gap: horizontalScale(2),
  },
  starIcon: {
    color: colors.muted,
  },
  starIconFilled: {
    color: colors.primary,
  },
  ratingCount: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
    marginTop: verticalScale(2),
  },
  distribution: {
    gap: verticalScale(spacing[2]),
  },
  distributionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[2]),
  },
  distributionStars: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.foreground,
    width: moderateScale(12),
    textAlign: "right",
  },
  barTrack: {
    flex: 1,
    height: moderateScale(8),
    backgroundColor: colors.muted,
    borderRadius: radii.sm,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
  },
  distributionCount: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
    width: moderateScale(24),
    textAlign: "right",
  },
  emptyState: {
    paddingVertical: verticalScale(spacing[8]),
    alignItems: "center",
    backgroundColor: `${colors.muted}30`,
    borderRadius: radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${colors.border}50`,
  },
  emptyText: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
    textAlign: "center",
  },
  reviewsList: {
    gap: 0,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: verticalScale(spacing[4]),
  },
  reviewCard: {
    gap: verticalScale(spacing[3]),
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[3]),
  },
  avatar: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  avatarText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
  },
  userName: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
  },
  reviewDate: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(10),
    color: colors.mutedForeground,
  },
  reviewBody: {
    gap: verticalScale(spacing[1.5]),
    paddingLeft: horizontalScale(48),
  },
  reviewTitle: {
    fontFamily: fonts.sans.semiBold,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
  },
  reviewDescription: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
    lineHeight: moderateScale(fontSizes.sm * 1.5),
  },
});
