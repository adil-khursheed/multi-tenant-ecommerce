import { FlatList, StyleSheet, View } from "react-native";

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
    <BlockWrapper heading={heading} style={styles.wrapper}>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item, index) => `${item.slug}-${index}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        snapToInterval={cardWidth + horizontalScale(spacing[4])}
        decelerationRate="fast"
        renderItem={({ item }) => (
          <View style={styles.card}>
            <CollectionCard
              slug={item.slug}
              name={item.name}
              coverImage={item.coverImage}
              width={cardWidth}
            />
          </View>
        )}
      />
    </BlockWrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // paddingHorizontal: 0,
  },
  content: {
    paddingHorizontal: horizontalScale(spacing[5]),
    gap: horizontalScale(spacing[4]),
  },
  card: {},
});
