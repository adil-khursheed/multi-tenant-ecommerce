"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import type { Media } from "@/payload-types";

export type StripItem = {
  slug: string;
  name: string;
  coverImage: Media | null;
};

const StripCard: React.FC<{ item: StripItem }> = ({ item }) => (
  <Link
    className="group relative block aspect-3/4 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black"
    href={`/collections/${item.slug}`}
  >
    {item.coverImage?.url && (
      <Image
        fill
        src={item.coverImage.url}
        alt={item.coverImage.alt ?? item.name}
        className="object-cover transition duration-300 ease-out group-hover:scale-105"
        sizes="(max-width: 640px) 68vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
      />
    )}
    <div className="absolute inset-0 flex items-end bg-linear-to-b from-transparent via-transparent to-black/60 p-4">
      <span className="text-base font-semibold uppercase tracking-wide text-white drop-shadow-sm md:text-lg">
        {item.name}
      </span>
    </div>
  </Link>
);

const StripArrows: React.FC = () => {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } =
    useCarousel();

  return (
    <>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Previous collections"
        className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full md:inline-flex"
        disabled={!canScrollPrev}
        onClick={scrollPrev}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Next collections"
        className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full md:inline-flex"
        disabled={!canScrollNext}
        onClick={scrollNext}
      >
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
      </Button>
    </>
  );
};

export const CollectionsStripClient: React.FC<{ items: StripItem[] }> = ({
  items,
}) => {
  if (!items?.length) return null;

  return (
    <Carousel
      className="w-full"
      opts={{ align: "start", loop: false, containScroll: "trimSnaps" }}
    >
      <CarouselContent>
        {items.map((item) => (
          <CarouselItem
            className="basis-[68%] flex-none md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            key={item.slug}
          >
            <StripCard item={item} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <StripArrows />
    </Carousel>
  );
};
