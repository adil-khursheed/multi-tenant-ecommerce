import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AnimatedLegendList } from "@legendapp/list/reanimated";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  GridViewIcon,
  Menu01Icon,
  FavouriteIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";

import { ProductCard, type ShopProduct } from "@/components/shop/ProductCard";
import { ProductCardSkeleton } from "@/components/shop/ProductCardSkeleton";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, fontSizes, spacing } from "@/constants/theme";
import { useAuth } from "@/providers/Auth";
import { useTRPC } from "@/utils/api";

export default function WishlistScreen() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { top } = useSafeAreaInsets();
  const { user } = useAuth();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [refreshing, setRefreshing] = useState(false);

  const wishlistQuery = useQuery(
    trpc.wishlist.getAll.queryOptions(undefined, {
      enabled: !!user,
    }),
  );

  const products = (wishlistQuery.data?.wishlist ?? []) as ShopProduct[];

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries(trpc.wishlist.getAll.queryOptions());
    setRefreshing(false);
  }, [queryClient, trpc]);

  const renderItem = useCallback(
    ({ item }: { item: ShopProduct }) => (
      <ProductCard product={item} viewMode={viewMode} />
    ),
    [viewMode],
  );

  const keyExtractor = useCallback((item: ShopProduct) => String(item.id), []);

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[styles.header, { paddingTop: top + verticalScale(spacing[4]) }]}
        >
          <Text style={styles.headerTitle}>Wishlist</Text>
        </View>
        <View style={styles.emptyContainer}>
          <HugeiconsIcon
            icon={FavouriteIcon}
            size={moderateScale(48)}
            color={colors.muted}
            strokeWidth={1.5}
          />
          <Text style={styles.emptyTitle}>Sign in to view your wishlist</Text>
          <Text style={styles.emptySubtext}>
            Save your favorite items for later
          </Text>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        <View
          style={[
            styles.header,
            { paddingTop: top + verticalScale(spacing[4]) },
          ]}
        >
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Wishlist</Text>
            <Text style={styles.itemCount}>
              {products.length} {products.length === 1 ? "item" : "items"}
            </Text>
          </View>

          {products.length > 0 && (
            <View style={styles.controlsRow}>
              <View style={styles.viewToggle}>
                <Pressable
                  style={[
                    styles.viewToggleButton,
                    viewMode === "grid" && styles.viewToggleButtonActive,
                  ]}
                  onPress={() => setViewMode("grid")}
                >
                  <HugeiconsIcon
                    icon={GridViewIcon}
                    size={moderateScale(18)}
                    color={
                      viewMode === "grid" ? colors.foreground : colors.muted
                    }
                    strokeWidth={1.5}
                  />
                </Pressable>

                <View style={styles.viewDivider} />

                <Pressable
                  style={[
                    styles.viewToggleButton,
                    viewMode === "list" && styles.viewToggleButtonActive,
                  ]}
                  onPress={() => setViewMode("list")}
                >
                  <HugeiconsIcon
                    icon={Menu01Icon}
                    size={moderateScale(18)}
                    color={
                      viewMode === "list" ? colors.foreground : colors.muted
                    }
                    strokeWidth={1.5}
                  />
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {wishlistQuery.isLoading ? (
          <View style={styles.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} viewMode={viewMode} />
            ))}
          </View>
        ) : (
          <AnimatedLegendList
            data={products}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            numColumns={viewMode === "grid" ? 2 : 1}
            estimatedItemSize={viewMode === "grid" ? 280 : 200}
            drawDistance={300}
            recycleItems
            maintainVisibleContentPosition
            onRefresh={handleRefresh}
            refreshing={refreshing}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <HugeiconsIcon
                  icon={FavouriteIcon}
                  size={moderateScale(48)}
                  color={colors.muted}
                  strokeWidth={1.5}
                />
                <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
                <Text style={styles.emptySubtext}>
                  Tap the heart icon on any product to save it here
                </Text>
              </View>
            }
            itemLayoutAnimation={LinearTransition.duration(300)}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={
              viewMode === "grid" ? styles.columnWrapper : undefined
            }
            key={viewMode}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingBottom: verticalScale(spacing[3]),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: verticalScale(spacing[3]),
  },
  headerTitle: {
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(fontSizes["2xl"]),
    color: colors.primaryForeground,
  },
  itemCount: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.primaryForeground,
    opacity: 0.8,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  viewToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[2]),
  },
  viewToggleButton: {
    padding: moderateScale(spacing[1]),
  },
  viewToggleButtonActive: {
    opacity: 1,
  },
  viewDivider: {
    width: 1,
    height: verticalScale(16),
    backgroundColor: colors.primaryForeground,
    opacity: 0.3,
  },
  listContent: {
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingTop: verticalScale(spacing[4]),
    paddingBottom: verticalScale(spacing[10]),
  },
  columnWrapper: {
    gap: horizontalScale(spacing[3]),
  },
  skeletonGrid: {
    flex: 1,
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingTop: verticalScale(spacing[3]),
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(spacing[16]),
    gap: verticalScale(spacing[3]),
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
});
