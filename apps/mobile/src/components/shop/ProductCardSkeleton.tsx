import { StyleSheet, View } from "react-native";

import { Skeleton } from "@/components/blocks/skeletons/Skeleton";
import { horizontalScale, verticalScale } from "@/constants/responsive";
import { colors, spacing } from "@/constants/theme";

type ProductCardSkeletonProps = {
  viewMode?: "grid" | "list";
};

export function ProductCardSkeleton({
  viewMode = "grid",
}: ProductCardSkeletonProps) {
  if (viewMode === "list") {
    return (
      <View style={styles.listContainer}>
        <Skeleton
          width={horizontalScale(120)}
          height={verticalScale(160)}
          borderRadius={0}
          style={styles.listImage}
        />
        <View style={styles.listContent}>
          <View style={styles.listBadges}>
            <Skeleton
              width={horizontalScale(50)}
              height={verticalScale(14)}
              borderRadius={4}
              style={styles.listBadge}
            />
            <Skeleton
              width={horizontalScale(40)}
              height={verticalScale(10)}
              borderRadius={4}
            />
          </View>
          <Skeleton
            width="85%"
            height={verticalScale(18)}
            borderRadius={9999}
            style={styles.content}
          />
          <Skeleton
            width="60%"
            height={verticalScale(12)}
            borderRadius={9999}
            style={styles.content}
          />
          <Skeleton
            width="35%"
            height={verticalScale(10)}
            borderRadius={9999}
            style={styles.content}
          />
          <Skeleton
            width="45%"
            height={verticalScale(14)}
            borderRadius={9999}
            style={styles.content}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.gridContainer}>
      <Skeleton width="100%" height={verticalScale(170)} borderRadius={0} />
      <View style={styles.gridContentWrapper}>
        <Skeleton
          width="35%"
          height={verticalScale(8)}
          borderRadius={9999}
          style={styles.content}
        />
        <Skeleton
          width="90%"
          height={verticalScale(14)}
          borderRadius={9999}
          style={styles.content}
        />
        <Skeleton
          width="35%"
          height={verticalScale(10)}
          borderRadius={9999}
          style={styles.content}
        />
        <Skeleton
          width="50%"
          height={verticalScale(14)}
          borderRadius={9999}
          style={styles.content}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flex: 1,
    marginBottom: verticalScale(spacing[6]),
  },
  gridContentWrapper: {
    marginTop: verticalScale(spacing[3]),
    gap: verticalScale(spacing[1]),
  },
  content: {
    borderRadius: 9999,
  },
  listContainer: {
    flexDirection: "row",
    paddingVertical: verticalScale(spacing[4]),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: horizontalScale(spacing[4]),
  },
  listImage: {},
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
  listBadge: {},
});
