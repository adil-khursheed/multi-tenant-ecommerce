import { useEffect } from "react";
import {
  type DimensionValue,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { colors, radii } from "@/constants/theme";

type SkeletonProps = {
  width: DimensionValue;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({
  width,
  height,
  borderRadius = radii.md,
  style,
}: SkeletonProps) {
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
          borderRadius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export const skeletonStyles = StyleSheet.create({
  line: {
    borderRadius: radii.full,
  },
});
