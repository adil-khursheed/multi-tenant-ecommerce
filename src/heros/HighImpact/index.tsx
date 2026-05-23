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
    <div className="relative container md:h-dvh">
      <div className="relative h-full w-full z-5 bg-linear-to-b from-transparent to-black flex items-end">
        <div className="w-full md:px-8 md:max-w-lg mb-10">
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
      <div className="absolute container inset-0 z-0 select-none h-full w-full">
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
