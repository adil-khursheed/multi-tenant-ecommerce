import React from "react";

import { CMSLink } from "@/components/Link";
import { Media } from "@/components/Media";
import { RichText } from "@/components/RichText";
import type { Page } from "@/payload-types";

export const HighImpactHero: React.FC<Page["hero"]> = ({
  links,
  media,
  richText,
}) => {
  return (
    <div className="relative h-dvh flex flex-col-reverse md:flex-row items-center justify-between">
      <div className="flex-1 h-full flex items-center justify-center bg-primary/5 p-4">
        <div className="relative z-10 w-full md:px-8 md:max-w-lg mb-10">
          {richText && (
            <RichText className="mb-6" data={richText} enableGutter={false} />
          )}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex gap-4">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink
                      {...link}
                      size={"lg"}
                      className="h-11 px-4 text-sm font-medium uppercase"
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      <div className="select-none flex-1 h-full w-full">
        {media && typeof media === "object" && (
          <Media
            fill
            imgClassName="object-cover w-full h-full"
            className="relative w-full h-full"
            priority
            resource={media}
            size="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
          />
        )}
      </div>
    </div>
  );
};
