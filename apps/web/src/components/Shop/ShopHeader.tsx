"use client";

import React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createUrl } from "@/utilities/createUrl";

export const ShopHeader = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeFilters = [];
  const entries = Array.from(searchParams.entries());

  for (const [key, value] of entries) {
    if (key === "q") activeFilters.push({ key, label: `Search: ${value}` });
    else if (key === "category") activeFilters.push({ key, label: `Category` });
    else if (key === "priceRange") activeFilters.push({ key, label: `Price: ${value}` });
    else if (key === "size") activeFilters.push({ key, label: `Size: ${value}` });
    else if (key === "color") activeFilters.push({ key, label: `Color: ${value}` });
    else if (key === "brand") activeFilters.push({ key, label: `Brand: ${value}` });
    else if (key === "rating") activeFilters.push({ key, label: `Rating: ${value} & Up` });
    else if (key === "occasion") activeFilters.push({ key, label: `Occasion: ${value}` });
    else if (key === "material") activeFilters.push({ key, label: `Material: ${value}` });
  }

  const removeFilter = (keyToRemove: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete(keyToRemove);
    router.push(createUrl(pathname, newParams));
  };

  const clearAll = () => {
    const sort = searchParams.get("sort");
    const newParams = new URLSearchParams();
    if (sort) newParams.set("sort", sort);
    router.push(createUrl(pathname, newParams));
  };

  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 w-full">
      <div>
        <h1 className="font-serif text-[40px] md:text-[48px] font-light text-foreground leading-tight mb-2">
          All Products
        </h1>
      </div>

      {activeFilters.length > 0 && (
        <div className="md:mb-2 flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <span
              key={filter.key}
              onClick={() => removeFilter(filter.key)}
              className="group flex items-center gap-2 bg-foreground text-background py-1.5 px-3 rounded-[2px] font-sans text-[11px] cursor-pointer"
            >
              <span>{filter.label}</span>
              <HugeiconsIcon icon={Cancel01Icon} size={12} className="opacity-60 group-hover:opacity-100 transition-opacity" />
            </span>
          ))}
          <button
            onClick={clearAll}
            className="font-sans text-[12px] text-primary ml-2 hover:underline"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};
