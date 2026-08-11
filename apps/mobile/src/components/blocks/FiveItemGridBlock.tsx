import { StyleSheet, View } from "react-native";

import { ProductCard, type ShopProduct } from "@/components/shop/ProductCard";

import { BlockWrapper } from "./BlockWrapper";
import { FadeInView } from "./FadeInView";

type FiveItemGridBlockProps = {
  heading?: unknown;
  products: unknown[];
};

export function FiveItemGridBlock({ heading, products }: FiveItemGridBlockProps) {
  if (!products?.length) return null;

  const [hero, ...rest] = products as ShopProduct[];
  const rows = [rest.slice(0, 2), rest.slice(2, 4)];

  return (
    <BlockWrapper heading={heading}>
      <View style={styles.grid}>
        <FadeInView>
          <ProductCard product={hero} viewMode="grid" />
        </FadeInView>

        {rows.map((row, rowIndex) =>
          row.length > 0 ? (
            <View key={rowIndex} style={styles.row}>
              {row.map((product, index) => (
                <FadeInView
                  key={String(product.id)}
                  delay={80 + (rowIndex * 2 + index) * 80}
                  style={styles.item}
                >
                  <ProductCard product={product} viewMode="grid" />
                </FadeInView>
              ))}
            </View>
          ) : null,
        )}
      </View>
    </BlockWrapper>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  item: {
    width: "48%",
    flexGrow: 1,
  },
});
