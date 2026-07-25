import { forwardRef, useCallback, useMemo, useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";

import type { RouterOutputs } from "@repo/api";

import { AccordionGroup } from "./AccordionGroup";
import { colors, fonts, fontSizes, spacing } from "@/constants/theme";
import { verticalScale, horizontalScale, moderateScale } from "@/constants/responsive";

type FilterOptions = RouterOutputs["product"]["getFilterOptions"];
type CategoriesData = RouterOutputs["category"]["getAllCategories"];

const PRICE_RANGES = [
  "₹0-₹499",
  "₹500-₹999",
  "₹1,000–₹1,499",
  "₹1,500–₹1,999",
  "₹2,000-₹2,999",
  "₹3,000-₹3,999",
  "₹4,000-₹4,999",
  "₹5,000-₹5,999",
  "₹6,000-₹6,999",
  "₹7,000-₹7,999",
  "₹8,000-₹8,999",
  "₹9,000-₹9,999",
  "₹10,000+",
];

const OCCASIONS = ["Casual", "Festive", "Wedding", "Office", "Party", "Outdoor"];

type FilterDrawerProps = {
  filterOptions: FilterOptions;
  categoriesData: CategoriesData;
  currentFilters: Record<string, string>;
  onApply: (filters: Record<string, string>) => void;
  onReset: () => void;
};

function FilterChip({
  label,
  isActive,
  onPress,
  style,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  style?: object;
}) {
  return (
    <Pressable
      style={[styles.chip, isActive && styles.chipActive, style]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function CheckboxItem({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.checkboxRow} onPress={onPress}>
      <View style={[styles.checkbox, isActive && styles.checkboxActive]}>
        {isActive && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text
        style={[
          styles.checkboxLabel,
          isActive && styles.checkboxLabelActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function RatingRow({
  stars,
  isActive,
  onPress,
}: {
  stars: number;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.ratingRow, isActive && styles.ratingRowActive]}
      onPress={onPress}
    >
      <View style={styles.ratingStars}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Text
            key={i}
            style={[styles.ratingStar, i < stars && styles.ratingStarFilled]}
          >
            ★
          </Text>
        ))}
      </View>
      <Text style={styles.ratingLabel}>& up</Text>
    </Pressable>
  );
}

export const FilterDrawer = forwardRef<BottomSheetModal, FilterDrawerProps>(
  function FilterDrawer(
    { filterOptions, categoriesData, currentFilters, onApply, onReset },
    ref,
  ) {
    const snapPoints = useMemo(() => ["85%"], []);
    const [localFilters, setLocalFilters] = useState(currentFilters);

    useEffect(() => {
      setLocalFilters(currentFilters);
    }, [currentFilters]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    const toggleFilter = (key: string, value: string) => {
      setLocalFilters((prev) => {
        const next = { ...prev };
        if (next[key] === value) {
          delete next[key];
        } else {
          next[key] = value;
        }
        return next;
      });
    };

    const handleApply = () => {
      onApply(localFilters);
      (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
    };

    const handleReset = () => {
      setLocalFilters({});
      onReset();
      (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
    };

    const activeCount = Object.keys(localFilters).filter(
      (k) => k !== "sort",
    ).length;

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.handle}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Filters</Text>
          <Pressable onPress={handleReset}>
            <Text style={styles.resetText}>Reset All</Text>
          </Pressable>
        </View>

        <BottomSheetScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <AccordionGroup title="Categories">
            <View style={styles.categoriesContainer}>
              {categoriesData.docs.map(
                (cat: any) =>
                  cat.children?.length > 0 && (
                    <View key={cat.id} style={styles.categoryGroup}>
                      <Text style={styles.categoryGroupName}>{cat.name}</Text>
                      <View style={styles.categoryGrid}>
                        {cat.children.map((child: any) => (
                          <FilterChip
                            key={child.id}
                            label={child.name}
                            isActive={localFilters.category === child.slug}
                            onPress={() => toggleFilter("category", child.slug)}
                            style={styles.categoryChip}
                          />
                        ))}
                      </View>
                    </View>
                  ),
              )}
            </View>
          </AccordionGroup>

          <AccordionGroup title="Price Range">
            <View style={styles.chipWrap}>
              {PRICE_RANGES.map((range) => (
                <FilterChip
                  key={range}
                  label={range}
                  isActive={localFilters.priceRange === range}
                  onPress={() => toggleFilter("priceRange", range)}
                />
              ))}
            </View>
          </AccordionGroup>

          {filterOptions.sizes.length > 0 && (
            <AccordionGroup title="Size">
              <View style={styles.sizeGrid}>
                {filterOptions.sizes.map((s) => (
                  <FilterChip
                    key={s}
                    label={s}
                    isActive={localFilters.size === s}
                    onPress={() => toggleFilter("size", s)}
                    style={styles.sizeChip}
                  />
                ))}
              </View>
            </AccordionGroup>
          )}

          {filterOptions.colors.length > 0 && (
            <AccordionGroup title="Color">
              <View style={styles.chipWrap}>
                {filterOptions.colors.map((colorName) => (
                  <FilterChip
                    key={colorName}
                    label={colorName}
                    isActive={localFilters.color === colorName}
                    onPress={() => toggleFilter("color", colorName)}
                  />
                ))}
              </View>
            </AccordionGroup>
          )}

          <AccordionGroup title="Ratings">
            <View style={styles.ratingsContainer}>
              {[5, 4, 3, 2, 1].map((stars) => (
                <RatingRow
                  key={stars}
                  stars={stars}
                  isActive={localFilters.rating === String(stars)}
                  onPress={() => toggleFilter("rating", String(stars))}
                />
              ))}
            </View>
          </AccordionGroup>

          <AccordionGroup title="Occasion">
            <View style={styles.checkboxGrid}>
              {OCCASIONS.map((item) => (
                <CheckboxItem
                  key={item}
                  label={item}
                  isActive={localFilters.occasion === item}
                  onPress={() => toggleFilter("occasion", item)}
                />
              ))}
            </View>
          </AccordionGroup>

          {filterOptions.materials.length > 0 && (
            <AccordionGroup title="Fabric/Material">
              <View style={styles.checkboxGrid}>
                {filterOptions.materials.map((item) => (
                  <CheckboxItem
                    key={item}
                    label={item}
                    isActive={localFilters.material === item}
                    onPress={() => toggleFilter("material", item)}
                  />
                ))}
              </View>
            </AccordionGroup>
          )}

          {filterOptions.brands.length > 0 && (
            <AccordionGroup title="Brand">
              <View style={styles.checkboxGrid}>
                {filterOptions.brands.map((brand) => (
                  <CheckboxItem
                    key={brand}
                    label={brand}
                    isActive={localFilters.brand === brand}
                    onPress={() => toggleFilter("brand", brand)}
                  />
                ))}
              </View>
            </AccordionGroup>
          )}
        </BottomSheetScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.applyButton, activeCount === 0 && styles.applyButtonDisabled]}
            onPress={handleApply}
          >
            <Text style={styles.applyButtonText}>
              Apply Filters{activeCount > 0 ? ` (${activeCount})` : ""}
            </Text>
          </Pressable>
        </View>
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.background,
  },
  handle: {
    backgroundColor: colors.border,
    width: moderateScale(40),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingVertical: verticalScale(spacing[3]),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: {
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(fontSizes["2xl"]),
    color: colors.foreground,
  },
  resetText: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.primary,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: moderateScale(spacing[4]),
    paddingBottom: verticalScale(spacing[10]),
  },
  footer: {
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingVertical: verticalScale(spacing[3]),
    paddingBottom: verticalScale(spacing[6]),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: verticalScale(spacing[3.5]),
    alignItems: "center",
  },
  applyButtonDisabled: {
    opacity: 0.6,
  },
  applyButtonText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.primaryForeground,
    textTransform: "uppercase",
    letterSpacing: 0.1,
  },
  categoriesContainer: {
    gap: verticalScale(spacing[4]),
  },
  categoryGroup: {
    gap: verticalScale(spacing[2]),
  },
  categoryGroupName: {
    fontFamily: fonts.sans.semiBold,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.foreground,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: horizontalScale(spacing[2]),
  },
  categoryChip: {
    minWidth: horizontalScale(100),
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: horizontalScale(spacing[2]),
  },
  chip: {
    paddingHorizontal: horizontalScale(spacing[3]),
    paddingVertical: verticalScale(spacing[2]),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: {
    backgroundColor: colors.foreground,
    borderColor: colors.foreground,
  },
  chipText: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
  },
  chipTextActive: {
    color: colors.background,
    fontFamily: fonts.sans.medium,
  },
  sizeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: horizontalScale(spacing[2]),
  },
  sizeChip: {
    width: "22%",
    alignItems: "center",
  },
  ratingsContainer: {
    gap: verticalScale(spacing[2]),
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[2]),
    paddingVertical: verticalScale(spacing[2]),
    paddingHorizontal: horizontalScale(spacing[2]),
  },
  ratingRowActive: {
    backgroundColor: colors.muted,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
  },
  ratingStars: {
    flexDirection: "row",
    gap: moderateScale(2),
  },
  ratingStar: {
    fontSize: moderateScale(14),
    color: colors.muted,
  },
  ratingStarFilled: {
    color: colors.primary,
  },
  ratingLabel: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.foreground,
  },
  checkboxGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: horizontalScale(spacing[2]),
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[2]),
    width: "48%",
    paddingVertical: verticalScale(spacing[1.5]),
  },
  checkbox: {
    width: moderateScale(18),
    height: moderateScale(18),
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.primaryForeground,
    fontSize: moderateScale(12),
    fontWeight: "600",
  },
  checkboxLabel: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
  },
  checkboxLabelActive: {
    color: colors.foreground,
    fontFamily: fonts.sans.medium,
  },
});
