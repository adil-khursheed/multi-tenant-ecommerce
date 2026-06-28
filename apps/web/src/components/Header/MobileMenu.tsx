"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { MenuIcon } from "lucide-react";

import { CMSLink } from "@/components/Link";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Header } from "@/payload-types";
import { useAuth } from "@/providers/Auth";
import { cn } from "@/utilities/cn";

interface Props {
  menu: Header["navItems"];
}

export function MobileMenu({ menu }: Props) {
  const { user } = useAuth();

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const closeMobileMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, searchParams]);

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:bg-black dark:text-white">
        <MenuIcon className="h-4" />
      </SheetTrigger>

      <SheetContent side="left" className="px-4">
        <SheetHeader className="px-0 pt-4 pb-0">
          <SheetTitle>My Store</SheetTitle>

          <SheetDescription />
        </SheetHeader>

        <div className="py-4">
          {menu?.length ? (
            <ul className="flex w-full flex-col">
              {menu.map((item) => (
                <li className="py-2" key={item.id}>
                  <CMSLink {...item.link} appearance="link" />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {user ? (
          <div className="mt-4">
            <h2 className="text-xl mb-4">My account</h2>
            <hr className="my-2" />
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/orders">Orders</Link>
              </li>
              <li>
                <Link href="/account/addresses">Addresses</Link>
              </li>
              <li>
                <Link href="/account">Manage account</Link>
              </li>
              <li className="mt-6">
                <Link
                  href="/logout"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Log out
                </Link>
              </li>
            </ul>
          </div>
        ) : (
          <div>
            <h2 className="text-xl mb-4">My account</h2>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full sm:flex-1",
                )}
              >
                Log in
              </Link>
              <span className="text-center text-sm text-muted-foreground sm:text-base">
                or
              </span>
              <Link
                href="/create-account"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "w-full sm:flex-1",
                )}
              >
                Create an account
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
