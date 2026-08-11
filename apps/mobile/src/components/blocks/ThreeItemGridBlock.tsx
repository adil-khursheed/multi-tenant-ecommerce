import { StyleSheet, View } from "react-native";

import { BlockWrapper } from "./BlockWrapper";
import { FadeInView } from "./FadeInView";
import { ProductTile } from "./tiles/ProductTile";
import { toTileProduct } from "./tiles/helpers";

type ThreeItemGridBlockProps = {
  products: unknown[];
};

export function ThreeItemGridBlock({ products }: ThreeItemGridBlockProps) {
  if (!products?.length) return null;

  const tiles = products
    .map((product) => toTileProduct(product as never))
    .filter((tile) => tile !== null);

  if (tiles.length < 3) return null;

  const [hero, second, third] = tiles as NonNullable<(typeof tiles)[number]>[];

  return (
    <BlockWrapper>
      <View style={styles.grid}>
        <FadeInView>
          <ProductTile
            slug={hero.slug}
            title={hero.title}
            price={hero.price}
            image={hero.image}
          />
        </FadeInView>

        <View style={styles.sideBySide}>
          <FadeInView delay={80} style={styles.side}>
            <ProductTile
              slug={second.slug}
              title={second.title}
              price={second.price}
              image={second.image}
            />
          </FadeInView>
          <FadeInView delay={160} style={styles.side}>
            <ProductTile
              slug={third.slug}
              title={third.title}
              price={third.price}
              image={third.image}
            />
          </FadeInView>
        </View>
      </View>
    </BlockWrapper>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 16,
  },
  sideBySide: {
    flexDirection: "row",
    gap: 16,
  },
  side: {
    flex: 1,
  },
});
