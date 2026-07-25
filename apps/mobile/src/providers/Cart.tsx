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

type CartContext = {
  cart: Cart | null;
  isLoading: boolean;
  addItem: (item: {
    productId: string;
    variantId?: string;
    productTitle?: string;
    productSlug?: string;
    productImageUrl?: string | null;
    variantTitle?: string | null;
    priceInINR?: number;
  }) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  incrementItem: (itemId: string) => Promise<void>;
  decrementItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
  subtotal: number;
  items: FlattenedCartItem[];
};

export type FlattenedCartItem = {
  id: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  productImageUrl: string | null;
  variantId: string | null;
  variantTitle: string | null;
  priceInINR: number;
  quantity: number;
};

const CartContext = createContext<CartContext>({} as CartContext);

function flattenServerItem(item: ServerCartItem): FlattenedCartItem | null {
  const product = item.product;
  if (typeof product !== "object" || !product) return null;

  const variant =
    item.variant && typeof item.variant === "object" ? item.variant : null;
  const gallery = product.gallery as { image: unknown }[] | undefined;
  const firstGalleryImage =
    gallery?.[0]?.image && typeof gallery[0].image === "object"
      ? (gallery[0].image as { url?: string })
      : null;

  return {
    id: item.id ?? "",
    productId: product.id ?? "",
    productTitle: product.title ?? "",
    productSlug: (product as { slug?: string }).slug ?? "",
    productImageUrl: firstGalleryImage?.url ?? null,
    variantId: variant?.id ?? null,
    variantTitle: variant?.title ?? null,
    priceInINR: variant?.priceInINR ?? product.priceInINR ?? 0,
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
      priceInINR: item.priceInINR,
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
        (sum, item) => sum + item.priceInINR * item.quantity,
        0,
      ),
    [flattenedItems],
  );

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
        items: flattenedItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
