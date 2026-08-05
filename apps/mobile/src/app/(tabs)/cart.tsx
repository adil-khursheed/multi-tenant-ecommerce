import { SectionList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { VendorHeader } from "@/components/cart/VendorHeader";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, fontSizes, spacing } from "@/constants/theme";
import { useCart, type VendorGroup } from "@/providers/Cart";

type CartSection = {
  tenantId: string;
  tenantStoreName: string;
  tenantLogoUrl: string | null;
  itemCount: number;
  data: VendorGroup["items"];
};

export default function Cart() {
  const { items, isLoading, vendorGroups } = useCart();
  const { top } = useSafeAreaInsets();

  if (items.length === 0 && !isLoading) {
    return (
      <View style={[styles.container, { paddingTop: top }]}>
        <EmptyCart />
      </View>
    );
  }

  const sections: CartSection[] = vendorGroups.map((group) => ({
    tenantId: group.tenantId,
    tenantStoreName: group.tenantStoreName,
    tenantLogoUrl: group.tenantLogoUrl,
    itemCount: group.itemCount,
    data: group.items,
  }));

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        <Text style={styles.headerCount}>
          {items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
          {items.reduce((sum, item) => sum + item.quantity, 0) === 1
            ? "item"
            : "items"}
        </Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CartItem item={item} />}
        renderSectionHeader={({ section }) => (
          <VendorHeader
            storeName={section.tenantStoreName}
            storeLogoUrl={section.tenantLogoUrl}
            itemCount={section.itemCount}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <CartSummary />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  headerTitle: {
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(fontSizes["2xl"]),
    color: colors.foreground,
  },
  headerCount: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
  },
  list: {
    flexGrow: 1,
    paddingBottom: verticalScale(spacing[4]),
  },
});
