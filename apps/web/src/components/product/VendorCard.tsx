import React from "react";
import Link from "next/link";

import { CheckmarkBadge01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/payload-types";
import { cn } from "@/utilities/cn";

export const VendorCard: React.FC<{ product: Product }> = ({ product }) => {
  const tenant = typeof product.tenant === "object" ? product.tenant : null;

  if (!tenant) return null;

  const isVerified = tenant.verificationStatus === "approved";

  return (
    <Card className="mt-12 overflow-hidden border-border/50 bg-muted/20">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-background">
              <AvatarImage
                src={
                  typeof tenant.storeLogo === "object" && tenant.storeLogo?.url
                    ? tenant.storeLogo.url
                    : undefined
                }
                alt={tenant.storeName || "Store Logo"}
              />
              <AvatarFallback className="text-xl">
                {tenant.storeName?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-heading font-medium">
                  {tenant.storeName}
                </h3>
                {isVerified && (
                  <Badge
                    variant="secondary"
                    className="gap-1 h-6 px-2 bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    <HugeiconsIcon
                      icon={CheckmarkBadge01Icon}
                      size={14}
                      className="fill-current"
                    />
                    Verified
                  </Badge>
                )}
              </div>
              {tenant.storeDescription && (
                <p className="text-sm text-muted-foreground line-clamp-2 max-w-100">
                  {tenant.storeDescription}
                </p>
              )}
            </div>
          </div>

          <div className="flex w-full sm:w-auto items-center gap-3">
            <Link
              href={`/shop?brand=${tenant.storeName}`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full sm:w-auto",
              )}
            >
              Visit Store
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
