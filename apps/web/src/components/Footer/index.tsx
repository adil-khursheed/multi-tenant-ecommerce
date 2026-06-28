import { env } from "@/env";
import type { Footer } from "@/payload-types";
import { getCachedGlobal } from "@/utilities/getGlobals";

const { COMPANY_NAME, SITE_NAME } = env;

export async function Footer() {
  const footer: Footer = await getCachedGlobal("footer", 1)();
  const menu = footer.navItems || [];
  const currentYear = new Date().getFullYear();
  const skeleton =
    "w-full h-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700";

  const copyrightName = COMPANY_NAME || SITE_NAME || "";

  return (
    <footer className="text-sm text-neutral-500 dark:text-neutral-400">
      <div className="border-t border-neutral-200 py-6 text-sm dark:border-neutral-700">
        <div className="container mx-auto flex w-full flex-col items-center gap-1 md:flex-row md:gap-0">
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
