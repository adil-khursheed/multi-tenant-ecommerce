import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";
import { horizontalScale, verticalScale, moderateScale } from "@/constants/responsive";

type AddressData = {
  firstName: string;
  lastName: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
};

type Props = {
  address: AddressData & { id?: string };
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function AddressCard({ address, isSelected, onSelect, onEdit, onDelete }: Props) {
  return (
    <Pressable
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onSelect}
    >
      <View style={styles.header}>
        <View style={styles.radioRow}>
          <View style={[styles.radio, isSelected && styles.radioSelected]}>
            {isSelected && <View style={styles.radioDot} />}
          </View>
          <Text style={styles.name}>
            {address.firstName} {address.lastName}
          </Text>
        </View>
        {isSelected && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        )}
      </View>

      <Text style={styles.addressText}>
        {address.addressLine1}
        {address.addressLine2 ? `\n${address.addressLine2}` : ""}
        {"\n"}
        {address.city}, {address.state ? `${address.state} ` : ""}
        {address.postalCode}
        {"\n"}
        {address.country}
      </Text>

      {address.phone ? <Text style={styles.phone}>{address.phone}</Text> : null}

      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit ? (
            <Pressable onPress={onEdit}>
              <Text style={styles.editButton}>Edit</Text>
            </Pressable>
          ) : null}
          {onDelete ? (
            <Pressable onPress={onDelete}>
              <Text style={styles.deleteButton}>Remove</Text>
            </Pressable>
          ) : null}
        </View>
      )}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(spacing[2]),
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[2]),
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
  name: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
  },
  defaultBadge: {
    backgroundColor: colors.muted,
    paddingHorizontal: horizontalScale(spacing[2]),
    paddingVertical: verticalScale(spacing[0.5]),
  },
  defaultBadgeText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(10),
    color: colors.foreground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addressText: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
    lineHeight: moderateScale(fontSizes.sm * 1.5),
    marginBottom: verticalScale(spacing[2]),
  },
  phone: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.foreground,
    marginBottom: verticalScale(spacing[2]),
  },
  actions: {
    flexDirection: "row",
    gap: horizontalScale(spacing[4]),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: verticalScale(spacing[2]),
  },
  editButton: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.primary,
  },
  deleteButton: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
  },
});
