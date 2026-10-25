"use client";

import React from "react";

import {
  Cash02Icon,
  CheckmarkBadge01Icon,
  DeliveryReturn02Icon,
  DeliveryTruck01Icon,
  UserGroup02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/utilities/cn";

const items = [
  {
    id: "1",
    label: "Free shipping above ₹2000",
    icon: <HugeiconsIcon icon={DeliveryTruck01Icon} className="text-primary" />,
  },
  {
    id: "2",
    label: "100% Authentic Handwoven",
    icon: (
      <HugeiconsIcon icon={CheckmarkBadge01Icon} className="text-primary" />
    ),
  },
  {
    id: "3",
    label: "200+ Artisan Vendors",
    icon: <HugeiconsIcon icon={UserGroup02Icon} className="text-primary" />,
  },
  {
    id: "4",
    label: "Easy 15-Day Returns",
    icon: (
      <HugeiconsIcon icon={DeliveryReturn02Icon} className="text-primary" />
    ),
  },
  {
    id: "5",
    label: "COD Available",
    icon: <HugeiconsIcon icon={Cash02Icon} className="text-primary" />,
  },
];

const TrustBar = () => {
  return (
    <div className="border-y border-border/70">
      <div className="container">
        <InfiniteMovingCards items={items} speed="normal" />
      </div>
    </div>
  );
};

export default TrustBar;

type MarqueeItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

export function InfiniteMovingCards({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: MarqueeItem[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) {
  const duration =
    speed === "fast" ? "20s" : speed === "normal" ? "40s" : "80s";

  return (
    <div
      className={cn(
        "group/marquee relative z-20 overflow-hidden mask-[linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
    >
      <ul
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap items-center py-1 animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]",
          "motion-reduce:w-full motion-reduce:min-w-0 motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center",
        )}
        style={
          {
            "--animation-duration": duration,
            "--animation-direction":
              direction === "left" ? "forwards" : "reverse",
          } as React.CSSProperties
        }
      >
        {items.map((item) => (
          <MarqueeRow key={item.id} item={item} />
        ))}
        {items.map((item) => (
          <MarqueeRow key={`${item.id}-clone`} item={item} clone />
        ))}
      </ul>
    </div>
  );
}

function MarqueeRow({ item, clone }: { item: MarqueeItem; clone?: boolean }) {
  return (
    <li
      aria-hidden={clone || undefined}
      className={cn(
        "relative flex w-fit max-w-full shrink-0 items-center gap-2.5 px-6 py-4 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground",
        clone && "motion-reduce:hidden",
      )}
    >
      <span className="[&_svg]:size-4">{item.icon}</span>
      <span className="whitespace-nowrap">{item.label}</span>
      <span aria-hidden className="ml-6 h-3 w-px bg-border" />
    </li>
  );
}
