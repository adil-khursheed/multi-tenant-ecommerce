import { useCallback, useEffect, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  FavouriteIcon,
  Home01Icon,
  ShoppingCart01Icon,
  Store02Icon,
  User02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Tabs } from "expo-router";

import { useCart } from "@/providers/Cart";
import { horizontalScale, moderateScale, verticalScale } from "@/constants/responsive";
import {
  colors,
  fonts,
  fontSizes,
  radii,
  shadows,
  spacing,
} from "@/constants/theme";

const ICON_MAP: Record<string, typeof Home01Icon> = {
  index: Home01Icon,
  shop: Store02Icon,
  cart: ShoppingCart01Icon,
  wishlist: FavouriteIcon,
  profile: User02Icon,
};

const SPRING_CONFIG = { damping: 20, stiffness: 300, mass: 1 };
const INDICATOR_PADDING = 6;

type TabLayout = { x: number; width: number; height: number };

type TabBarProps = any;

function CustomTabBar({ state, navigation, descriptors }: TabBarProps) {
  const { bottom } = useSafeAreaInsets();
  const [tabLayouts, setTabLayouts] = useState<TabLayout[]>([]);
  const { itemCount } = useCart();

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const hasInitialized = useSharedValue(false);

  const handleTabLayout = useCallback(
    (index: number, event: LayoutChangeEvent) => {
      const { x, width, height } = event.nativeEvent.layout;
      setTabLayouts((prev) => {
        const next = [...prev];
        next[index] = { x, width, height };
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    const layout = tabLayouts[state.index];
    if (!layout) return;

    const targetX = layout.x + INDICATOR_PADDING;
    const targetWidth = layout.width - INDICATOR_PADDING * 2;

    if (!hasInitialized.value) {
      indicatorX.value = targetX;
      indicatorWidth.value = targetWidth;
      hasInitialized.value = true;
    } else {
      indicatorX.value = withSpring(targetX, SPRING_CONFIG);
      indicatorWidth.value = withSpring(targetWidth, SPRING_CONFIG);
    }
  }, [state.index, tabLayouts]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  return (
    <View style={[styles.tabBar, { paddingBottom: bottom }]}>
      <View style={styles.tabList}>
        {state.routes.map(
          (route: { key: string; name: string }, index: number) => {
            const isFocused = state.index === index;
            const label = descriptors[route.key]?.options?.title ?? route.name;
            const Icon = ICON_MAP[route.name] ?? Home01Icon;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const isCartTab = route.name === "cart";

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                onLayout={(e) => handleTabLayout(index, e)}
                style={styles.tabButton}
              >
                <View>
                  <HugeiconsIcon
                    icon={Icon}
                    size={22}
                    color={isFocused ? colors.primary : colors.mutedForeground}
                    strokeWidth={1.5}
                  />
                  {isCartTab && itemCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {itemCount > 99 ? "99+" : itemCount}
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isFocused
                        ? colors.primary
                        : colors.mutedForeground,
                    },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          },
        )}
      </View>
      <Animated.View style={[styles.indicator, indicatorStyle]} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="shop" options={{ title: "Shop" }} />
      <Tabs.Screen name="cart" options={{ title: "Cart" }} />
      <Tabs.Screen name="wishlist" options={{ title: "Wishlist" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.card,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    ...shadows.sm,
  },
  tabList: {
    flexDirection: "row",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(spacing[2]),
    gap: moderateScale(spacing[0.5]),
  },
  tabLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
  },
  indicator: {
    position: "absolute",
    top: 0,
    height: verticalScale(3),
    backgroundColor: colors.primary,
    borderRadius: radii.full,
  },
  badge: {
    position: "absolute",
    top: -verticalScale(4),
    right: -horizontalScale(8),
    backgroundColor: colors.destructive,
    borderRadius: radii.full,
    minWidth: moderateScale(18),
    height: moderateScale(18),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: moderateScale(spacing[1]),
  },
  badgeText: {
    fontFamily: fonts.sans.bold,
    fontSize: moderateScale(10),
    color: colors.destructiveForeground,
    textAlign: "center",
  },
});
