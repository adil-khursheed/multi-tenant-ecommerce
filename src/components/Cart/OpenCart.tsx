import { ShoppingBag01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";

export function OpenCartButton({
  className,
  quantity,
  ...rest
}: {
  className?: string;
  quantity?: number;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative navLink items-center hover:bg-transparent [&_svg:not([class*='size-'])]:size-5"
      {...rest}
    >
      <HugeiconsIcon icon={ShoppingBag01Icon} />

      {quantity ? (
        <Badge className="absolute -top-1.5 -right-1.5 z-20 size-5 rounded-full text-[9px] font-medium">
          {quantity}
        </Badge>
      ) : null}
    </Button>
  );
}
