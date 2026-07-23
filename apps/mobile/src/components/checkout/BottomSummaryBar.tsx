import { Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";

import { useCart } from "@/providers/Cart";
import { useCurrency } from "@/providers/Currency";
import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";
import { horizontalScale, verticalScale, moderateScale } from "@/constants/responsive";

type Props = {
  onPress: () => void;
};

export function BottomSummaryBar({ onPress }: Props) {
  const { itemCount, subtotal } = useCart();
  const { formatPrice } = useCurrency();

  if (itemCount === 0) return null;

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.left}>
        <Text style={styles.count}>
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </Text>
        <HugeiconsIcon
          icon={ArrowUp01Icon}
          size={16}
          color={colors.mutedForeground}
          strokeWidth={1.5}
        />
      </View>
      <Text style={styles.total}>{formatPrice(subtotal)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.foreground,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingVertical: verticalScale(spacing[3]),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[1]),
  },
  count: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.white,
  },
  total: {
    fontFamily: fonts.sans.semiBold,
    fontSize: moderateScale(fontSizes.lg),
    color: colors.white,
  },
});
