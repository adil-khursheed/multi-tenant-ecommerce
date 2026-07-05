"use client";

import React from "react";
import Link from "next/link";

import { ArrowUpRight } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";

import { CMSLink } from "@/components/Link";
import { Media } from "@/components/Media";
import { Price } from "@/components/Price";
import { RichText } from "@/components/RichText";
import { buttonVariants } from "@/components/ui/button";
import type { Page } from "@/payload-types";
import { cn } from "@/utilities/cn";

export const HighImpactHero: React.FC<Page["hero"]> = ({
  links,
  media,
  richText,
  featuredProduct,
}) => {
  const product =
    typeof featuredProduct === "object" && featuredProduct !== null
      ? featuredProduct
      : null;

  const productMedia = product?.gallery?.[0]?.image;
  const displayMedia = productMedia || media;

  return (
    <section className="relative min-h-dvh flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Left Content */}
      <div className="w-full md:w-[55%] px-6 md:px-16 lg:px-24 flex flex-col justify-center pb-20 md:pb-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Lexical RichText Content */}
          <div className="[&_h1]:font-serif [&_h1]:font-light [&_h1]:text-[clamp(48px,7vw,96px)] [&_h1]:leading-[0.92] [&_h1]:tracking-[-0.03em] [&_h1]:text-foreground [&_h1]:mb-8 [&_h1]:max-w-[600px] [&_h1_em]:italic [&_h2]:font-serif [&_h2]:font-light [&_h2]:text-[clamp(48px,7vw,96px)] [&_h2]:leading-[0.92] [&_h2]:tracking-[-0.03em] [&_h2]:text-foreground [&_h2]:mb-8 [&_h2]:max-w-[600px] [&_h2_em]:italic [&_p]:font-sans [&_p]:font-light [&_p]:text-lg [&_p]:text-muted-foreground [&_p]:mb-10 [&_p]:max-w-[480px] [&_p]:leading-relaxed">
            {richText && <RichText data={richText} enableGutter={false} />}
          </div>

          {/* Buttons */}
          {Array.isArray(links) && links.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-16">
              {links.map(({ link }, i) => (
                <CMSLink
                  key={i}
                  {...link}
                  appearance={i === 0 ? "default" : "outline"}
                  className={`relative overflow-hidden group px-8 py-4 text-[13px] uppercase tracking-[0.08em] font-medium rounded-[2px] transition-all h-auto ${
                    i === 0
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary"
                      : "bg-transparent border-[1.5px] border-foreground text-foreground hover:bg-foreground hover:text-background"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Hardcoded Stats */}
          {/* <div className="flex items-center gap-12">
            {[
              { val: "2,400+", label: "Happy Buyers" },
              { val: "120+", label: "Brands" },
              { val: "48hr", label: "Avg. Delivery" },
            ].map((stat, idx) => (
              <React.Fragment key={idx}>
                {idx !== 0 && <div className="h-10 w-px bg-border" />}
                <div>
                  <div className="font-serif text-[28px] text-foreground">
                    {stat.val}
                  </div>
                  <div className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div> */}
        </motion.div>
      </div>

      {/* Right Image */}
      <div className="w-full md:w-[45%] h-[60dvh] md:h-auto relative overflow-hidden">
        <motion.div
          className="w-full h-full"
          animate={{ scale: [1, 1.04] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }}
        >
          {/* Editorial Style Image with Media */}
          <div className="w-full h-full bg-muted flex items-center justify-center overflow-hidden">
            {displayMedia && typeof displayMedia === "object" && (
              <Media
                fill
                imgClassName="object-cover object-center mix-blend-multiply opacity-90 w-full h-full"
                className="w-full h-full"
                priority
                resource={displayMedia}
                size="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
              />
            )}
          </div>
        </motion.div>

        {/* Floating Product Tag */}
        {product && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-12 left-0 md:left-12 p-5 bg-background/85 backdrop-blur-md border border-border/40 flex items-center justify-between gap-12 min-w-[240px]"
          >
            <div>
              <h4 className="font-serif text-lg text-foreground">
                {product.title}
              </h4>
              <Price
                amount={product.effectivePrice ?? product.priceInINR ?? 0}
                originalAmount={product.priceInINR ?? undefined}
                discountPercent={product.discountPercent ?? undefined}
                className="font-mono text-sm text-primary"
              />
            </div>

            <Link
              className={cn(
                buttonVariants({ variant: "secondary", size: "icon-lg" }),
                "size-8 flex items-center justify-center rounded-full bg-foreground text-background hover:text-foreground",
              )}
              href={`/products/${product.slug}`}
            >
              <HugeiconsIcon icon={ArrowUpRight} size={16} />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};
