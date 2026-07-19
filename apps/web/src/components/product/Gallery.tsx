"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { DefaultDocumentIDType } from "payload";

import { AnimatePresence, motion } from "motion/react";

import { Media } from "@/components/Media";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { Product } from "@/payload-types";
import { cn } from "@/utilities/cn";

type Props = {
  gallery: NonNullable<Product["gallery"]>;
  isBestseller?: boolean | null;
};

export const Gallery: React.FC<Props> = ({ gallery, isBestseller }) => {
  const searchParams = useSearchParams();
  const [current, setCurrent] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [showZoomLabel, setShowZoomLabel] = useState(false);
  const zoomLabelTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    if (!api) return;
  }, [api]);

  useEffect(() => {
    const values = Array.from(searchParams.values());

    if (values && api) {
      const index = gallery.findIndex((item) => {
        if (!item.variantOption) return false;

        let variantID: DefaultDocumentIDType;
        if (typeof item.variantOption === "object") {
          variantID = item.variantOption.id;
        } else {
          variantID = item.variantOption;
        }

        return Boolean(values.find((value) => value === String(variantID)));
      });
      if (index !== -1) {
        setCurrent(index);
        api.scrollTo(index, true);
      }
    }
  }, [searchParams, api, gallery]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomPos({ x, y });
  };

  useEffect(() => {
    if (isZooming) setShowZoomLabel(false);
  }, [isZooming]);

  const currentImageResource = gallery[current]?.image;
  const currentImageUrl =
    typeof currentImageResource === "object" && currentImageResource !== null
      ? currentImageResource.url
      : undefined;

  return (
    <div className="w-full">
      <div
        className="relative aspect-9/16 max-h-[650px] w-full bg-muted border border-border rounded-lg overflow-hidden cursor-zoom-in group mb-4"
        onMouseEnter={() => {
          setIsZooming(true);
          setShowZoomLabel(true);
          zoomLabelTimeoutRef.current = setTimeout(() => setShowZoomLabel(false), 2000);
        }}
        onMouseLeave={() => {
          clearTimeout(zoomLabelTimeoutRef.current);
          setIsZooming(false);
          setShowZoomLabel(false);
        }}
        onMouseMove={handleMouseMove}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <Media
              resource={currentImageResource}
              className="w-full h-full"
              imgClassName="w-full h-full object-contain"
            />
          </motion.div>
        </AnimatePresence>

        {isBestseller && (
          <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-2.5 py-1.5 text-[9px] font-mono uppercase tracking-widest z-10">
            BESTSELLER
          </div>
        )}

        {showZoomLabel && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-md border border-border px-3 py-1 text-[9px] font-mono text-muted-foreground rounded-full pointer-events-none z-10"
          >
            Hover to zoom
          </motion.div>
        )}

        {isZooming && currentImageUrl && (
          <div
            className="absolute top-0 left-full ml-4 w-full h-full z-20 border border-border bg-background hidden lg:block pointer-events-none rounded-lg"
            style={{
              backgroundImage: `url(${currentImageUrl})`,
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              backgroundSize: "200%",
              backgroundRepeat: "no-repeat",
            }}
          />
        )}
      </div>

      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{ align: "start", loop: false }}
      >
        <CarouselContent className="-ml-2">
          {gallery.map((item, i) => {
            if (typeof item.image !== "object") return null;

            return (
              <CarouselItem
                className="basis-1/4 sm:basis-1/5 pl-2"
                key={`${item.image.id}-${i}`}
                onClick={() => setCurrent(i)}
              >
                <div
                  className={cn(
                    "relative cursor-pointer overflow-hidden rounded-md transition-all duration-200 w-full aspect-square bg-muted",
                    current === i
                      ? "ring-2 ring-primary ring-offset-2 opacity-100"
                      : "opacity-70 hover:opacity-100 border border-border",
                  )}
                >
                  <Media
                    resource={item.image}
                    className="w-full h-full"
                    imgClassName="w-full h-full object-contain"
                  />
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      <div className="flex items-center justify-between mt-4 text-[10px] font-mono text-muted-foreground">
        <span>{gallery.length} photos</span>
      </div>
    </div>
  );
};
