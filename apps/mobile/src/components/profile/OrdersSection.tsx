import { StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/utils/api";
import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";
import { horizontalScale, verticalScale, moderateScale } from "@/constants/responsive";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: colors.warning, text: colors.foreground },
  processing: { bg: colors.warning, text: colors.foreground },
  shipped: { bg: colors.primary, text: colors.primaryForeground },
  delivered: { bg: colors.success, text: colors.white },
  cancelled: { bg: colors.error, text: colors.white },
  refunded: { bg: colors.muted, text: colors.mutedForeground },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAmount(amount: number | null | undefined): string {
  if (amount == null) return "₹0";
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function OrdersSection() {
  const trpc = useTRPC();

  const { data: ordersData, isLoading } = useQuery(
    trpc.orders.list.queryOptions(),
  );

  const orders = ordersData?.orders ?? [];

  if (isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Loading orders...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptySubtext}>
          Your order history will appear here once you make a purchase.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {orders.map((order: any) => {
        const statusStyle = STATUS_COLORS[order.status] ?? STATUS_COLORS.pending;
        const itemCount = order.items?.length ?? 0;

        return (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>#{order.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                  {order.status ?? "pending"}
                </Text>
              </View>
            </View>

            <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>

            <View style={styles.orderFooter}>
              <Text style={styles.orderItems}>
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </Text>
              <Text style={styles.orderAmount}>{formatAmount(order.amount)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: verticalScale(spacing[3]),
  },
  orderCard: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: horizontalScale(spacing[4]),
    backgroundColor: colors.card,
    gap: verticalScale(spacing[2]),
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderId: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: horizontalScale(spacing[2]),
    paddingVertical: verticalScale(spacing[0.5]),
    borderRadius: radii.sm,
  },
  statusText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(10),
    textTransform: "capitalize",
  },
  orderDate: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
  },
  orderFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: verticalScale(spacing[2]),
  },
  orderItems: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
  },
  orderAmount: {
    fontFamily: fonts.sans.semiBold,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
  },
  emptyContainer: {
    paddingVertical: verticalScale(spacing[12]),
    alignItems: "center",
    gap: verticalScale(spacing[2]),
  },
  emptyTitle: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.base),
    color: colors.foreground,
  },
  emptySubtext: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
    textAlign: "center",
    paddingHorizontal: horizontalScale(spacing[8]),
  },
  emptyText: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
  },
});
