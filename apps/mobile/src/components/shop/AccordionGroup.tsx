import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";

import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, fontSizes, spacing } from "@/constants/theme";

type AccordionGroupProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
};

export function AccordionGroup({
  title,
  children,
  defaultOpen = true,
  icon,
}: AccordionGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const rotation = useSharedValue(defaultOpen ? 0 : -90);

  const toggle = () => {
    setIsOpen((prev) => {
      rotation.value = withTiming(prev ? -90 : 0, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
      return !prev;
    });
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <Pressable style={styles.header} onPress={toggle}>
        <View style={styles.titleRow}>
          {icon}
          <Text style={styles.title}>{title}</Text>
        </View>
        <Animated.View style={chevronStyle}>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={moderateScale(14)}
            color={colors.foreground}
          />
        </Animated.View>
      </Pressable>
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(spacing[6]),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: verticalScale(spacing[2]),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    marginBottom: verticalScale(spacing[4]),
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[2]),
  },
  title: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.foreground,
    textTransform: "uppercase",
    letterSpacing: 0.08 * fontSizes.xs,
  },
  content: {
    gap: verticalScale(spacing[2]),
  },
});
