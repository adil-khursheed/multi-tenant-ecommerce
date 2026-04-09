"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Header } from "src/payload-types";

import { Cart } from "@/components/Cart";
import { OpenCartButton } from "@/components/Cart/OpenCart";
import { LogoIcon } from "@/components/icons/logo";
import { CMSLink } from "@/components/Link";
import { cn } from "@/utilities/cn";
import { MobileMenu } from "./MobileMenu";

type Props = {
  header: Header;
};

export function HeaderClient({ header }: Props) {
  const menu = header.navItems || [];
  const pathname = usePathname();

  return (
    <div className="relative z-20 border-b bg-background">
      <nav className="flex items-center md:items-end justify-between container pt-2">
        <div className="block flex-none md:hidden">
          <Suspense fallback={null}>
            <MobileMenu menu={menu} />
          </Suspense>
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex w-full items-center gap-10 md:w-1/3">
            <Link
              className="flex w-full items-center justify-center py-3 md:w-auto"
              href="/"
            >
              <LogoIcon className="w-6 h-auto" />
            </Link>

            {menu.length ? (
              <ul className="hidden gap-8 text-sm md:flex md:items-center">
                {menu.map((item) => (
                  <li key={item.id}>
                    <CMSLink
                      {...item.link}
                      size={"sm"}
                      className={cn(
                        "relative navLink text-xs tracking-[1.8px] font-medium uppercase",
                        {
                          active:
                            item.link.url && item.link.url !== "/"
                              ? pathname.includes(item.link.url)
                              : false,
                        },
                      )}
                      appearance="link"
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="flex justify-end md:w-1/3 gap-4">
            <Suspense fallback={<OpenCartButton />}>
              <Cart />
            </Suspense>
          </div>
        </div>
      </nav>
    </div>
  );
}
