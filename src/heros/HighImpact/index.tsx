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
    <div className="relative container md:h-[calc(100dvh-73px)] flex flex-col-reverse md:flex-row-reverse items-center justify-center">
      <div className="mb-8 z-10 relative flex items-center justify-center flex-1">
        <div className="w-full md:px-8 md:max-w-lg mx-auto">
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
      <div className="select-none flex-1 h-full w-full aspect-768/1027">
        {media && typeof media === "object" && (
          <Media
            fill
            imgClassName="object-cover w-full h-full"
            className="relative w-full h-full"
            priority
            resource={media}
          />
        )}
      </div>
    </div>
  );
};
