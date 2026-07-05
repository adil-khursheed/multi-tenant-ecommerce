"use client";

import React, { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import clsx from "clsx";

import { Button } from "@/components/ui/button";
import { Category } from "@/payload-types";

type Props = {
  category: Category;
};

export const CategoryItem: React.FC<Props> = ({ category }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = useMemo(() => {
    return searchParams.get("category") === String(category.id);
  }, [category.id, searchParams]);

  const setQuery = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (isActive) {
      params.delete("category");
    } else {
      params.set("category", String(category.id));
    }

    const newParams = params.toString();

    router.push(pathname + "?" + newParams);
  }, [category.id, isActive, pathname, router, searchParams]);

  return (
    <Button
      variant={"link"}
      size={"sm"}
      onClick={() => setQuery()}
      className={clsx("hover:cursor-pointer px-0", {
        " underline": isActive,
      })}
    >
      {category.name}
    </Button>
  );
};
