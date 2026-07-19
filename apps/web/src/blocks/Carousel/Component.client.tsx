"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import AutoScroll from "embla-carousel-auto-scroll";

import { GridTileImage } from "@/components/Grid/tile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { Media } from "@/payload-types";

// ─── Discriminated union for carousel items ──────────────────────────────────

export type CarouselItemData =
  | {
      type: "product";
      slug: string;
      title: string | null | undefined;
      price: number;
      image: Media | null;
    }
  | { type: "category"; slug: string; name: string; image: Media | null }
  | {
      type: "collection";
      slug: string;
      name: string;
      coverImage: Media | null;
    };

// Re-export as CarouselItem for the server component
export type { CarouselItemData as CarouselItem };

// ─── Tile sub-components ─────────────────────────────────────────────────────

const OverlayTile: React.FC<{ name: string; media: Media | null }> = ({
  name,
  media,
}) => (
  <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black">
    {media?.url && (
      <Image
        fill
        src={media.url}
        alt={media.alt ?? name}
        className="object-cover transition duration-300 ease-in-out group-hover:scale-105"
        sizes="(max-width: 640px) 66vw, 33vw"
      />
    )}
    <div className="absolute inset-0 flex items-end bg-linear-to-b from-transparent via-transparent to-black/50 p-4">
      <span className="text-lg font-semibold capitalize text-white drop-shadow-sm">
        {name}
      </span>
    </div>
  </div>
);

// ─── Main carousel client ────────────────────────────────────────────────────

export const CarouselClient: React.FC<{ items: CarouselItemData[] }> = ({
  items,
}) => {
  if (!items?.length) return null;

  // Duplicate items for seamless infinite loop
  const loopedItems = [...items, ...items, ...items];

  return (
    <Carousel
      className="w-full"
      opts={{ align: "start", loop: true }}
      plugins={[
        AutoScroll({
          playOnInit: true,
          speed: 1,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
        }),
      ]}
    >
      <CarouselContent>
        {loopedItems.map((item, i) => (
          <CarouselItem
            className="relative aspect-square h-[30vh] max-h-[275px] w-2/3 max-w-[475px] flex-none md:w-1/3"
            key={`${item.slug}${i}`}
          >
            {item.type === "product" && (
              <Link
                className="group relative h-full w-full"
                href={`/products/${item.slug}`}
              >
                <GridTileImage
                  label={{
                    amount: item.price,
                    title: item.title ? item.title : "",
                  }}
                  media={item.image as Media}
                />
              </Link>
            )}

            {item.type === "category" && (
              <Link
                className="group relative block h-full w-full"
                href={`/shop?category=${item.slug}`}
              >
                <OverlayTile name={item.name} media={item.image} />
              </Link>
            )}

            {item.type === "collection" && (
              <Link
                className="group relative block h-full w-full"
                href={`/collections/${item.slug}`}
              >
                <OverlayTile name={item.name} media={item.coverImage} />
              </Link>
            )}
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};
