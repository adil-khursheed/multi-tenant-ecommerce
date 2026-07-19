import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";

import { colors, spacing } from "@/constants/theme";
import { verticalScale, horizontalScale, moderateScale } from "@/constants/responsive";

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
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withDelay(200, withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) })),
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

export function ProductCardSkeleton({ viewMode = "grid" }: ProductCardSkeletonProps) {
  if (viewMode === "list") {
    return (
      <View style={styles.listContainer}>
        <SkeletonRect width={horizontalScale(120)} height={verticalScale(160)} style={styles.listImage} />
        <View style={styles.listContent}>
          <SkeletonRect width="30%" height={verticalScale(10)} />
          <SkeletonRect width="80%" height={verticalScale(16)} />
          <SkeletonRect width="60%" height={verticalScale(12)} />
          <SkeletonRect width="40%" height={verticalScale(14)} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.gridContainer}>
      <SkeletonRect width="100%" height={verticalScale(200)} />
      <View style={styles.gridContent}>
        <SkeletonRect width="40%" height={verticalScale(8)} />
        <SkeletonRect width="90%" height={verticalScale(14)} />
        <SkeletonRect width="30%" height={verticalScale(10)} />
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
  gridContent: {
    marginTop: verticalScale(spacing[3]),
    gap: verticalScale(spacing[1.5]),
  },
  listContainer: {
    flexDirection: "row",
    paddingVertical: verticalScale(spacing[4]),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: horizontalScale(spacing[4]),
  },
  listImage: {
    borderRadius: moderateScale(2),
  },
  listContent: {
    flex: 1,
    justifyContent: "center",
    gap: verticalScale(spacing[2]),
  },
});
