"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  PauseIcon,
  PlayIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { useReducedMotion } from "motion/react";

import { CMSLink } from "@/components/Link";
import { Media } from "@/components/Media";
import type { Page } from "@/payload-types";
import { cn } from "@/utilities/cn";

const AUTOPLAY_DELAY = 5000;

export const HeroSlider: React.FC<Page["hero"]> = ({ slides }) => {
  const prefersReducedMotion = useReducedMotion();
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
    },
    [
      Autoplay({
        delay: AUTOPLAY_DELAY,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const toggleAutoplay = useCallback(() => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (!autoplay) return;
    if (autoplay.isPlaying()) {
      autoplay.stop();
      setIsPlaying(false);
    } else {
      autoplay.play();
      setIsPlaying(true);
    }
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || !prefersReducedMotion) return;
    emblaApi.plugins()?.autoplay?.stop();
    setIsPlaying(false);
  }, [emblaApi, prefersReducedMotion]);

  if (!Array.isArray(slides) || slides.length === 0) return null;

  const total = scrollSnaps.length || slides.length;

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="group/hero relative h-[72svh] min-h-[520px] w-full overflow-hidden bg-foreground/90 md:h-[80svh] md:max-h-[820px]"
    >
      <div
        ref={emblaRef}
        className="h-full cursor-grab overflow-hidden active:cursor-grabbing"
      >
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
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${total}`}
                className="relative h-full min-w-0 flex-[0_0_100%] md:mr-2 md:flex-[0_0_40%]"
              >
                <div className="group/slide relative h-full w-full overflow-hidden">
                  {media && (
                    <Media
                      fill
                      imgClassName="object-cover object-center scale-[1.02] transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/slide:scale-[1.06]"
                      className="absolute inset-0"
                      priority={index < 2}
                      resource={media}
                      size="(max-width: 768px) 100vw, 40vw"
                    />
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-black/5" />
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-transparent md:hidden" />

                  <div className="absolute inset-x-0 bottom-0 z-10 p-6 pb-20 md:p-8 md:pb-20 lg:p-10 lg:pb-24">
                    {slide.heading && (
                      <h2 className="mb-3 max-w-[14ch] font-serif text-[clamp(30px,3.4vw,46px)] font-light leading-[0.98] tracking-[-0.02em] text-white">
                        {slide.heading}
                      </h2>
                    )}
                    {slide.subheading && (
                      <p className="mb-6 max-w-[34ch] font-sans text-[13px] leading-relaxed text-white/75 md:text-sm">
                        {slide.subheading}
                      </p>
                    )}
                    {link && (
                      <CMSLink
                        {...link}
                        appearance="default"
                        className="group/cta inline-flex items-center gap-3 rounded-[2px] bg-white px-6 py-3 text-[11px] font-medium uppercase tracking-[0.12em] text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                      >
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          size={14}
                          strokeWidth={2}
                          className="transition-transform duration-300 group-hover/cta:translate-x-1"
                        />
                      </CMSLink>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-6 p-6 md:p-8 lg:p-10">
        <div className="pointer-events-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollTo(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white",
                  index === selectedIndex
                    ? "w-8 bg-white"
                    : "w-1.5 bg-white/45 hover:bg-white/75",
                )}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === selectedIndex}
              />
            ))}
          </div>
          <span className="font-mono text-[10px] tracking-[0.18em] text-white/60">
            {String(selectedIndex + 1).padStart(2, "0")}
            <span className="text-white/30"> / </span>
            {String(total).padStart(2, "0")}
          </span>
          <Link
            href="/shop"
            className="group/shop inline-flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-[0.14em] text-white/75 transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Shop all
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={12}
              strokeWidth={2}
              className="transition-transform duration-300 group-hover/shop:translate-x-0.5"
            />
          </Link>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={toggleAutoplay}
            aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            className="flex size-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <HugeiconsIcon
              icon={isPlaying ? PauseIcon : PlayIcon}
              size={14}
              strokeWidth={2}
            />
          </button>
          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Previous slide"
              className="flex size-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Next slide"
              className="flex size-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={16}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>
      </div>

      {total > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-30 h-px bg-white/15">
          <div
            key={selectedIndex}
            className={cn(
              "h-full origin-left bg-white/80 animate-hero-progress group-hover/hero:[animation-play-state:paused] motion-reduce:animate-none",
              !isPlaying && "[animation-play-state:paused]",
            )}
          />
        </div>
      )}
    </section>
  );
};
