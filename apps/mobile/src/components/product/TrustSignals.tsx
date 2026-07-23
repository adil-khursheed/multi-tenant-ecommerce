import { StyleSheet, Text, View } from "react-native";

import {
  ShippingTruck01Icon,
  PackageReceiveIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";

import { colors, fonts, spacing, radii } from "@/constants/theme";
import { moderateScale, horizontalScale, verticalScale } from "@/constants/responsive";

const signals = [
  { icon: ShippingTruck01Icon, label: "Free Shipping" },
  { icon: PackageReceiveIcon, label: "Easy Returns" },
  { icon: Shield01Icon, label: "Secure Checkout" },
];

export function TrustSignals() {
  return (
    <View style={styles.container}>
      {signals.map((signal) => (
        <View key={signal.label} style={styles.item}>
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
    gap: horizontalScale(spacing[2]),
    marginTop: verticalScale(spacing[4]),
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: verticalScale(spacing[1.5]),
    paddingVertical: verticalScale(spacing[3]),
    backgroundColor: `${colors.muted}80`,
    borderRadius: radii.sm,
  },
  label: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(9),
    color: colors.foreground,
    textTransform: "uppercase",
    letterSpacing: 0.08,
    textAlign: "center",
  },
});
