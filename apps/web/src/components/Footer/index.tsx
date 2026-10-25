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
    <footer className="text-sm text-muted-foreground">
      <div className="border-t border-border py-12">
        <div className="container grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16">
          <div>
            <Link
              className="inline-block opacity-90 transition-opacity duration-300 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              href="/"
            >
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

        <div className="container mx-auto mt-10 flex w-full flex-col items-center gap-1 border-t border-border pt-6 md:flex-row md:gap-0">
          <p>
            &copy; {currentYear} {copyrightName}
            {copyrightName.length && !copyrightName.endsWith(".")
              ? "."
              : ""}{" "}
            All rights reserved.
          </p>
          <p className="md:ml-auto">
            <a
              className="text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
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
