"use client";

import React, { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { StarRating } from "@/components/StarRating";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTRPC } from "@/trpc/client";
import { cn } from "@/utilities/cn";
import { createUrl } from "@/utilities/createUrl";
import { SidebarGroup } from "./SidebarGroup";

const COLOR_HEX_MAP: Record<string, string> = {
  Ivory: "#FDF5E6",
  Black: "#1A1714",
  Camel: "#C19A6B",
  Rust: "#C4622D",
  Sage: "#BCB88A",
  Blush: "#F4C2C2",
  Burgundy: "#800020",
  Navy: "#000080",
  Olive: "#808000",
  Mustard: "#FFDB58",
  White: "#FDFAF6",
  Grey: "#808080",
  Red: "#FF0000",
  Blue: "#0000FF",
  Green: "#008000",
  Yellow: "#FFFF00",
  Pink: "#FFC0CB",
  Purple: "#800080",
  Orange: "#FFA500",
  Brown: "#A52A2A",
  Beige: "#F5F5DC",
  Teal: "#008080",
  Maroon: "#800000",
  Charcoal: "#36454F",
};

export const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.category.getAllCategories.queryOptions(undefined, {
      staleTime: 5 * 60 * 1000,
    }),
  );

  const { data: filterOptions } = useSuspenseQuery(
    trpc.product.getFilterOptions.queryOptions(undefined, {
      staleTime: 5 * 60 * 1000,
    }),
  );

  const setQuery = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get(key) === value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(createUrl(pathname, params));
    },
    [pathname, router, searchParams],
  );

  const handleSearch = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const val = e.target as HTMLFormElement;
    const search = val.search as HTMLInputElement;
    const params = new URLSearchParams(searchParams.toString());
    if (search.value) {
      params.set("q", search.value);
    } else {
      params.delete("q");
    }
    router.push(createUrl(pathname, params));
  };

  const activeCategory = searchParams.get("category");
  const activePrice = searchParams.get("priceRange");
  const activeSize = searchParams.get("size");
  const activeColor = searchParams.get("color");
  const activeBrand = searchParams.get("brand");
  const activeRating = searchParams.get("rating");
  const activeOccasion = searchParams.get("occasion");
  const activeMaterial = searchParams.get("material");

  return (
    <aside className="w-65 shrink-0 sticky top-10 h-[calc(100vh-80px)] overflow-y-auto pr-6 hidden md:block">
      <div className="flex items-center justify-between mb-8">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Filters
        </span>
        <button
          onClick={() => {
            const sort = searchParams.get("sort");
            const newParams = new URLSearchParams();
            if (sort) newParams.set("sort", sort);
            router.push(createUrl(pathname, newParams));
          }}
          className="font-sans text-[12px] text-primary hover:underline"
        >
          Reset All
        </button>
      </div>

      <div className="mb-8">
        <form className="relative w-full" onSubmit={handleSearch}>
          <input
            autoComplete="off"
            className="w-full bg-transparent border-b border-border py-2 pl-0 pr-6 font-sans text-[13px] outline-none placeholder:text-muted-foreground"
            defaultValue={searchParams?.get("q") || ""}
            key={searchParams?.get("q")}
            name="search"
            placeholder="Search products..."
            type="text"
          />
          <button
            type="submit"
            className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <HugeiconsIcon icon={Search01Icon} size={14} />
          </button>
        </form>
      </div>

      <SidebarGroup title="Categories">
        <div className="space-y-4">
          {data.docs.map(
            (cat: any) =>
              cat.children?.length > 0 && (
                <div key={cat.id} className="space-y-2">
                  <h4 className="font-sans font-semibold text-[13px] text-foreground">
                    {cat.name}
                  </h4>
                  <ul className="space-y-1 border-l border-border/50 ml-2 pl-3">
                    {cat.children.map((child: any) => {
                      const isActive = activeCategory === child.slug;
                      return (
                        <li
                          key={child.id}
                          className="group flex items-center justify-between cursor-pointer"
                          onClick={() =>
                            setQuery("category", String(child.slug))
                          }
                        >
                          <div
                            className={cn(
                              "flex-1 py-1 font-sans text-[13px] transition-colors",
                              isActive
                                ? "text-foreground font-medium"
                                : "text-muted-foreground group-hover:text-foreground",
                            )}
                          >
                            {child.name}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ),
          )}
        </div>
      </SidebarGroup>

      <SidebarGroup title="Price Range">
        <div className="px-1 pt-2 pb-6">
          <div className="flex flex-wrap gap-2">
            {[
              "₹0-₹499",
              "₹500-₹999",
              "₹1,000–₹1,499",
              "₹1,500–₹1,999",
              "₹2,000-₹2,999",
              "₹3,000-₹3,999",
              "₹4,000-₹4,999",
              "₹5,000-₹5,999",
              "₹6,000-₹6,999",
              "₹7,000-₹7,999",
              "₹8,000-₹8,999",
              "₹9,000-₹9,999",
              "₹10,000+",
            ].map((chip) => {
              const isActive = activePrice === chip;
              return (
                <button
                  key={chip}
                  onClick={() => setQuery("priceRange", chip)}
                  className={cn(
                    "px-3 py-1.5 font-sans text-[11px] rounded-[2px] transition-colors",
                    isActive
                      ? "bg-foreground text-background"
                      : "bg-secondary text-secondary-foreground hover:bg-border",
                  )}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>
      </SidebarGroup>

      {filterOptions.sizes.length > 0 && (
        <SidebarGroup title="Size">
          <div className="grid grid-cols-4 gap-2">
            {filterOptions.sizes.map((size) => {
              const isActive = activeSize === size;
              return (
                <button
                  key={size}
                  onClick={() => setQuery("size", size)}
                  className={cn(
                    "h-8 px-3 flex items-center justify-center border font-sans font-medium text-[12px] transition-all",
                    isActive
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-foreground hover:border-foreground",
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </SidebarGroup>
      )}

      {filterOptions.colors.length > 0 && (
        <SidebarGroup title="Color">
          <TooltipProvider delay={200}>
            <div className="grid grid-cols-6 gap-y-4 gap-x-2">
              {filterOptions.colors.map((colorName) => {
                const isActive = activeColor === colorName;
                const hex = COLOR_HEX_MAP[colorName] || "#D1D5DB";
                return (
                  <Tooltip key={colorName}>
                    <TooltipTrigger
                      onClick={() => setQuery("color", colorName)}
                      className="flex flex-col items-center gap-1 group cursor-pointer focus:outline-none"
                    >
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full border border-border transition-transform group-hover:scale-110",
                          isActive && "ring-1 ring-offset-2 ring-primary",
                        )}
                        style={{ backgroundColor: hex }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{colorName}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        </SidebarGroup>
      )}

      <SidebarGroup title="Ratings">
        <ul className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const isActive = activeRating === String(stars);
            return (
              <li
                key={stars}
                onClick={() => setQuery("rating", String(stars))}
                className={cn(
                  "flex items-center justify-between p-2 cursor-pointer transition-colors",
                  isActive
                    ? "bg-muted border-l-2 border-primary"
                    : "hover:bg-muted/50",
                )}
              >
                <div className="flex items-center gap-2">
                  <StarRating rating={stars} />
                  <span className="font-sans text-[12px] text-foreground">
                    & up
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </SidebarGroup>

      <SidebarGroup title="Occasion" defaultOpen={false}>
        <div className="space-y-3">
          {["Casual", "Festive", "Wedding", "Office", "Party", "Outdoor"].map(
            (item) => {
              const isActive = activeOccasion === item;
              return (
                <label
                  key={item}
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={(e) => {
                    e.preventDefault();
                    setQuery("occasion", item);
                  }}
                >
                  <Checkbox checked={isActive} />
                  <span
                    className={cn(
                      "font-sans text-[13px]",
                      isActive
                        ? "text-foreground font-medium"
                        : "text-secondary-foreground",
                    )}
                  >
                    {item}
                  </span>
                </label>
              );
            },
          )}
        </div>
      </SidebarGroup>

      {filterOptions.materials.length > 0 && (
        <SidebarGroup title="Fabric/Material" defaultOpen={false}>
          <div className="space-y-3">
            {filterOptions.materials.map((item) => {
              const isActive = activeMaterial === item;
              return (
                <label
                  key={item}
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={(e) => {
                    e.preventDefault();
                    setQuery("material", item);
                  }}
                >
                  <Checkbox checked={isActive} />
                  <span
                    className={cn(
                      "font-sans text-[13px]",
                      isActive
                        ? "text-foreground font-medium"
                        : "text-secondary-foreground",
                    )}
                  >
                    {item}
                  </span>
                </label>
              );
            })}
          </div>
        </SidebarGroup>
      )}

      {filterOptions.brands.length > 0 && (
        <SidebarGroup title="Brand" defaultOpen={false}>
          <div className="space-y-3">
            {filterOptions.brands.map((brand) => {
              const isActive = activeBrand === brand;
              return (
                <label
                  key={brand}
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={(e) => {
                    e.preventDefault();
                    setQuery("brand", brand);
                  }}
                >
                  <Checkbox checked={isActive} />
                  <span
                    className={cn(
                      "font-sans text-[13px]",
                      isActive
                        ? "text-foreground font-medium"
                        : "text-secondary-foreground",
                    )}
                  >
                    {brand}
                  </span>
                </label>
              );
            })}
          </div>
        </SidebarGroup>
      )}
    </aside>
  );
};
