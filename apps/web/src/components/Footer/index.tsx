import Link from "next/link";

import { LogoIcon } from "@/components/icons/logo";
import { Media } from "@/components/Media";
import { env } from "@/env";
import type { Footer } from "@/payload-types";
import { getCachedGlobal } from "@/utilities/getGlobals";
import { FooterMenu } from "./menu";

const { COMPANY_NAME, SITE_NAME } = env;

export async function Footer() {
  const footer: Footer = await getCachedGlobal("footer", 1)();
  const columns = footer.columns || [];
  const logo = footer.logo || null;

  const currentYear = new Date().getFullYear();
  const copyrightName = COMPANY_NAME || SITE_NAME || "";

  return (
    <footer className="text-sm text-neutral-500 dark:text-neutral-400">
      <div className="border-t border-neutral-200 py-12 dark:border-neutral-700">
        <div className="container grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16">
          <div>
            <Link className="inline-block" href="/">
              {logo && typeof logo === "object" && "url" in logo ? (
                <Media
                  imgClassName="size-16"
                  className="h-full w-full"
                  resource={logo}
                />
              ) : (
                <LogoIcon className="h-auto w-6" />
              )}
            </Link>
          </div>

          {columns.length > 0 && <FooterMenu columns={columns} />}
        </div>

        <div className="container mx-auto mt-10 flex w-full flex-col items-center gap-1 border-t border-neutral-200 pt-6 dark:border-neutral-700 md:flex-row md:gap-0">
          <p>
            &copy; {currentYear} {copyrightName}
            {copyrightName.length && !copyrightName.endsWith(".")
              ? "."
              : ""}{" "}
            All rights reserved.
          </p>
          <p className="md:ml-auto">
            <a
              className="text-black dark:text-white"
              href="https://codezora.com"
            >
              Crafted by Codezora
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
