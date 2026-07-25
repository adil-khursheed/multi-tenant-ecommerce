import { StyleSheet, Text, View } from "react-native";

import { ProductCard, type ShopProduct } from "@/components/shop/ProductCard";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, fontSizes, spacing } from "@/constants/theme";

type RelatedProductsProps = {
  products: ShopProduct[];
  onShopAll?: () => void;
};

export function RelatedProducts({ products, onShopAll }: RelatedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>You Might Also Like</Text>
        {onShopAll && (
          <Text style={styles.shopAll} onPress={onShopAll}>
            Shop All
          </Text>
        )}
      </View>

      <View style={styles.grid}>
        {products.map((product) => (
          <View key={product.id} style={styles.gridItem}>
            <ProductCard product={product} viewMode="grid" />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: verticalScale(spacing[10]),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(spacing[4]),
  },
  heading: {
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(fontSizes["2xl"]),
    color: colors.foreground,
  },
  shopAll: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.primary,
    textDecorationLine: "underline",
    textDecorationColor: colors.primary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: horizontalScale(spacing[3]),
  },
  gridItem: {
    width: "47%",
  },
});
