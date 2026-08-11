import { StyleSheet, View } from "react-native";

import { RichText } from "@/components/rich-text/RichText";
import { verticalScale } from "@/constants/responsive";
import { spacing } from "@/constants/theme";

import type { ShopProduct } from "@/components/shop/ProductCard";
import { BlockWrapper } from "./BlockWrapper";
import { ProductGrid } from "./ProductGrid";

type ArchiveBlockProps = {
  introContent: unknown;
  products: unknown[];
};

export function ArchiveBlock({ introContent, products }: ArchiveBlockProps) {
  if (!products?.length) return null;

  return (
    <BlockWrapper style={styles.wrapper}>
      {introContent != null && (
        <View style={styles.intro}>
          <RichText data={introContent as never} />
        </View>
      )}
      <ProductGrid products={products as ShopProduct[]} />
    </BlockWrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 0,
  },
  intro: {
    paddingHorizontal: 20,
    marginBottom: verticalScale(spacing[6]),
  },
});
