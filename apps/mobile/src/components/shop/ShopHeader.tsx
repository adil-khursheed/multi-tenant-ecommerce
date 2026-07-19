import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";

import { colors, fonts, fontSizes, spacing, radii } from "@/constants/theme";
import { verticalScale, horizontalScale, moderateScale } from "@/constants/responsive";

export type FilterParam = {
  key: string;
  label: string;
};

type ShopHeaderProps = {
  activeFilters: FilterParam[];
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
};

export function ShopHeader({
  activeFilters,
  onRemoveFilter,
  onClearAll,
}: ShopHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Products</Text>

      {activeFilters.length > 0 && (
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {activeFilters.map((filter) => (
              <Pressable
                key={filter.key}
                style={styles.chip}
                onPress={() => onRemoveFilter(filter.key)}
              >
                <Text style={styles.chipText}>{filter.label}</Text>
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={moderateScale(12)}
                  color={colors.background}
                  strokeWidth={1.5}
                />
              </Pressable>
            ))}
            <Pressable style={styles.clearButton} onPress={onClearAll}>
              <Text style={styles.clearText}>Clear All</Text>
            </Pressable>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingTop: verticalScale(spacing[4]),
    paddingBottom: verticalScale(spacing[2]),
  },
  title: {
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(fontSizes["3xl"]),
    color: colors.foreground,
    marginBottom: verticalScale(spacing[2]),
  },
  filtersContainer: {
    marginTop: verticalScale(spacing[2]),
  },
  filtersScroll: {
    gap: horizontalScale(spacing[2]),
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[1.5]),
    backgroundColor: colors.foreground,
    paddingHorizontal: horizontalScale(spacing[3]),
    paddingVertical: verticalScale(spacing[1.5]),
    borderRadius: radii.full,
  },
  chipText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(11),
    color: colors.background,
  },
  clearButton: {
    paddingHorizontal: horizontalScale(spacing[2]),
  },
  clearText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(12),
    color: colors.primary,
  },
});
