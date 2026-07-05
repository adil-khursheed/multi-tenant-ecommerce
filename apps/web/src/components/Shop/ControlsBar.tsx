"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  ArrowDown01Icon,
  GridViewIcon,
  Menu01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { sorting } from "@repo/types";
import { cn } from "@/utilities/cn";
import { createUrl } from "@/utilities/createUrl";

export const ControlsBar = ({
  totalDocs,
  viewMode,
  setViewMode,
}: {
  totalDocs: number;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort");
  const sortTitle =
    sorting.find((s) => s.slug === currentSort)?.title ||
    sorting[0]?.title ||
    "Sort";

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
    <div className="flex items-center justify-between h-12 border-b border-border mb-10">
      <span className="font-mono text-[12px] text-muted-foreground uppercase tracking-widest">
        {totalDocs} Products
      </span>
      <div className="flex items-center h-full">
        <div className="hidden relative group mr-4 h-full md:flex items-center z-20">
          <button className="flex items-center gap-2 font-sans text-[13px] text-foreground hover:text-primary transition-colors h-full px-2">
            Sort by: {sortTitle}{" "}
            <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
          </button>

          <div className="absolute top-full right-0 w-48 bg-card border border-border shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all origin-top scale-y-95 group-hover:scale-y-100">
            {sorting.map((option) => (
              <button
                key={option.title}
                onClick={() => handleSort(option.slug)}
                className="w-full text-left px-4 py-3 font-sans text-[13px] text-secondary-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                {option.title}
              </button>
            ))}
          </div>
        </div>
        <div className="h-4 w-px bg-border mx-2" />
        <div className="flex items-center gap-3 ml-4">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-1 transition-colors",
              viewMode === "grid" ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <HugeiconsIcon icon={GridViewIcon} size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-1 transition-colors",
              viewMode === "list" ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <HugeiconsIcon icon={Menu01Icon} size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
