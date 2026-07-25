import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  Shield01Icon,
  Cash01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";

import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";
import { horizontalScale, verticalScale, moderateScale } from "@/constants/responsive";

type PaymentMethod = "razorpay" | "cod";

type Props = {
  method: PaymentMethod;
  isSelected: boolean;
  onSelect: () => void;
};

const METHODS = [
  {
    id: "razorpay" as const,
    label: "Razorpay",
    description: "Cards, UPI, Netbanking & Wallets",
    Icon: Shield01Icon,
  },
  {
    id: "cod" as const,
    label: "Cash on Delivery",
    description: "Pay on delivery (+₹50 fee)",
    Icon: Cash01Icon,
  },
];

export function PaymentMethodCard({ method, isSelected, onSelect }: Props) {
  const config = METHODS.find((m) => m.id === method);
  if (!config) return null;

  const { label, description, Icon } = config;

  return (
    <Pressable
      style={[styles.card as any, isSelected && styles.cardSelected]}
      onPress={onSelect}
    >
      <View style={styles.radioRow as any}>
        <View style={[styles.radio as any, isSelected && styles.radioSelected]}>
          {isSelected && <View style={styles.radioDot as any} />}
        </View>
        <HugeiconsIcon
          icon={Icon}
          size={20}
          color={isSelected ? colors.foreground : colors.mutedForeground}
          strokeWidth={1.5}
        />
        <View style={styles.textGroup as any}>
          <Text style={[styles.label as any, isSelected && styles.labelSelected]}>
            {label}
          </Text>
          <Text style={styles.description as any}>{description}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: horizontalScale(spacing[4]),
    backgroundColor: colors.card,
  },
  cardSelected: {
    borderColor: colors.foreground,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[3]),
  },
  radio: {
    width: moderateScale(18),
    height: moderateScale(18),
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: colors.foreground,
  },
  radioDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: radii.full,
    backgroundColor: colors.foreground,
  },
  textGroup: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
  },
  labelSelected: {
    fontWeight: "600",
  },
  description: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
  },
});
