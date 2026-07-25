"use client";

import React, { useCallback, useEffect, useState } from "react";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "motion/react";

import { CMSLink } from "@/components/Link";
import { Media } from "@/components/Media";
import type { Page } from "@/payload-types";
import { cn } from "@/utilities/cn";

export const HeroSlider: React.FC<Page["hero"]> = ({ slides }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
    },
    [
      Autoplay({
        delay: 4000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!Array.isArray(slides) || slides.length === 0) return null;

  return (
    <section className="relative w-full h-125 md:h-175 overflow-hidden">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => {
            const media =
              typeof slide.media === "object" && slide.media !== null
                ? slide.media
                : null;

            const link = slide.links?.[0]?.link;

            return (
              <div
                key={slide.id ?? index}
                className="flex-[0_0_100%] md:flex-[0_0_40%] min-w-0 relative h-full md:mr-2"
              >
                <motion.div
                  className="relative w-full h-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {/* Full-bleed background image */}
                  {media && (
                    <Media
                      fill
                      imgClassName="object-cover object-center"
                      className="absolute inset-0"
                      priority={index === 0}
                      resource={media}
                      size="(max-width: 768px) 100vw, 40vw"
                    />
                  )}

                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Text overlay — bottom-left */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
                    {slide.heading && (
                      <h2 className="font-serif text-2xl md:text-4xl font-light text-white tracking-tight leading-tight mb-2">
                        {slide.heading}
                      </h2>
                    )}
                    {slide.subheading && (
                      <p className="font-sans text-sm md:text-base text-white/80 mb-4 max-w-75">
                        {slide.subheading}
                      </p>
                    )}
                    {link && (
                      <CMSLink
                        {...link}
                        appearance="default"
                        className="inline-block px-6 py-2.5 text-xs uppercase tracking-[0.1em] font-medium bg-white text-black hover:bg-white/90 transition-colors rounded-[2px]"
                      />
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination dots */}
      {scrollSnaps.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollTo(index)}
              className={cn(
                "rounded-full transition-all duration-300",
                index === selectedIndex
                  ? "w-6 h-1.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/50 hover:bg-white/75",
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
