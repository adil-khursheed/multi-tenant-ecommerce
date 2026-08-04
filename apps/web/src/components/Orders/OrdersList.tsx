"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { OrderItem } from "@/components/OrderItem";
import { useTRPC } from "@/trpc/client";

const OrdersList = () => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(trpc.orders.list.queryOptions());

  const orders = data.orders;

  return (
    <div className="border p-8 rounded-lg bg-primary-foreground w-full">
      <h1 className="text-3xl font-medium mb-8">Orders</h1>
      {orders.length === 0 && <p>You have no orders.</p>}

      {orders.length > 0 && (
        <ul className="flex flex-col gap-6">
          {orders.map((order) => (
            <li key={order.id}>
              <OrderItem order={order} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrdersList;

export const OrdersListSkeleton = () => {
  return (
    <div className="border p-8 rounded-lg bg-primary-foreground w-full">
      <h1 className="text-3xl font-medium mb-8">Orders</h1>
      <div className="flex flex-col gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border rounded-lg px-4 py-2 md:px-6 md:py-4 h-28 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
};
