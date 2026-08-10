import React from "react";

import { CMSLink } from "@/components/Link";
import type { Footer } from "@/payload-types";

interface Props {
  columns: NonNullable<Footer["columns"]>;
}

export function FooterMenu({ columns }: Props) {
  return (
    <nav className="flex flex-wrap gap-x-16 gap-y-10">
      {columns.map((column, columnIndex) => (
        <div key={column.id ?? columnIndex}>
          {column.title && (
            <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-900 dark:text-white">
              {column.title}
            </h4>
          )}
          {column.links?.length ? (
            <ul className="mt-4 space-y-2.5">
              {column.links.map((item, linkIndex) => (
                <li key={item.id ?? linkIndex}>
                  <CMSLink
                    appearance="link"
                    className="text-neutral-500 hover:text-primary dark:text-neutral-400 dark:hover:text-primary"
                    {...item.link}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </nav>
  );
}
