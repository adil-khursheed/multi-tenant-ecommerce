import { StyleSheet, Text, View } from "react-native";

import {
  PackageReceiveIcon,
  Shield01Icon,
  ShippingTruck01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";

import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, spacing } from "@/constants/theme";

const signals = [
  { icon: ShippingTruck01Icon, label: "Free Shipping" },
  { icon: PackageReceiveIcon, label: "Easy Returns" },
  { icon: Shield01Icon, label: "Secure Checkout" },
];

export function TrustSignals() {
  return (
    <View style={styles.container}>
      {signals.map((signal, index) => (
        <View
          key={signal.label}
          style={[
            styles.item,
            index < signals.length - 1 && styles.itemDivider,
          ]}
        >
          <HugeiconsIcon
            icon={signal.icon}
            size={moderateScale(18)}
            color={colors.primary}
          />
          <Text style={styles.label}>{signal.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginTop: verticalScale(spacing[4]),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: verticalScale(spacing[1.5]),
    paddingVertical: verticalScale(spacing[3]),
    paddingHorizontal: horizontalScale(spacing[1]),
  },
  itemDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.border,
  },
  label: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(9),
    color: colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    textAlign: "center",
  },
});
