import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { RichText } from "@/components/rich-text/RichText";
import { horizontalScale, moderateScale, verticalScale } from "@/constants/responsive";
import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";

import type { CategoryTab, CustomTab } from "./types";
import { BlockWrapper } from "./BlockWrapper";
import { CategoryCard } from "./tiles/CategoryCard";

type TabsBlockProps = {
  heading?: unknown;
  contentType: "categories" | "custom";
  categoryTabs: CategoryTab[];
  customTabs: CustomTab[];
};

export function TabsBlock({
  heading,
  contentType,
  categoryTabs,
  customTabs,
}: TabsBlockProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const isCategories = contentType === "categories";
  const tabs = isCategories
    ? categoryTabs.map((tab) => tab.parentName ?? tab.parentSlug ?? "Category")
    : customTabs.map((tab) => tab.tab);

  if (!tabs.length) return null;

  const activeTab = isCategories
    ? categoryTabs[activeIndex]
    : customTabs[activeIndex];

  return (
    <BlockWrapper heading={heading}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {tabs.map((label, index) => {
          const active = index === activeIndex;
          return (
            <Pressable
              key={`${label}-${index}`}
              onPress={() => setActiveIndex(index)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.content}>
        {isCategories && activeTab ? (
          <View style={styles.categoryGrid}>
            {(activeTab as CategoryTab).children.map((child, index) => (
              <View key={String(child.id ?? index)} style={styles.categoryItem}>
                <CategoryCard
                  slug={child.slug}
                  name={child.name}
                  image={child.image}
                  height={Math.round(200)}
                />
              </View>
            ))}
          </View>
        ) : (
          activeTab &&
          (activeTab as CustomTab).content != null && (
            <RichText data={(activeTab as CustomTab).content as never} />
          )
        )}
      </View>
    </BlockWrapper>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexGrow: 0,
    marginBottom: verticalScale(spacing[5]),
  },
  tabBarContent: {
    gap: horizontalScale(spacing[2]),
    paddingRight: horizontalScale(spacing[4]),
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.input,
    borderRadius: radii.none,
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingVertical: verticalScale(spacing[2]),
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    textTransform: "capitalize",
    color: colors.foreground,
  },
  chipTextActive: {
    color: colors.white,
  },
  content: {
    width: "100%",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: horizontalScale(spacing[3]),
  },
  categoryItem: {
    width: "48%",
    flexGrow: 1,
  },
});
