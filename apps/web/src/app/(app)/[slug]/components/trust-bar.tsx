"use client";

import React, { useEffect, useState } from "react";

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
    <div className="container">
      <InfiniteMovingCards items={items} speed="normal" />
    </div>
  );
};

export default TrustBar;

export function InfiniteMovingCards({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    id: string;
    label: string;
    icon: React.ReactNode;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  useEffect(() => {
    addAnimation();
  }, []);
  const [start, setStart] = useState(false);
  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }
  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards",
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse",
        );
      }
    }
  };
  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "80s");
      }
    }
  };
  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 overflow-hidden mask-[linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className,
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4",
          start && "animate-scroll",
          pauseOnHover && "hover:paused",
        )}
      >
        {items.map((item, idx) => (
          <li
            className="relative w-fit max-w-full shrink-0 flex items-center gap-3 bg-transparent px-8 py-4 text-sm font-medium uppercase tracking-widest"
            key={item.id}
          >
            {item.icon}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
