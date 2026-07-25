import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { horizontalScale, moderateScale } from "@/constants/responsive";
import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";

type Props = {
  inventory: number;
};

export function StockIndicator({ inventory }: Props) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (inventory < 10 && inventory > 0) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 800 }),
          withTiming(1, { duration: 800 }),
        ),
        -1,
        false,
      );
    } else if (inventory === 0) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 800 }),
          withTiming(1, { duration: 800 }),
        ),
        -1,
        false,
      );
    }

    return () => {
      cancelAnimation(pulse);
    };
  }, [inventory, pulse]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  if (inventory >= 10) {
    return (
      <View style={styles.container}>
        <View style={[styles.dot, styles.dotSuccess]} />
        <Text style={[styles.text, styles.textSuccess]}>In Stock</Text>
      </View>
    );
  }

  if (inventory > 0) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.dot, styles.dotWarning, dotStyle]} />
        <Text style={[styles.text, styles.textWarning]}>
          Only {inventory} left in stock
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, styles.dotError, dotStyle]} />
      <Text style={[styles.text, styles.textError]}>Out of stock</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[1.5]),
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
  },
  dotSuccess: {
    backgroundColor: colors.success,
  },
  dotWarning: {
    backgroundColor: colors.warning,
  },
  dotError: {
    backgroundColor: colors.error,
  },
  text: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
  },
  textSuccess: {
    color: colors.success,
  },
  textWarning: {
    color: colors.warning,
  },
  textError: {
    color: colors.error,
  },
});
