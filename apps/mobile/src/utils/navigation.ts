import { Linking } from "react-native";

import type { useRouter } from "expo-router";

type AppRouter = ReturnType<typeof useRouter>;

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/**
 * Convert a CMS-resolved href (from link fields) into an expo-router route.
 * CMS pages other than home are not routed on mobile yet, so unknown internal
 * paths fall back to the home tab.
 */
export function toAppHref(href: string): string {
  if (!href || href === "/") return "/(tabs)";

  if (href.startsWith("/products/")) {
    return `/(shop)/${href.replace("/products/", "")}`;
  }

  if (
    href.startsWith("/shop") ||
    href.startsWith("/collections/") ||
    href.startsWith("/categories/")
  ) {
    return "/(tabs)/shop";
  }

  return "/(tabs)";
}

export function navigateToHref(
  href: string,
  router: AppRouter,
): void {
  if (!href) return;

  if (isExternal(href)) {
    Linking.openURL(href).catch(() => {});
    return;
  }

  router.push(toAppHref(href) as never);
}
