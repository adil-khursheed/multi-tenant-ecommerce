import { StyleSheet, View } from "react-native";
import { type DimensionValue } from "react-native";

import { horizontalScale, verticalScale } from "@/constants/responsive";
import { spacing } from "@/constants/theme";

import { Skeleton, skeletonStyles } from "./Skeleton";

export function BannerSkeleton() {
  return (
    <View style={styles.banner}>
      <Skeleton width="100%" height={verticalScale(56)} borderRadius={8} />
    </View>
  );
}

export function HeadingSkeleton({ width = "40%" }: { width?: DimensionValue }) {
  return (
    <View style={styles.heading}>
      <Skeleton width={width} height={verticalScale(20)} style={skeletonStyles.line} />
    </View>
  );
}

export function CarouselSkeleton() {
  const cardWidth = horizontalScale(250);

  return (
    <View style={styles.carousel}>
      {[0, 1, 2].map((i) => (
        <Skeleton
          key={i}
          width={cardWidth}
          height={cardWidth}
          borderRadius={12}
        />
      ))}
    </View>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.gridItem}>
          <Skeleton width="100%" height={verticalScale(170)} borderRadius={0} />
          <Skeleton
            width="90%"
            height={verticalScale(14)}
            style={[skeletonStyles.line, styles.gridLine]}
          />
          <Skeleton
            width="45%"
            height={verticalScale(12)}
            style={[skeletonStyles.line, styles.gridLine]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: "100%",
  },
  heading: {
    width: "100%",
    marginBottom: verticalScale(spacing[4]),
  },
  carousel: {
    flexDirection: "row",
    gap: horizontalScale(spacing[4]),
    overflow: "hidden",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: horizontalScale(spacing[3]),
  },
  gridItem: {
    width: "47%",
    flexGrow: 1,
  },
  gridLine: {
    marginTop: verticalScale(spacing[2]),
  },
});
