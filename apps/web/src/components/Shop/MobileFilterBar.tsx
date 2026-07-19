"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ArrowDown01Icon, FilterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { sorting } from "@repo/types";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { StarRating } from "@/components/StarRating";
import { useTRPC } from "@/trpc/client";
import { cn } from "@/utilities/cn";
import { createUrl } from "@/utilities/createUrl";
import { SidebarGroup } from "./SidebarGroup";

export const MobileFilterBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [localParams, setLocalParams] = useState(
    new URLSearchParams(searchParams.toString()),
  );

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

  const activeCount = Array.from(searchParams.entries()).filter(
    ([k]) => k !== "sort" && k !== "q",
  ).length;

  const handleApply = () => {
    router.push(createUrl(pathname, localParams));
  };

  const handleReset = () => {
    const sort = searchParams.get("sort");
    const newParams = new URLSearchParams();
    if (sort) newParams.set("sort", sort);
    setLocalParams(newParams);
    router.push(createUrl(pathname, newParams));
  };

  const toggleLocalParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(localParams.toString());
    if (newParams.get(key) === value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setLocalParams(newParams);
  };

  const handleSort = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("sort", slug);
    } else {
      params.delete("sort");
    }
    router.push(createUrl(pathname, params));
  };

  return (
    <div className="md:hidden sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex gap-2">
      <Drawer>
        <DrawerTrigger asChild>
          <button className="flex-1 flex items-center justify-center gap-2 h-11 border border-border font-sans font-medium text-[13px] uppercase tracking-wider text-foreground bg-card">
            <HugeiconsIcon icon={FilterIcon} size={16} /> Filters{" "}
            {activeCount > 0 ? `(${activeCount})` : ""}
          </button>
        </DrawerTrigger>
        <DrawerContent className="bg-background flex flex-col rounded-t-[20px] h-[85%] mt-24 fixed bottom-0 left-0 right-0 z-50">
          <DrawerHeader className="border-b border-border text-left flex justify-between items-center">
            <DrawerTitle className="font-display text-[24px] text-foreground">
              Filters
            </DrawerTitle>
            <button
              onClick={handleReset}
              className="font-sans text-[12px] text-primary"
            >
              Reset All
            </button>
          </DrawerHeader>
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="space-y-8 pb-20">
              <SidebarGroup title="Categories">
                <div className="space-y-4">
                  {data.docs.map(
                    (cat: any) =>
                      cat.children?.length > 0 && (
                        <div key={cat.id} className="space-y-2">
                          <h4 className="font-sans font-semibold text-[13px] text-foreground">
                            {cat.name}
                          </h4>
                          <ul className="grid grid-cols-2 gap-2 mt-2">
                            {cat.children.map((child: any) => {
                              const isActive =
                                localParams.get("category") === child.slug;
                              return (
                                <li
                                  key={child.id}
                                  onClick={() =>
                                    toggleLocalParam(
                                      "category",
                                      String(child.slug),
                                    )
                                  }
                                  className={cn(
                                    "p-2 border font-sans text-[12px] text-center rounded-[2px] cursor-pointer",
                                    isActive
                                      ? "bg-foreground text-background border-foreground"
                                      : "border-border text-secondary-foreground",
                                  )}
                                >
                                  {child.name}
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
                <div className="flex gap-2 flex-wrap">
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
                    const isActive = localParams.get("priceRange") === chip;
                    return (
                      <button
                        key={chip}
                        onClick={() => toggleLocalParam("priceRange", chip)}
                        className={cn(
                          "px-4 py-2 border font-sans text-[12px] rounded-[2px]",
                          isActive
                            ? "bg-foreground text-background border-foreground"
                            : "border-border text-secondary-foreground",
                        )}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </SidebarGroup>

              {filterOptions.sizes.length > 0 && (
                <SidebarGroup title="Size">
                  <div className="grid grid-cols-4 gap-2">
                    {filterOptions.sizes.map((s) => {
                      const isActive = localParams.get("size") === s;
                      return (
                        <button
                          key={s}
                          onClick={() => toggleLocalParam("size", s)}
                          className={cn(
                            "h-10 border font-sans text-[12px] rounded-[2px]",
                            isActive
                              ? "bg-foreground text-background border-foreground"
                              : "border-border text-foreground",
                          )}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </SidebarGroup>
              )}

              {filterOptions.colors.length > 0 && (
                <SidebarGroup title="Color">
                  <div className="flex gap-2 flex-wrap">
                    {filterOptions.colors.map((colorName) => {
                      const isActive = localParams.get("color") === colorName;
                      return (
                        <button
                          key={colorName}
                          onClick={() => toggleLocalParam("color", colorName)}
                          className={cn(
                            "px-4 py-2 border font-sans text-[12px] rounded-[2px]",
                            isActive
                              ? "bg-foreground text-background border-foreground"
                              : "border-border text-secondary-foreground",
                          )}
                        >
                          {colorName}
                        </button>
                      );
                    })}
                  </div>
                </SidebarGroup>
              )}

              <SidebarGroup title="Ratings">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const isActive =
                      localParams.get("rating") === String(stars);
                    return (
                      <div
                        key={stars}
                        onClick={() => toggleLocalParam("rating", String(stars))}
                        className={cn(
                          "flex items-center gap-2 p-2 cursor-pointer rounded-[2px]",
                          isActive
                            ? "bg-muted border-l-2 border-primary"
                            : "hover:bg-muted/50",
                        )}
                      >
                        <StarRating rating={stars} />
                        <span className="font-sans text-[12px] text-foreground">
                          & up
                        </span>
                      </div>
                    );
                  })}
                </div>
              </SidebarGroup>

              <SidebarGroup title="Occasion">
                <div className="grid grid-cols-2 gap-2">
                  {["Casual", "Festive", "Wedding", "Office", "Party", "Outdoor"].map(
                    (item) => {
                      const isActive = localParams.get("occasion") === item;
                      return (
                        <label
                          key={item}
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleLocalParam("occasion", item);
                          }}
                        >
                          <Checkbox checked={isActive} />
                          <span
                            className={cn(
                              "font-sans text-[12px]",
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
                <SidebarGroup title="Fabric/Material">
                  <div className="grid grid-cols-2 gap-2">
                    {filterOptions.materials.map((item) => {
                      const isActive = localParams.get("material") === item;
                      return (
                        <label
                          key={item}
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleLocalParam("material", item);
                          }}
                        >
                          <Checkbox checked={isActive} />
                          <span
                            className={cn(
                              "font-sans text-[12px]",
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
                <SidebarGroup title="Brand">
                  <div className="grid grid-cols-2 gap-2">
                    {filterOptions.brands.map((brand) => {
                      const isActive = localParams.get("brand") === brand;
                      return (
                        <label
                          key={brand}
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleLocalParam("brand", brand);
                          }}
                        >
                          <Checkbox checked={isActive} />
                          <span
                            className={cn(
                              "font-sans text-[12px]",
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
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border z-10">
              <DrawerClose asChild>
                <button
                  onClick={handleApply}
                  className="w-full h-12 bg-primary text-primary-foreground font-sans font-medium text-[14px] uppercase tracking-widest rounded-[2px]"
                >
                  Apply Filters
                </button>
              </DrawerClose>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer>
        <DrawerTrigger asChild>
          <button className="w-1/3 flex items-center justify-center gap-2 h-11 border border-border font-sans font-medium text-[13px] uppercase tracking-wider text-foreground bg-card">
            Sort <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
          </button>
        </DrawerTrigger>
        <DrawerContent className="bg-background flex flex-col rounded-t-[20px] fixed bottom-0 left-0 right-0 z-50">
          <DrawerHeader className="border-b border-border text-left">
            <DrawerTitle className="font-display text-[24px] text-foreground">
              Sort By
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-8">
            <div className="flex flex-col gap-2">
              {sorting.map((option) => (
                <DrawerClose asChild key={option.title}>
                  <button
                    onClick={() => handleSort(option.slug)}
                    className={cn(
                      "w-full text-left px-4 py-3 font-sans text-[14px] rounded-[2px]",
                      searchParams.get("sort") === option.slug
                        ? "bg-foreground text-background"
                        : "text-secondary-foreground hover:bg-secondary",
                    )}
                  >
                    {option.title}
                  </button>
                </DrawerClose>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
