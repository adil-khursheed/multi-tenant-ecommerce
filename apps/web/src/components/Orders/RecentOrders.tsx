"use client";

import Link from "next/link";

import { useSuspenseQuery } from "@tanstack/react-query";

import { OrderItem } from "@/components/OrderItem";
import { buttonVariants } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { cn } from "@/utilities/cn";

const RecentOrders = () => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(trpc.orders.list.queryOptions());

  const orders = data.orders.slice(0, 5);

  return (
    <div className="border p-8 rounded-lg bg-primary-foreground">
      <h2 className="text-3xl font-medium mb-8">Recent Orders</h2>

      <div className="prose dark:prose-invert mb-8">
        <p>
          These are the most recent orders you have placed. Each order is
          associated with a payment. As you place more orders, they will appear
          in your orders list.
        </p>
      </div>

      {orders.length === 0 && <p className="mb-8">You have no orders.</p>}

      {orders.length > 0 && (
        <ul className="flex flex-col gap-6 mb-8">
          {orders.map((order) => (
            <li key={order.id}>
              <OrderItem order={order} />
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/orders"
        className={cn(buttonVariants({ variant: "default" }))}
      >
        View all orders
      </Link>
    </div>
  );
};

export default RecentOrders;

export const RecentOrdersSkeleton = () => {
  return (
    <div className="border p-8 rounded-lg bg-primary-foreground">
      <h2 className="text-3xl font-medium mb-8">Recent Orders</h2>
      <div className="prose dark:prose-invert mb-8">
        <p>These are the most recent orders you have placed.</p>
      </div>
      <div className="flex flex-col gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border rounded-lg px-4 py-2 md:px-6 md:py-4 h-28 animate-pulse"
          />
        ))}
      </div>
      <div className="h-10 w-36 bg-secondary animate-pulse rounded" />
    </div>
  );
};
