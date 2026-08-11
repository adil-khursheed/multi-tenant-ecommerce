import { StyleSheet, View } from "react-native";

import { verticalScale } from "@/constants/responsive";
import { spacing } from "@/constants/theme";

import type { CategoryCardItem } from "./types";
import { BlockWrapper } from "./BlockWrapper";
import { FadeInView } from "./FadeInView";
import { CategoryCard } from "./tiles/CategoryCard";

type FourItemGridBlockProps = {
  categories: CategoryCardItem[];
};

export function FourItemGridBlock({ categories }: FourItemGridBlockProps) {
  if (!categories?.length) return null;

  return (
    <BlockWrapper>
      <View style={styles.grid}>
        {categories.map((category, index) => (
          <FadeInView key={String(category.id ?? index)} delay={index * 80}>
            <CategoryCard
              slug={category.slug}
              name={category.name}
              image={category.image}
              height={Math.round(240 + index * 16)}
            />
          </FadeInView>
        ))}
      </View>
    </BlockWrapper>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: verticalScale(spacing[5]),
  },
});
