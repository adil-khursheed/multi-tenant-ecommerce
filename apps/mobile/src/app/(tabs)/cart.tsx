import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCart } from "@/providers/Cart";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { colors } from "@/constants/theme";

export default function Cart() {
  const { items, isLoading } = useCart();
  const { top } = useSafeAreaInsets();

  if (items.length === 0 && !isLoading) {
    return (
      <View style={[styles.container, { paddingTop: top }]}>
        <EmptyCart />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CartItem item={item} />}
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
  list: {
    flexGrow: 1,
  },
});
