import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, fontSizes, spacing } from "@/constants/theme";

type VariantOption = {
  id: string | number;
  label?: string | null;
  value?: string | null;
};

type VariantType = {
  id: string | number;
  name?: string | null;
  label?: string | null;
  options?: {
    docs?: (VariantOption | string | number)[];
  };
};

type Variant = {
  id: string | number;
  inventory?: number | null;
  options?: (string | number | { id: string | number })[];
  effectivePrice?: number | null;
  priceInINR?: number | null;
};

type VariantSelectorProps = {
  variantTypes?: VariantType[] | null;
  variants?: (Variant | string | number)[] | null;
  enableVariants?: boolean | null;
  selectedOptions: Record<string, string>;
  onOptionSelect: (typeName: string, optionId: string) => void;
};

export function VariantSelector({
  variantTypes,
  variants,
  enableVariants,
  selectedOptions,
  onOptionSelect,
}: VariantSelectorProps) {
  const validVariants = useMemo(() => {
    if (!variants) return [];
    return variants.filter(
      (v): v is Variant => typeof v === "object" && v !== null,
    );
  }, [variants]);

  const hasVariants = Boolean(
    enableVariants && validVariants.length > 0 && variantTypes?.length,
  );

  if (!hasVariants || !variantTypes) return null;

  return (
    <View style={styles.container}>
      {variantTypes.map((type) => {
        if (!type || typeof type !== "object") return null;
        if (!type.options?.docs?.length) return null;

        const isColorType = type.name?.toLowerCase() === "color";
        const selectedOptionId = selectedOptions[type.name ?? ""];

        // Find selected option label for color type
        const selectedOptionLabel = isColorType
          ? type.options.docs.find(
              (opt) =>
                typeof opt === "object" && String(opt.id) === selectedOptionId,
            )
          : null;

        return (
          <View key={type.id} style={styles.typeGroup}>
            <View style={styles.typeHeader}>
              <Text style={styles.typeLabel}>{type.label || type.name}</Text>
              {isColorType &&
                selectedOptionLabel &&
                typeof selectedOptionLabel === "object" && (
                  <Text style={styles.selectedLabel}>
                    {selectedOptionLabel.label}
                  </Text>
                )}
            </View>

            <View style={styles.optionsRow}>
              {type.options.docs.map((option) => {
                if (!option || typeof option !== "object") return null;
                const opt = option as VariantOption;
                const isActive = selectedOptionId === String(opt.id);

                // Check availability: does any variant include this option AND have inventory
                const isAvailable = checkOptionAvailability(
                  opt.id,
                  type.name ?? "",
                  selectedOptions,
                  validVariants,
                );

                if (isColorType) {
                  return (
                    <Pressable
                      key={opt.id}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: opt.value || colors.muted },
                        isActive && styles.colorSwatchActive,
                        !isAvailable && styles.colorSwatchUnavailable,
                      ]}
                      onPress={() => {
                        if (isAvailable)
                          onOptionSelect(type.name!, String(opt.id));
                      }}
                      disabled={!isAvailable}
                    >
                      {!isAvailable && (
                        <View style={styles.strikethroughLine} />
                      )}
                    </Pressable>
                  );
                }

                return (
                  <Pressable
                    key={opt.id}
                    style={[
                      styles.textOption,
                      isActive && styles.textOptionActive,
                      !isAvailable && styles.textOptionUnavailable,
                    ]}
                    onPress={() => {
                      if (isAvailable)
                        onOptionSelect(type.name!, String(opt.id));
                    }}
                    disabled={!isAvailable}
                  >
                    {!isAvailable && <View style={styles.textStrikethrough} />}
                    <Text
                      style={[
                        styles.textOptionLabel,
                        isActive && styles.textOptionLabelActive,
                        !isAvailable && styles.textOptionLabelUnavailable,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function checkOptionAvailability(
  optionId: string | number,
  typeName: string,
  selectedOptions: Record<string, string>,
  variants: Variant[],
): boolean {
  const currentOptions = { ...selectedOptions, [typeName]: String(optionId) };
  const optionValues = Object.values(currentOptions);

  const matchingVariant = variants.find((variant) => {
    if (!variant.options || !Array.isArray(variant.options)) return false;
    return variant.options.every((variantOption) => {
      const id =
        typeof variantOption === "object" && variantOption !== null
          ? String(variantOption.id)
          : String(variantOption);
      return optionValues.includes(id);
    });
  });

  if (matchingVariant) {
    return (matchingVariant.inventory ?? 0) > 0;
  }

  // No exact match yet (incomplete selection), default to available
  return true;
}

export function getSelectedVariantId(
  selectedOptions: Record<string, string>,
  variants: (Variant | string | number)[],
): string | null {
  const optionValues = Object.values(selectedOptions);
  if (optionValues.length === 0) return null;

  const validVariants = variants.filter(
    (v): v is Variant => typeof v === "object" && v !== null,
  );

  const matchingVariant = validVariants.find((variant) => {
    if (!variant.options || !Array.isArray(variant.options)) return false;
    return variant.options.every((variantOption) => {
      const id =
        typeof variantOption === "object" && variantOption !== null
          ? String(variantOption.id)
          : String(variantOption);
      return optionValues.includes(id);
    });
  });

  return matchingVariant ? String(matchingVariant.id) : null;
}

const styles = StyleSheet.create({
  container: {
    gap: verticalScale(spacing[4]),
  },
  typeGroup: {
    gap: verticalScale(spacing[2]),
  },
  typeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  typeLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.foreground,
    textTransform: "uppercase",
    letterSpacing: 0.08 * fontSizes.xs,
  },
  selectedLabel: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: horizontalScale(spacing[2]),
  },
  colorSwatch: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorSwatchActive: {
    borderWidth: 2,
    borderColor: colors.primary,
    outlineColor: colors.background,
    // React Native doesn't support outline offset, use a wrapper approach or just thicker border
  },
  colorSwatchUnavailable: {
    opacity: 0.5,
  },
  strikethroughLine: {
    position: "absolute",
    top: "50%",
    left: -2,
    right: -2,
    height: 1.5,
    backgroundColor: colors.error,
    transform: [{ rotate: "45deg" }],
  },
  textOption: {
    minWidth: moderateScale(52),
    height: moderateScale(40),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: horizontalScale(spacing[3]),
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  textOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  textOptionUnavailable: {
    opacity: 0.5,
    backgroundColor: colors.muted,
    borderColor: colors.border,
  },
  textOptionLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.foreground,
  },
  textOptionLabelActive: {
    color: colors.primaryForeground,
  },
  textOptionLabelUnavailable: {
    color: colors.mutedForeground,
  },
  textStrikethrough: {
    position: "absolute",
    top: "50%",
    left: 4,
    right: 4,
    height: 1,
    backgroundColor: colors.border,
    transform: [{ rotate: "-25deg" }],
  },
});
