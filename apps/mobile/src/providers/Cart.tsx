import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { RouterOutputs } from "@repo/api";
import { useTRPC } from "@/utils/api";
import {
  clearGuestCart,
  getGuestCart,
  setGuestCart,
  type GuestCartItem,
} from "@/utils/cartStorage";
import { useAuth } from "./Auth";

type Cart = RouterOutputs["cart"]["get"]["cart"];

type ServerCartItem = NonNullable<Cart["items"]>[number];

type AddCartItem = {
  productId: string;
  variantId?: string;
  productTitle?: string;
  productSlug?: string;
  productImageUrl?: string | null;
  variantTitle?: string | null;
  priceInINR?: number;
  effectivePrice?: number;
  discountPercent?: number | null;
  inventory?: number | null;
  tenantId?: string | null;
  tenantStoreName?: string | null;
  tenantLogoUrl?: string | null;
};

type CartContext = {
  cart: Cart | null;
  isLoading: boolean;
  addItem: (item: AddCartItem) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  incrementItem: (itemId: string) => Promise<void>;
  decrementItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
  subtotal: number;
  totalSavings: number;
  items: FlattenedCartItem[];
  vendorGroups: VendorGroup[];
};

export type FlattenedCartItem = {
  id: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  productImageUrl: string | null;
  variantId: string | null;
  variantTitle: string | null;
  variantOptionsLabel: string | null;
  priceInINR: number;
  effectivePrice: number;
  discountPercent: number | null;
  inventory: number | null;
  tenantId: string | null;
  tenantStoreName: string | null;
  tenantLogoUrl: string | null;
  quantity: number;
};

export type VendorGroup = {
  tenantId: string;
  tenantStoreName: string;
  tenantLogoUrl: string | null;
  items: FlattenedCartItem[];
  itemCount: number;
};

const CartContext = createContext<CartContext>({} as CartContext);

function resolveMediaUrl(media: unknown): string | null {
  if (!media) return null;
  const url =
    typeof media === "string" ? media : (media as { url?: string }).url;
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${process.env.EXPO_PUBLIC_API_URL ?? ""}${url}`;
}

function flattenServerItem(item: ServerCartItem): FlattenedCartItem | null {
  const product = item.product;
  if (typeof product !== "object" || !product) return null;

  const variant =
    item.variant && typeof item.variant === "object" ? item.variant : null;

  const gallery = (product.gallery ?? []) as {
    image: unknown;
    variantOption?: unknown;
  }[];

  const variantOptionIds = new Set(
    (variant?.options ?? []).map((option: unknown) =>
      typeof option === "object" && option
        ? (option as { id?: string }).id
        : option,
    ),
  );

  let imageMedia: unknown;
  if (variant && variantOptionIds.size > 0) {
    const match = gallery.find((g) => {
      if (!g.variantOption) return false;
      const optionId =
        typeof g.variantOption === "object" && g.variantOption
          ? (g.variantOption as { id?: string }).id
          : g.variantOption;
      return variantOptionIds.has(optionId);
    });
    if (match) imageMedia = match.image;
  }
  if (!imageMedia) imageMedia = gallery[0]?.image;

  const tenant =
    typeof product.tenant === "object" && product.tenant
      ? product.tenant
      : null;
  const storeLogo = tenant?.storeLogo;

  const basePrice = variant?.priceInINR ?? product.priceInINR ?? 0;
  const effectivePrice =
    variant?.effectivePrice ??
    product.effectivePrice ??
    variant?.priceInINR ??
    product.priceInINR ??
    0;

  const variantOptionsLabel = (variant?.options ?? [])
    .map((option: unknown) =>
      typeof option === "object" && option
        ? (option as { label?: string }).label
        : "",
    )
    .filter(Boolean)
    .join(", ");

  return {
    id: item.id ?? "",
    productId: product.id ?? "",
    productTitle: product.title ?? "",
    productSlug: (product as { slug?: string }).slug ?? "",
    productImageUrl: resolveMediaUrl(imageMedia),
    variantId: variant?.id ?? null,
    variantTitle: variant?.title ?? null,
    variantOptionsLabel: variantOptionsLabel || null,
    priceInINR: basePrice,
    effectivePrice,
    discountPercent: product.discountPercent ?? null,
    inventory: variant?.inventory ?? product.inventory ?? null,
    tenantId: tenant?.id ?? null,
    tenantStoreName: tenant?.storeName ?? null,
    tenantLogoUrl: resolveMediaUrl(storeLogo),
    quantity: item.quantity ?? 0,
  };
}

function generateGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const trpc = useTRPC();
  const { status } = useAuth();
  const queryClient = useQueryClient();

  const [guestItems, setGuestItems] = useState<GuestCartItem[]>([]);
  const [guestLoaded, setGuestLoaded] = useState(false);
  const wasLoggedOut = useRef(true);
  const mergeTriggered = useRef(false);

  const { data: cartData, isPending } = useQuery(
    trpc.cart.get.queryOptions(undefined, {
      enabled: status === "loggedIn",
    }),
  );

  const serverCart = cartData?.cart ?? null;

  const cartQueryKey = trpc.cart.get.queryOptions().queryKey;

  const addItemMutation = useMutation(
    trpc.cart.addItem.mutationOptions({
      onSuccess: (data) => {
        queryClient.setQueryData(cartQueryKey, { cart: data.cart });
      },
    }),
  );

  const removeItemMutation = useMutation(
    trpc.cart.removeItem.mutationOptions({
      onSuccess: (data) => {
        queryClient.setQueryData(cartQueryKey, { cart: data.cart });
      },
    }),
  );

  const updateQuantityMutation = useMutation(
    trpc.cart.updateItemQuantity.mutationOptions({
      onSuccess: (data) => {
        queryClient.setQueryData(cartQueryKey, { cart: data.cart });
      },
    }),
  );

  const clearCartMutation = useMutation(
    trpc.cart.clear.mutationOptions({
      onSuccess: (data) => {
        queryClient.setQueryData(cartQueryKey, { cart: data.cart });
      },
    }),
  );

  const persistGuestItems = useCallback(
    (
      updater: GuestCartItem[] | ((prev: GuestCartItem[]) => GuestCartItem[]),
    ) => {
      if (typeof updater === "function") {
        setGuestItems((prev) => {
          const next = updater(prev);
          setGuestCart({ items: next });
          return next;
        });
      } else {
        setGuestItems(updater);
        setGuestCart({ items: updater });
      }
    },
    [],
  );

  const mergeGuestCart = useCallback(
    async (items: GuestCartItem[]) => {
      for (const guestItem of items) {
        await addItemMutation.mutateAsync({
          productId: guestItem.productId,
          variantId: guestItem.variantId ?? undefined,
        });
      }
      queryClient.invalidateQueries({
        queryKey: trpc.cart.get.queryOptions().queryKey,
      });
    },
    [addItemMutation, queryClient, trpc],
  );

  useEffect(() => {
    if (status === "loggedOut" && !guestLoaded) {
      getGuestCart().then((stored) => {
        setGuestItems(stored?.items ?? []);
        setGuestLoaded(true);
      });
    }
  }, [status, guestLoaded]);

  useEffect(() => {
    if (
      status === "loggedIn" &&
      guestItems.length > 0 &&
      wasLoggedOut.current &&
      !mergeTriggered.current
    ) {
      mergeTriggered.current = true;
      wasLoggedOut.current = false;
      clearGuestCart();
      mergeGuestCart(guestItems);
    }
  }, [status, guestItems, mergeGuestCart]);

  const flattenedItems: FlattenedCartItem[] = useMemo(() => {
    if (status === "loggedIn") {
      return ((serverCart?.items ?? []) as ServerCartItem[]).reduce<
        FlattenedCartItem[]
      >((acc, item) => {
        const flat = flattenServerItem(item);
        if (flat) acc.push(flat);
        return acc;
      }, []);
    }
    return guestItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      productTitle: item.productTitle,
      productSlug: item.productSlug,
      productImageUrl: item.productImageUrl ?? null,
      variantId: item.variantId ?? null,
      variantTitle: item.variantTitle ?? null,
      variantOptionsLabel: null,
      priceInINR: item.priceInINR,
      effectivePrice: item.effectivePrice ?? item.priceInINR,
      discountPercent: item.discountPercent ?? null,
      inventory: item.inventory ?? null,
      tenantId: item.tenantId ?? null,
      tenantStoreName: item.tenantStoreName ?? null,
      tenantLogoUrl: item.tenantLogoUrl ?? null,
      quantity: item.quantity,
    }));
  }, [status, serverCart, guestItems]);

  const itemCount = useMemo(
    () => flattenedItems.reduce((sum, item) => sum + item.quantity, 0),
    [flattenedItems],
  );

  const subtotal = useMemo(
    () =>
      flattenedItems.reduce(
        (sum, item) => sum + item.effectivePrice * item.quantity,
        0,
      ),
    [flattenedItems],
  );

  const totalSavings = useMemo(
    () =>
      flattenedItems.reduce((sum, item) => {
        const savings = item.priceInINR - item.effectivePrice;
        if (savings > 0) return sum + savings * item.quantity;
        return sum;
      }, 0),
    [flattenedItems],
  );

  const vendorGroups = useMemo<VendorGroup[]>(() => {
    const groups: VendorGroup[] = [];
    const index = new Map<string, VendorGroup>();
    for (const item of flattenedItems) {
      const tenantId = item.tenantId ?? "unknown";
      let group = index.get(tenantId);
      if (!group) {
        group = {
          tenantId,
          tenantStoreName: item.tenantStoreName || "Store",
          tenantLogoUrl: item.tenantLogoUrl,
          items: [],
          itemCount: 0,
        };
        index.set(tenantId, group);
        groups.push(group);
      }
      group.items.push(item);
      group.itemCount += item.quantity;
    }
    return groups;
  }, [flattenedItems]);

  const isServerLoading =
    addItemMutation.isPending ||
    removeItemMutation.isPending ||
    updateQuantityMutation.isPending ||
    clearCartMutation.isPending;

  const isLoading =
    status === "loggedIn" ? isPending || isServerLoading : false;

  const addItem = useCallback<CartContext["addItem"]>(
    async (item) => {
      if (status === "loggedIn") {
        await addItemMutation.mutateAsync({
          productId: item.productId,
          variantId: item.variantId,
        });
        return;
      }

      persistGuestItems((prev) => {
        const existingIndex = prev.findIndex(
          (gi) =>
            gi.productId === item.productId &&
            (gi.variantId ?? null) === (item.variantId ?? null),
        );

        if (existingIndex >= 0) {
          return prev.map((gi, i) =>
            i === existingIndex ? { ...gi, quantity: gi.quantity + 1 } : gi,
          );
        }

        return [
          ...prev,
          {
            id: generateGuestId(),
            productId: item.productId,
            productTitle: item.productTitle ?? "Product",
            productSlug: item.productSlug ?? "",
            productImageUrl: item.productImageUrl ?? null,
            variantId: item.variantId ?? null,
            variantTitle: item.variantTitle ?? null,
            priceInINR: item.priceInINR ?? 0,
            effectivePrice: item.effectivePrice ?? item.priceInINR ?? 0,
            discountPercent: item.discountPercent ?? null,
            inventory: item.inventory ?? null,
            tenantId: item.tenantId ?? null,
            tenantStoreName: item.tenantStoreName ?? null,
            tenantLogoUrl: item.tenantLogoUrl ?? null,
            quantity: 1,
          },
        ];
      });
    },
    [status, addItemMutation, persistGuestItems],
  );

  const removeItem = useCallback<CartContext["removeItem"]>(
    async (itemId) => {
      if (status === "loggedIn") {
        await removeItemMutation.mutateAsync({ itemId });
        return;
      }

      persistGuestItems((prev) => prev.filter((gi) => gi.id !== itemId));
    },
    [status, removeItemMutation, persistGuestItems],
  );

  const incrementItem = useCallback<CartContext["incrementItem"]>(
    async (itemId) => {
      if (status === "loggedIn") {
        const currentItem = serverCart?.items?.find(
          (i: ServerCartItem) => i.id === itemId,
        );
        if (!currentItem) return;

        await updateQuantityMutation.mutateAsync({
          itemId,
          quantity: currentItem.quantity + 1,
        });
        return;
      }

      persistGuestItems((prev) =>
        prev.map((gi) =>
          gi.id === itemId ? { ...gi, quantity: gi.quantity + 1 } : gi,
        ),
      );
    },
    [status, serverCart, updateQuantityMutation, persistGuestItems],
  );

  const decrementItem = useCallback<CartContext["decrementItem"]>(
    async (itemId) => {
      if (status === "loggedIn") {
        const currentItem = serverCart?.items?.find(
          (i: ServerCartItem) => i.id === itemId,
        );
        if (!currentItem) return;

        if (currentItem.quantity <= 1) {
          await removeItemMutation.mutateAsync({ itemId });
          return;
        }

        await updateQuantityMutation.mutateAsync({
          itemId,
          quantity: currentItem.quantity - 1,
        });
        return;
      }

      persistGuestItems((prev) => {
        const target = prev.find((gi) => gi.id === itemId);
        if (!target) return prev;

        if (target.quantity <= 1) {
          return prev.filter((gi) => gi.id !== itemId);
        }

        return prev.map((gi) =>
          gi.id === itemId ? { ...gi, quantity: gi.quantity - 1 } : gi,
        );
      });
    },
    [
      status,
      serverCart,
      removeItemMutation,
      updateQuantityMutation,
      persistGuestItems,
    ],
  );

  const clearCart = useCallback<CartContext["clearCart"]>(async () => {
    if (status === "loggedIn") {
      await clearCartMutation.mutateAsync();
      return;
    }

    setGuestItems([]);
    await clearGuestCart();
  }, [status, clearCartMutation]);

  return (
    <CartContext.Provider
      value={{
        cart: serverCart,
        isLoading,
        addItem,
        removeItem,
        incrementItem,
        decrementItem,
        clearCart,
        itemCount,
        subtotal,
        totalSavings,
        items: flattenedItems,
        vendorGroups,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
