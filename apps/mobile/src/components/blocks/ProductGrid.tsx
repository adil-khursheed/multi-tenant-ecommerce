import { StyleSheet, View } from "react-native";

import { ProductCard, type ShopProduct } from "@/components/shop/ProductCard";

type ProductGridProps = {
  products: ShopProduct[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (!products?.length) return null;

  return (
    <View style={styles.grid}>
      {products.map((product, index) => (
        <View key={String(product.id ?? index)} style={styles.item}>
          <ProductCard product={product} viewMode="grid" />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  item: {
    width: "48%",
    flexGrow: 1,
  },
});
