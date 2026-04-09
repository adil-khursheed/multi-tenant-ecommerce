"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utilities/cn";

type Props = {
  className?: string;
};

export const AccountNav: React.FC<Props> = ({ className }) => {
  const pathname = usePathname();

  return (
    <div className={cn(className)}>
      <ul className="flex flex-col gap-2">
        <li>
          <Link
            href="/account"
            className={cn(
              buttonVariants({ variant: "link" }),
              "text-primary/50 hover:text-primary hover:no-underline",
              {
                "text-primary": pathname === "/account",
              },
            )}
          >
            Account settings
          </Link>
        </li>

        <li>
          <Link
            href="/account/addresses"
            className={cn(
              buttonVariants({ variant: "link" }),
              "text-primary/50 hover:text-primary hover:no-underline",
              {
                "text-primary": pathname === "/account/addresses",
              },
            )}
          >
            Addresses
          </Link>
        </li>

        <li>
          <Link
            href="/orders"
            className={cn(
              buttonVariants({ variant: "link" }),
              "text-primary/50 hover:text-primary hover:no-underline",
              {
                "text-primary":
                  pathname === "/orders" || pathname.includes("/orders"),
              },
            )}
          >
            Orders
          </Link>
        </li>
      </ul>

      <hr className="w-full border-white/5" />

      <Link
        href="/logout"
        className={cn(
          buttonVariants({ variant: "link" }),
          "text-primary/50 hover:text-primary hover:no-underline",
          {
            "text-primary": pathname === "/logout",
          },
        )}
      >
        Log out
      </Link>
    </div>
  );
};
