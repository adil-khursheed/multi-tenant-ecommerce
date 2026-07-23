import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";
import { horizontalScale, verticalScale, moderateScale } from "@/constants/responsive";

type Props = TextInputProps & {
  label: string;
  required?: boolean;
  error?: string;
};

export function CheckoutInput({
  label,
  required,
  error,
  style,
  ...props
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> •</Text> : null}
      </Text>
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={colors.mutedForeground}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: verticalScale(spacing[1]),
  },
  label: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.foreground,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  required: {
    color: colors.primary,
  },
  input: {
    height: verticalScale(48),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.card,
    paddingHorizontal: horizontalScale(spacing[3]),
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
  },
  inputError: {
    borderColor: colors.destructive,
  },
  error: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.destructive,
  },
});
