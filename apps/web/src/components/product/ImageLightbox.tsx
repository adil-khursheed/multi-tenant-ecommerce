"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Media } from "@/components/Media";
import type { Product } from "@/payload-types";
import { cn } from "@/utilities/cn";

type GalleryItem = NonNullable<Product["gallery"]>[number];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gallery: { image: NonNullable<GalleryItem["image"]> }[];
  initialIndex: number;
  onIndexChange?: (index: number) => void;
};

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const ZOOM_STEP = 0.3;

export const ImageLightbox: React.FC<Props> = ({
  open,
  onOpenChange,
  gallery,
  initialIndex,
  onIndexChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showUI, setShowUI] = useState(true);
  const [showThumbnailStrip, setShowThumbnailStrip] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const hideUITimerRef = useRef<NodeJS.Timeout>(undefined);
  const lastTouchDistanceRef = useRef<number>(0);
  const lastTouchCenterRef = useRef({ x: 0, y: 0 });

  const resetTransform = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    resetTransform();
  }, [initialIndex, resetTransform]);

  useEffect(() => {
    if (!open) {
      resetTransform();
      setShowUI(true);
      setShowThumbnailStrip(false);
    }
  }, [open, resetTransform]);

  const scheduleHideUI = useCallback(() => {
    clearTimeout(hideUITimerRef.current);
    setShowUI(true);
    hideUITimerRef.current = setTimeout(() => {
      if (scale > 1) setShowUI(false);
    }, 3000);
  }, [scale]);

  useEffect(() => {
    return () => clearTimeout(hideUITimerRef.current);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigatePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigateNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, currentIndex, gallery.length]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const navigatePrev = useCallback(() => {
    if (currentIndex > 0) {
      resetTransform();
      setCurrentIndex((prev) => prev - 1);
      onIndexChange?.(currentIndex - 1);
    }
  }, [currentIndex, onIndexChange, resetTransform]);

  const navigateNext = useCallback(() => {
    if (currentIndex < gallery.length - 1) {
      resetTransform();
      setCurrentIndex((prev) => prev + 1);
      onIndexChange?.(currentIndex + 1);
    }
  }, [currentIndex, gallery.length, onIndexChange, resetTransform]);

  const goToIndex = useCallback(
    (index: number) => {
      resetTransform();
      setCurrentIndex(index);
      onIndexChange?.(index);
    },
    [onIndexChange, resetTransform],
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setScale((prev) => {
        const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta));
        if (next === 1) setPosition({ x: 0, y: 0 });
        return next;
      });
      scheduleHideUI();
    },
    [scheduleHideUI],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (scale > 1) {
        resetTransform();
      } else {
        const rect = imageContainerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setScale(2.5);
        setPosition({
          x: (50 - x) * 1.5,
          y: (50 - y) * 1.5,
        });
      }
      scheduleHideUI();
    },
    [scale, resetTransform, scheduleHideUI],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (scale <= 1) return;
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    },
    [scale, position],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch0 = e.touches[0];
      const touch1 = e.touches[1];
      if (e.touches.length === 2 && touch0 && touch1) {
        const dx = touch0.clientX - touch1.clientX;
        const dy = touch0.clientY - touch1.clientY;
        lastTouchDistanceRef.current = Math.hypot(dx, dy);
        lastTouchCenterRef.current = {
          x: (touch0.clientX + touch1.clientX) / 2,
          y: (touch0.clientY + touch1.clientY) / 2,
        };
      } else if (e.touches.length === 1 && touch0 && scale > 1) {
        setIsDragging(true);
        setDragStart({
          x: touch0.clientX - position.x,
          y: touch0.clientY - position.y,
        });
      }
    },
    [scale, position],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch0 = e.touches[0];
      const touch1 = e.touches[1];
      if (e.touches.length === 2 && touch0 && touch1) {
        e.preventDefault();
        const dx = touch0.clientX - touch1.clientX;
        const dy = touch0.clientY - touch1.clientY;
        const distance = Math.hypot(dx, dy);

        if (lastTouchDistanceRef.current > 0) {
          const ratio = distance / lastTouchDistanceRef.current;
          setScale((prev) => {
            const next = Math.min(
              MAX_SCALE,
              Math.max(MIN_SCALE, prev * ratio),
            );
            if (next === 1) setPosition({ x: 0, y: 0 });
            return next;
          });
        }
        lastTouchDistanceRef.current = distance;
      } else if (e.touches.length === 1 && touch0 && isDragging) {
        setPosition({
          x: touch0.clientX - dragStart.x,
          y: touch0.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length < 2) {
        lastTouchDistanceRef.current = 0;
      }
      if (e.touches.length === 0) {
        setIsDragging(false);
      }
    },
    [],
  );

  const toggleThumbnailStrip = useCallback(() => {
    setShowThumbnailStrip((prev) => !prev);
  }, []);

  const currentImage = gallery[currentIndex]?.image;
  if (!currentImage) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-none w-screen h-screen sm:max-w-none p-0 bg-transparent border-none rounded-none ring-0 gap-0"
        showCloseButton={false}
      >
        <div
          ref={containerRef}
          className="relative w-full h-full bg-black/95 flex items-center justify-center overflow-hidden select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={handleDoubleClick}
        >
          {/* Close button */}
          {showUI && (
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Close lightbox"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          {/* Counter */}
          {showUI && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-mono">
              {currentIndex + 1} / {gallery.length}
            </div>
          )}

          {/* Previous button */}
          {showUI && currentIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigatePrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Previous image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Next button */}
          {showUI && currentIndex < gallery.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Next image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* Image container */}
          <div
            ref={imageContainerRef}
            className={cn(
              "relative w-full h-full flex items-center justify-center p-8 md:p-16",
              scale > 1 ? "cursor-grab" : "cursor-zoom-in",
              isDragging && "cursor-grabbing",
            )}
            style={{ touchAction: scale > 1 ? "none" : "pinch-zoom" }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onClick={(e) => {
              if (scale <= 1) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setScale(2.5);
                setPosition({
                  x: (50 - x) * 1.5,
                  y: (50 - y) * 1.5,
                });
                scheduleHideUI();
              }
            }}
          >
            <div
              className="relative w-full h-full transition-transform duration-200"
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transformOrigin: "center center",
              }}
            >
              <Media
                resource={currentImage}
                className="w-full h-full"
                imgClassName="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Thumbnail toggle */}
          {gallery.length > 1 && showUI && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleThumbnailStrip();
              }}
              className={cn(
                "absolute bottom-20 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full text-xs font-mono transition-colors",
                showThumbnailStrip
                  ? "bg-white text-black"
                  : "bg-white/10 text-white hover:bg-white/20",
              )}
            >
              {showThumbnailStrip ? "Hide" : "Show"} thumbnails
            </button>
          )}

          {/* Thumbnail strip */}
          {showThumbnailStrip && gallery.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 p-2 rounded-lg bg-black/60 backdrop-blur-sm max-w-[90vw] overflow-x-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {gallery.map((item, i) => (
                <button
                  key={`${typeof item.image === "object" ? item.image.id : i}-${i}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToIndex(i);
                  }}
                  className={cn(
                    "relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-md overflow-hidden border-2 transition-all",
                    i === currentIndex
                      ? "border-white opacity-100"
                      : "border-transparent opacity-50 hover:opacity-80",
                  )}
                >
                  <Media
                    resource={item.image}
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
