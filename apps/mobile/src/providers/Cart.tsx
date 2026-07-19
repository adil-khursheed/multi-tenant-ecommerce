import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RouterOutputs } from "@repo/api";

import { useTRPC } from "@/utils/api";
import { useAuth } from "./Auth";

type Cart = RouterOutputs["cart"]["get"]["cart"];

type CartItem = NonNullable<Cart["items"]>[number];

type CartContext = {
  cart: Cart | null;
  isLoading: boolean;
  addItem: (item: { productId: string; variantId?: string }) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  incrementItem: (itemId: string) => Promise<void>;
  decrementItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
};

const CartContext = createContext<CartContext>({} as CartContext);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const trpc = useTRPC();
  const { status } = useAuth();
  const queryClient = useQueryClient();

  const { data: cartData, isPending } = useQuery(
    trpc.cart.get.queryOptions(undefined, {
      enabled: status === "loggedIn",
    }),
  );

  const cart = cartData?.cart ?? null;

  const itemCount = useMemo(() => {
    return (
      cart?.items?.reduce(
        (sum: number, item: CartItem) => sum + item.quantity,
        0,
      ) ?? 0
    );
  }, [cart]);

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

  const isLoading =
    addItemMutation.isPending ||
    removeItemMutation.isPending ||
    updateQuantityMutation.isPending ||
    clearCartMutation.isPending;

  const addItem = useCallback<CartContext["addItem"]>(
    async (item) => {
      await addItemMutation.mutateAsync(item);
    },
    [addItemMutation],
  );

  const removeItem = useCallback<CartContext["removeItem"]>(
    async (itemId) => {
      await removeItemMutation.mutateAsync({ itemId });
    },
    [removeItemMutation],
  );

  const incrementItem = useCallback<CartContext["incrementItem"]>(
    async (itemId) => {
      const currentItem = cart?.items?.find(
        (i: CartItem) => i.id === itemId,
      );
      if (!currentItem) return;

      await updateQuantityMutation.mutateAsync({
        itemId,
        quantity: currentItem.quantity + 1,
      });
    },
    [cart, updateQuantityMutation],
  );

  const decrementItem = useCallback<CartContext["decrementItem"]>(
    async (itemId) => {
      const currentItem = cart?.items?.find(
        (i: CartItem) => i.id === itemId,
      );
      if (!currentItem) return;

      if (currentItem.quantity <= 1) {
        await removeItem(itemId);
        return;
      }

      await updateQuantityMutation.mutateAsync({
        itemId,
        quantity: currentItem.quantity - 1,
      });
    },
    [cart, removeItem, updateQuantityMutation],
  );

  const clearCart = useCallback(async () => {
    await clearCartMutation.mutateAsync();
  }, [clearCartMutation]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addItem,
        removeItem,
        incrementItem,
        decrementItem,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
