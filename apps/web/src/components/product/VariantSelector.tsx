"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Product } from "@/payload-types";
import { cn } from "@/utilities/cn";
import { createUrl } from "@/utilities/createUrl";
import { Button } from "../ui/button";

export function VariantSelector({ product }: { product: Product }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const variants = product.variants?.docs;
  const variantTypes = product.variantTypes;
  const hasVariants = Boolean(
    product.enableVariants && variants?.length && variantTypes?.length,
  );

  if (!hasVariants) {
    return null;
  }

  return (
    <div className="space-y-5">
      {variantTypes?.map((type) => {
        if (!type || typeof type !== "object") {
          return null;
        }

        const options = type.options?.docs;

        if (!options || !Array.isArray(options) || !options.length) {
          return null;
        }

        const isColorType = type.name.toLowerCase() === "color";

        return (
          <div className="space-y-3" key={type.id}>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium tracking-[0.08em] uppercase">
                {type.label}
              </span>
              {isColorType && (
                <span className="text-[12px] text-muted-foreground">
                  {(
                    options.find(
                      (opt) =>
                        typeof opt === "object" &&
                        searchParams.get(type.name) === String(opt.id),
                    ) as any
                  )?.label || "Select color"}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <TooltipProvider delay={100}>
                {options?.map((option) => {
                  if (!option || typeof option !== "object") {
                    return null;
                  }

                  const optionID = option.id;
                  const optionKeyLowerCase = type.name;

                  const optionSearchParams = new URLSearchParams(
                    searchParams.toString(),
                  );

                  optionSearchParams.delete("variant");
                  optionSearchParams.delete("image");
                  optionSearchParams.set(optionKeyLowerCase, String(optionID));

                  const currentOptions = Array.from(
                    optionSearchParams.values(),
                  );
                  let isAvailableForSale = true;

                  if (variants) {
                    const matchingVariant = variants
                      .filter((variant) => typeof variant === "object")
                      .find((variant) => {
                        if (!variant.options || !Array.isArray(variant.options))
                          return false;

                        return variant.options.every((variantOption) => {
                          if (typeof variantOption !== "object")
                            return currentOptions.includes(
                              String(variantOption),
                            );
                          return currentOptions.includes(
                            String(variantOption.id),
                          );
                        });
                      });

                    if (matchingVariant) {
                      optionSearchParams.set(
                        "variant",
                        String(matchingVariant.id),
                      );
                      isAvailableForSale =
                        (matchingVariant.inventory ?? 0) > 0;
                    } else {
                      isAvailableForSale = false;
                    }
                  }

                  const optionUrl = createUrl(pathname, optionSearchParams);
                  const isActive =
                    searchParams.get(optionKeyLowerCase) === String(optionID);

                  if (isColorType) {
                    return (
                      <Tooltip key={option.id}>
                        <TooltipTrigger
                          render={
                            <button
                              onClick={() => {
                                router.replace(`${optionUrl}`, {
                                  scroll: false,
                                });
                              }}
                              className={cn(
                                "w-8 h-8 rounded-full border transition-all duration-200 relative shrink-0",
                                !isAvailableForSale
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer hover:scale-110",
                                isActive
                                  ? "outline-2 outline-primary outline-offset-2 border-transparent"
                                  : "border-border hover:border-foreground",
                              )}
                              style={{ backgroundColor: option.value }} // Assuming value holds the hex color
                              title={option.label}
                            >
                              {!isAvailableForSale && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="w-px h-full bg-destructive rotate-45" />
                                </div>
                              )}
                            </button>
                          }
                        />
                        <TooltipContent>
                          <p>
                            {option.label}{" "}
                            {!isAvailableForSale && "(Out of Stock)"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  // Default text buttons for sizes, materials etc
                  return (
                    <Button
                      variant={isActive ? "default" : "outline"}
                      key={option.id}
                      onClick={() => {
                        if (isAvailableForSale) {
                          router.replace(`${optionUrl}`, { scroll: false });
                        }
                      }}
                      disabled={!isAvailableForSale}
                      className={cn(
                        "relative h-10 px-4 min-w-[52px] text-[13px] font-medium flex items-center justify-center transition-all duration-200 rounded-md overflow-hidden",
                        !isAvailableForSale
                          ? "bg-muted text-muted-foreground border-border cursor-not-allowed opacity-50"
                          : "cursor-pointer hover:border-primary hover:text-primary",
                      )}
                    >
                      {!isAvailableForSale && (
                        <div className="absolute inset-x-0 w-full h-px bg-border top-1/2 -translate-y-1/2 -rotate-25" />
                      )}
                      {option.label}
                    </Button>
                  );
                })}
              </TooltipProvider>
            </div>
          </div>
        );
      })}
    </div>
  );
}
