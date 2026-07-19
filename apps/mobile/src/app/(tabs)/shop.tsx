import { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { AnimatedLegendList } from "@legendapp/list/reanimated";
import { LinearTransition } from "react-native-reanimated";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { sorting } from "@repo/types";

import { useTRPC } from "@/utils/api";
import { colors, fonts, fontSizes, spacing } from "@/constants/theme";
import { verticalScale, horizontalScale, moderateScale } from "@/constants/responsive";

import { ShopHeader, type FilterParam } from "@/components/shop/ShopHeader";
import { FilterBar } from "@/components/shop/FilterBar";
import { ProductCard, type ShopProduct } from "@/components/shop/ProductCard";
import { ProductCardSkeleton } from "@/components/shop/ProductCardSkeleton";
import { SortDrawer } from "@/components/shop/SortDrawer";
import { FilterDrawer } from "@/components/shop/FilterDrawer";

type FilterParams = {
  category?: string;
  sort?: string;
  priceRange?: string;
  size?: string;
  color?: string;
  brand?: string;
  rating?: string;
  occasion?: string;
  material?: string;
};

function buildActiveFilters(params: FilterParams): FilterParam[] {
  const filters: FilterParam[] = [];
  if (params.category) filters.push({ key: "category", label: `Category: ${params.category}` });
  if (params.priceRange) filters.push({ key: "priceRange", label: `Price: ${params.priceRange}` });
  if (params.size) filters.push({ key: "size", label: `Size: ${params.size}` });
  if (params.color) filters.push({ key: "color", label: `Color: ${params.color}` });
  if (params.brand) filters.push({ key: "brand", label: `Brand: ${params.brand}` });
  if (params.rating) filters.push({ key: "rating", label: `Rating: ${params.rating} & Up` });
  if (params.occasion) filters.push({ key: "occasion", label: `Occasion: ${params.occasion}` });
  if (params.material) filters.push({ key: "material", label: `Material: ${params.material}` });
  return filters;
}

export default function ShopScreen() {
  const trpc = useTRPC();

  const [filterParams, setFilterParams] = useState<FilterParams>({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const sortDrawerRef = useRef<any>(null);
  const filterDrawerRef = useRef<any>(null);

  const productsQuery = useInfiniteQuery(
    trpc.product.getAllProducts.infiniteQueryOptions(
      {
        category: filterParams.category,
        sort: filterParams.sort,
        priceRange: filterParams.priceRange,
        size: filterParams.size,
        color: filterParams.color,
        brand: filterParams.brand,
        rating: filterParams.rating,
        occasion: filterParams.occasion,
        material: filterParams.material,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialCursor: 1,
      },
    ),
  );

  const filterOptionsQuery = useQuery(
    trpc.product.getFilterOptions.queryOptions(undefined, {
      staleTime: 5 * 60 * 1000,
    }),
  );

  const categoriesQuery = useQuery(
    trpc.category.getAllCategories.queryOptions(undefined, {
      staleTime: 5 * 60 * 1000,
    }),
  );

  const products = useMemo<ShopProduct[]>(
    () => (productsQuery.data?.pages.flatMap((page) => page.products.docs) ?? []) as ShopProduct[],
    [productsQuery.data],
  );

  const totalDocs = productsQuery.data?.pages[0]?.products.totalDocs ?? 0;

  const activeFilters = useMemo(
    () => buildActiveFilters(filterParams),
    [filterParams],
  );

  const activeFilterCount = useMemo(
    () => Object.keys(filterParams).filter((k) => k !== "sort").length,
    [filterParams],
  );

  const currentSortTitle = useMemo(() => {
    const sortSlug = filterParams.sort;
    return sorting.find((s) => s.slug === sortSlug)?.title ?? sorting[0]?.title ?? "Sort";
  }, [filterParams.sort]);

  const handleRemoveFilter = useCallback((key: string) => {
    setFilterParams((prev) => {
      const next = { ...prev };
      delete next[key as keyof FilterParams];
      return next;
    });
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setFilterParams((prev) => ({ sort: prev.sort }));
  }, []);

  const handleSortSelect = useCallback((slug: string | null) => {
    setFilterParams((prev) => {
      const next = { ...prev };
      if (slug) {
        next.sort = slug;
      } else {
        delete next.sort;
      }
      return next;
    });
  }, []);

  const handleFilterApply = useCallback((filters: Record<string, string>) => {
    setFilterParams((prev) => ({
      sort: prev.sort,
      ...filters,
    }));
  }, []);

  const handleFilterReset = useCallback(() => {
    setFilterParams({});
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ShopProduct }) => (
      <ProductCard product={item} viewMode={viewMode} />
    ),
    [viewMode],
  );

  const keyExtractor = useCallback((item: ShopProduct) => String(item.id), []);

  const ListHeader = useCallback(
    () =>
      productsQuery.isLoading ? null : (
        <View style={styles.listHeader}>
          <Text style={styles.resultCount}>
            {totalDocs} {totalDocs === 1 ? "Product" : "Products"}
          </Text>
        </View>
      ),
    [productsQuery.isLoading, totalDocs],
  );

  const ListFooter = useCallback(() => {
    if (!productsQuery.hasNextPage || productsQuery.isFetchingNextPage) {
      return (
        <View style={styles.listFooter}>
          {productsQuery.isFetchingNextPage && (
            <View style={styles.loadingMore}>
              <ProductCardSkeleton viewMode={viewMode} />
            </View>
          )}
        </View>
      );
    }
    return null;
  }, [productsQuery.hasNextPage, productsQuery.isFetchingNextPage, viewMode]);

  const ListEmpty = useCallback(() => {
    if (productsQuery.isLoading) {
      return (
        <View style={styles.emptyContainer}>
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} viewMode={viewMode} />
          ))}
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No products found.</Text>
        <Text style={styles.emptySubtext}>Try adjusting your filters.</Text>
      </View>
    );
  }, [productsQuery.isLoading, viewMode]);

  const filterOptions = filterOptionsQuery.data;
  const categoriesData = categoriesQuery.data;

  const currentFiltersForDrawer: Record<string, string> = {};
  for (const [key, value] of Object.entries(filterParams)) {
    if (key !== "sort" && value) {
      currentFiltersForDrawer[key] = value;
    }
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <BottomSheetModalProvider>
        <View style={styles.container}>
          <ShopHeader
            activeFilters={activeFilters}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleClearAllFilters}
          />

          <FilterBar
            activeFilterCount={activeFilterCount}
            totalProducts={totalDocs}
            viewMode={viewMode}
            currentSortTitle={currentSortTitle}
            onFilterPress={() => filterDrawerRef.current?.present()}
            onSortPress={() => sortDrawerRef.current?.present()}
            onViewModeChange={setViewMode}
          />

          <AnimatedLegendList
            data={products}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            numColumns={viewMode === "grid" ? 2 : 1}
            estimatedItemSize={viewMode === "grid" ? 280 : 200}
            drawDistance={300}
            recycleItems
            maintainVisibleContentPosition
            onEndReached={() => {
              if (productsQuery.hasNextPage && !productsQuery.isFetchingNextPage) {
                productsQuery.fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            ListHeaderComponent={ListHeader}
            ListFooterComponent={ListFooter}
            ListEmptyComponent={ListEmpty}
            itemLayoutAnimation={LinearTransition.duration(300)}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={
              viewMode === "grid" ? styles.columnWrapper : undefined
            }
            key={viewMode}
          />

          {filterOptions && categoriesData && (
            <FilterDrawer
              ref={filterDrawerRef}
              filterOptions={filterOptions}
              categoriesData={categoriesData}
              currentFilters={currentFiltersForDrawer}
              onApply={handleFilterApply}
              onReset={handleFilterReset}
            />
          )}

          <SortDrawer
            ref={sortDrawerRef}
            currentSort={filterParams.sort ?? null}
            onSortSelect={handleSortSelect}
          />
        </View>
      </BottomSheetModalProvider>
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
  listContent: {
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingBottom: verticalScale(spacing[10]),
  },
  columnWrapper: {
    gap: horizontalScale(spacing[3]),
  },
  listHeader: {
    paddingVertical: verticalScale(spacing[3]),
  },
  resultCount: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.1 * fontSizes.xs,
  },
  listFooter: {
    paddingVertical: verticalScale(spacing[4]),
  },
  loadingMore: {
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(spacing[16]),
    gap: verticalScale(spacing[2]),
  },
  emptyText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.base),
    color: colors.foreground,
  },
  emptySubtext: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
  },
});
