"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  AccountSetting01Icon,
  AddressBookIcon,
  FavouriteIcon,
  LoginSquare02Icon,
  LogoutSquare02Icon,
  ShoppingBasketDone01Icon,
  Store03Icon,
  User02Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Header } from "src/payload-types";

import { Cart } from "@/components/Cart";
import { OpenCartButton } from "@/components/Cart/OpenCart";
import { LogoIcon } from "@/components/icons/logo";
import { CMSLink } from "@/components/Link";
import { User } from "@/payload-types";
import { cn } from "@/utilities/cn";
import { Button, buttonVariants } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MobileMenu } from "./MobileMenu";

type Props = {
  header: Header;
  user: User | null;
};

export function HeaderClient({ header, user }: Props) {
  const menu = header.navItems || [];
  const pathname = usePathname();

  return (
    <div className="relative z-20 border-b border-border bg-background">
      <nav className="flex items-center md:items-end justify-between container pt-2">
        <div className="block flex-none md:hidden">
          <Suspense fallback={null}>
            <MobileMenu menu={menu} />
          </Suspense>
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex w-full items-center gap-10 md:w-1/3">
            <Link
              className="flex w-full items-center justify-center py-4 md:w-auto"
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
                        "relative navLink text-xs tracking-[1.8px] font-medium uppercase hover:no-underline",
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
            <Suspense>
              <Button
                variant="ghost"
                size="icon"
                className="items-center hover:bg-transparent [&_svg:not([class*='size-'])]:size-5"
              >
                <HugeiconsIcon icon={FavouriteIcon} />
              </Button>
            </Suspense>

            <Suspense fallback={<OpenCartButton />}>
              <Cart />
            </Suspense>

            <div className="hidden gap-8 text-sm md:flex md:items-center">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="items-center hover:bg-transparent [&_svg:not([class*='size-'])]:size-5"
                    >
                      <HugeiconsIcon icon={User02Icon} />
                    </Button>
                  }
                />
                <DropdownMenuContent className="w-56" align="start">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    {user ? (
                      <>
                        <DropdownMenuItem
                          render={
                            <Link
                              href="/orders"
                              className={cn(
                                buttonVariants({
                                  variant: "ghost",
                                  size: "lg",
                                }),
                                "w-full cursor-pointer justify-start",
                              )}
                            >
                              <HugeiconsIcon icon={ShoppingBasketDone01Icon} />
                              Orders
                            </Link>
                          }
                        />

                        <DropdownMenuItem
                          render={
                            <Link
                              href="/account/addresses"
                              className={cn(
                                buttonVariants({
                                  variant: "ghost",
                                  size: "lg",
                                }),
                                "w-full cursor-pointer justify-start",
                              )}
                            >
                              <HugeiconsIcon icon={AddressBookIcon} />
                              Addresses
                            </Link>
                          }
                        />

                        <DropdownMenuItem
                          render={
                            <Link
                              href="/account"
                              className={cn(
                                buttonVariants({
                                  variant: "ghost",
                                  size: "lg",
                                }),
                                "w-full cursor-pointer justify-start",
                              )}
                            >
                              <HugeiconsIcon icon={AccountSetting01Icon} />
                              Manage Account
                            </Link>
                          }
                        />

                        <DropdownMenuItem
                          render={
                            <Link
                              href="/logout"
                              className={cn(
                                buttonVariants({
                                  variant: "ghost",
                                  size: "lg",
                                }),
                                "w-full cursor-pointer justify-start",
                              )}
                            >
                              <HugeiconsIcon icon={LogoutSquare02Icon} />
                              Logout
                            </Link>
                          }
                        />
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem
                          render={
                            <Link
                              href="/login"
                              className={cn(
                                buttonVariants({
                                  variant: "ghost",
                                  size: "lg",
                                }),
                                "w-full cursor-pointer justify-start",
                              )}
                            >
                              <HugeiconsIcon icon={LoginSquare02Icon} />
                              Login
                            </Link>
                          }
                        />

                        <DropdownMenuItem
                          render={
                            <Link
                              href="/create-account"
                              className={cn(
                                buttonVariants({
                                  variant: "ghost",
                                  size: "lg",
                                }),
                                "w-full cursor-pointer justify-start",
                              )}
                            >
                              <HugeiconsIcon icon={UserAdd01Icon} />
                              Create Account
                            </Link>
                          }
                        />
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      render={
                        <Link
                          href={
                            !user
                              ? "/create-account?account-type=vendor"
                              : "/create-account/vendor"
                          }
                          className={cn(
                            buttonVariants({
                              variant: "ghost",
                              size: "lg",
                            }),
                            "w-full cursor-pointer justify-start",
                          )}
                        >
                          <HugeiconsIcon icon={Store03Icon} />
                          Start Selling
                        </Link>
                      }
                    />
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
