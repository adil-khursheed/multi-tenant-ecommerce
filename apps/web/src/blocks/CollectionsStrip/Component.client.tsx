"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpRight,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@/components/ui/carousel";
import type { Media } from "@/payload-types";
import { cn } from "@/utilities/cn";

export type StripItem = {
  slug: string;
  name: string;
  coverImage: Media | null;
};

const StripCard: React.FC<{ item: StripItem }> = ({ item }) => {
  const hasImage = Boolean(item.coverImage?.url);

  return (
    <Link
      className="group relative flex aspect-3/4 w-full flex-col justify-end overflow-hidden border border-border/70 bg-secondary outline-offset-4 transition-colors duration-300 hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-ring"
      href={`/collections/${item.slug}`}
    >
      {hasImage ? (
        <Image
          fill
          src={item.coverImage!.url!}
          alt={item.coverImage?.alt ?? item.name}
          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
          sizes="(max-width: 640px) 68vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
        />
      ) : (
        <span
          aria-hidden
          className="pointer-events-none absolute -top-5 right-1 select-none font-serif text-[8rem] leading-none text-primary/10 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-hover:text-primary/20 sm:text-[10rem]"
        >
          {item.name.charAt(0)}
        </span>
      )}

      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          hasImage
            ? "bg-linear-to-t from-black/80 via-black/10 to-transparent"
            : "bg-linear-to-t from-secondary via-secondary/30 to-transparent",
        )}
      />

      <div className="relative z-10 flex items-end justify-between gap-3 p-4">
        <span
          className={cn(
            "max-w-[15ch] font-serif text-[22px] leading-[0.98] tracking-[-0.01em]",
            hasImage ? "text-white" : "text-foreground",
          )}
        >
          {item.name}
        </span>
        <span
          className={cn(
            "mb-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
            hasImage
              ? "border-white/40 text-white/90 group-hover:border-white group-hover:bg-white group-hover:text-black"
              : "border-border text-primary group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground",
          )}
        >
          <HugeiconsIcon
            icon={ArrowUpRight}
            size={13}
            strokeWidth={2}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </Link>
  );
};

const StripArrows: React.FC = () => {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } =
    useCarousel();

  return (
    <>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Previous collections"
        className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border-border/80 bg-background/90 text-foreground shadow-2xs backdrop-blur-md transition-colors duration-300 hover:bg-foreground hover:text-background disabled:opacity-30 md:inline-flex"
        disabled={!canScrollPrev}
        onClick={scrollPrev}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Next collections"
        className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border-border/80 bg-background/90 text-foreground shadow-2xs backdrop-blur-md transition-colors duration-300 hover:bg-foreground hover:text-background disabled:opacity-30 md:inline-flex"
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
