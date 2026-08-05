import AsyncStorage from "@react-native-async-storage/async-storage";

export type GuestCartItem = {
  id: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  productImageUrl?: string | null;
  variantId?: string | null;
  variantTitle?: string | null;
  priceInINR: number;
  effectivePrice?: number;
  discountPercent?: number | null;
  inventory?: number | null;
  tenantId?: string | null;
  tenantStoreName?: string | null;
  tenantLogoUrl?: string | null;
  quantity: number;
};

export type GuestCart = {
  items: GuestCartItem[];
};

const GUEST_CART_KEY = "guest_cart";

export async function getGuestCart(): Promise<GuestCart | null> {
  try {
    const raw = await AsyncStorage.getItem(GUEST_CART_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GuestCart;
  } catch {
    return null;
  }
}

export async function setGuestCart(cart: GuestCart): Promise<void> {
  try {
    await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  } catch {
    // silently fail
  }
}

export async function clearGuestCart(): Promise<void> {
  try {
    await AsyncStorage.removeItem(GUEST_CART_KEY);
  } catch {
    // silently fail
  }
}
