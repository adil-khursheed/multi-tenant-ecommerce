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
    <div className="relative h-dvh flex flex-col-reverse md:flex-row-reverse items-center justify-center text-primary">
      <div className="mb-8 z-10 relative flex items-center justify-center md:w-1/3">
        <div className="px-5 md:px-10">
          {richText && (
            <RichText className="mb-6" data={richText} enableGutter={false} />
          )}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex md:justify-center gap-4">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      <div className="min-h-dvh select-none flex-1">
        {media && typeof media === "object" && (
          <Media
            fill
            imgClassName="object-cover object-top"
            className="relative w-full min-h-dvh"
            priority
            resource={media}
          />
        )}
      </div>
    </div>
  );
};
