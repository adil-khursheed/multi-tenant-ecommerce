import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  ArrowDown01Icon,
  FilterIcon,
  GridViewIcon,
  Menu01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";

import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, fontSizes, spacing } from "@/constants/theme";

type FilterBarProps = {
  activeFilterCount: number;
  totalProducts: number;
  viewMode: "grid" | "list";
  currentSortTitle: string;
  onFilterPress: () => void;
  onSortPress: () => void;
  onViewModeChange: (mode: "grid" | "list") => void;
};

export function FilterBar({
  activeFilterCount,
  totalProducts,
  viewMode,
  currentSortTitle,
  onFilterPress,
  onSortPress,
  onViewModeChange,
}: FilterBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <Pressable style={styles.filterButton} onPress={onFilterPress}>
          <HugeiconsIcon
            icon={FilterIcon}
            size={moderateScale(16)}
            color={colors.foreground}
            strokeWidth={1.5}
          />
          <Text style={styles.buttonText}>
            Filters
            {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </Text>
        </Pressable>

        <Pressable style={styles.sortButton} onPress={onSortPress}>
          <Text style={styles.buttonText}>Sort</Text>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={moderateScale(16)}
            color={colors.foreground}
            strokeWidth={1.5}
          />
        </Pressable>
      </View>

      <View style={styles.controlsRow}>
        <Text style={styles.resultCount}>
          {totalProducts} {totalProducts === 1 ? "Product" : "Products"}
        </Text>

        <View style={styles.viewToggle}>
          <Pressable
            style={[
              styles.viewToggleButton,
              viewMode === "grid" && styles.viewToggleButtonActive,
            ]}
            onPress={() => onViewModeChange("grid")}
          >
            <HugeiconsIcon
              icon={GridViewIcon}
              size={moderateScale(18)}
              color={viewMode === "grid" ? colors.foreground : colors.muted}
              strokeWidth={1.5}
            />
          </Pressable>

          <View style={styles.viewDivider} />

          <Pressable
            style={[
              styles.viewToggleButton,
              viewMode === "list" && styles.viewToggleButtonActive,
            ]}
            onPress={() => onViewModeChange("list")}
          >
            <HugeiconsIcon
              icon={Menu01Icon}
              size={moderateScale(18)}
              color={viewMode === "list" ? colors.foreground : colors.muted}
              strokeWidth={1.5}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingBottom: verticalScale(spacing[3]),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  buttonRow: {
    flexDirection: "row",
    gap: horizontalScale(spacing[2]),
    marginBottom: verticalScale(spacing[3]),
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: horizontalScale(spacing[2]),
    height: verticalScale(44),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: horizontalScale(spacing[2]),
    width: "33%",
    height: verticalScale(44),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  buttonText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.foreground,
    textTransform: "uppercase",
    letterSpacing: 0.08 * fontSizes.xs,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultCount: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.1 * fontSizes.xs,
  },
  viewToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[2]),
  },
  viewToggleButton: {
    padding: moderateScale(spacing[1]),
  },
  viewToggleButtonActive: {
    opacity: 1,
  },
  viewDivider: {
    width: 1,
    height: verticalScale(16),
    backgroundColor: colors.border,
  },
});
