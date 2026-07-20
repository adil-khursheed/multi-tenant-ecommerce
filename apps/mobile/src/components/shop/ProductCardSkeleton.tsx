import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, radii, spacing } from "@/constants/theme";

type ProductCardSkeletonProps = {
  viewMode?: "grid" | "list";
};

function SkeletonRect({
  width,
  height,
  style,
}: {
  width: number | string;
  height: number;
  style?: object;
}) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 800,
          easing: Easing.inOut(Easing.ease),
        }),
        withDelay(
          200,
          withTiming(0.4, {
            duration: 800,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
      ),
      -1,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: colors.muted,
          borderRadius: moderateScale(2),
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function ProductCardSkeleton({
  viewMode = "grid",
}: ProductCardSkeletonProps) {
  if (viewMode === "list") {
    return (
      <View style={styles.listContainer}>
        <SkeletonRect
          width={horizontalScale(120)}
          height={verticalScale(160)}
          style={styles.gridImage}
        />
        <View style={styles.listContent}>
          <View style={styles.listBadges}>
            <SkeletonRect
              width={horizontalScale(50)}
              height={verticalScale(14)}
              style={styles.listBadge}
            />
            <SkeletonRect
              width={horizontalScale(40)}
              height={verticalScale(10)}
            />
          </View>
          <SkeletonRect width="85%" height={verticalScale(18)} />
          <SkeletonRect width="60%" height={verticalScale(12)} />
          <SkeletonRect width="35%" height={verticalScale(10)} />
          <SkeletonRect width="45%" height={verticalScale(14)} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.gridContainer}>
      <SkeletonRect width="100%" height={0} style={styles.gridImage} />
      <View style={styles.gridContent}>
        <SkeletonRect width="35%" height={verticalScale(8)} />
        <SkeletonRect width="90%" height={verticalScale(14)} />
        <SkeletonRect width="35%" height={verticalScale(10)} />
        <SkeletonRect width="50%" height={verticalScale(14)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flex: 1,
    marginBottom: verticalScale(spacing[6]),
  },
  gridImage: {
    aspectRatio: 3 / 4,
    borderRadius: 0,
  },
  gridContent: {
    marginTop: verticalScale(spacing[3]),
    gap: verticalScale(spacing[1]),
  },
  listContainer: {
    flexDirection: "row",
    paddingVertical: verticalScale(spacing[4]),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: horizontalScale(spacing[4]),
  },
  listImage: {
    borderRadius: radii.sm,
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
  listBadge: {
    borderRadius: radii.sm,
  },
});
