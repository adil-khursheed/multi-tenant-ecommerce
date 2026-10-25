import { FlatList, StyleSheet } from "react-native";

import { horizontalScale, width as SCREEN_WIDTH } from "@/constants/responsive";
import { spacing } from "@/constants/theme";
import { BlockWrapper } from "./BlockWrapper";
import { CollectionCard } from "./tiles/CollectionCard";
import type { CollectionStripItem } from "./types";

type CollectionsStripBlockProps = {
  heading?: unknown;
  items: CollectionStripItem[];
};

export function CollectionsStripBlock({
  heading,
  items,
}: CollectionsStripBlockProps) {
  if (!items?.length) return null;

  const cardWidth = Math.round(SCREEN_WIDTH * 0.68);

  return (
    <BlockWrapper heading={heading}>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item, index) => `${item.slug}-${index}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        snapToInterval={cardWidth + horizontalScale(spacing[4])}
        decelerationRate="fast"
        renderItem={({ item }) => (
          <CollectionCard
            slug={item.slug}
            name={item.name}
            coverImage={item.coverImage}
            width={cardWidth}
          />
        )}
      />
    </BlockWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: horizontalScale(spacing[5]),
    gap: horizontalScale(spacing[4]),
  },
});
