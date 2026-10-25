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
            <h4 className="text-[10px] font-medium uppercase tracking-[0.14em] text-foreground">
              {column.title}
            </h4>
          )}
          {column.links?.length ? (
            <ul className="mt-4 space-y-2.5">
              {column.links.map((item, linkIndex) => (
                <li key={item.id ?? linkIndex}>
                  <CMSLink
                    appearance="link"
                    className="text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
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
