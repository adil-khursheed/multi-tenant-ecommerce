"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import { ArrowUpRight } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";

import { RichText } from "@/components/RichText";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Media } from "@/payload-types";
import { cn } from "@/utilities/cn";

export type CategoryTab = {
  parentName: string;
  parentSlug: string;
  children: {
    id: string;
    name: string;
    slug: string;
    image: Media | null;
  }[];
};

export type CustomTab = {
  tab: string;
  content: any;
};

export type TabsClientProps = {
  contentType: "categories" | "custom";
  categoryTabs?: CategoryTab[];
  customTabs?: CustomTab[];
};

const CategoryCard: React.FC<{
  id: string;
  name: string;
  slug: string;
  image: Media | null;
}> = ({ name, id, image }) => {
  const hasImage = Boolean(image?.url);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Link
        href={`/shop?category=${id}`}
        className="group relative flex aspect-[4/5] w-full flex-col justify-end overflow-hidden border border-border/70 bg-secondary outline-offset-4 transition-colors duration-300 hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-ring sm:aspect-[3/4]"
      >
        {hasImage ? (
          <Image
            fill
            src={image!.url!}
            alt={image?.alt ?? name}
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <span
            aria-hidden
            className="pointer-events-none absolute -top-6 right-1 select-none font-serif text-[9rem] leading-none text-primary/10 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-hover:text-primary/20 sm:text-[11rem]"
          >
            {name.charAt(0)}
          </span>
        )}

        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            hasImage
              ? "bg-linear-to-t from-black/80 via-black/10 to-transparent"
              : "bg-linear-to-t from-secondary via-secondary/40 to-transparent",
          )}
        />

        <div className="relative z-10 flex items-end justify-between gap-4 p-4 sm:p-5">
          <span
            className={cn(
              "max-w-[12ch] font-serif text-[26px] leading-[0.95] tracking-[-0.01em] sm:text-[30px]",
              hasImage ? "text-white" : "text-foreground",
            )}
          >
            {name}
          </span>
          <span
            className={cn(
              "mb-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
              hasImage
                ? "border-white/40 text-white/90 group-hover:border-white group-hover:bg-white group-hover:text-black"
                : "border-border text-primary group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground",
            )}
          >
            <HugeiconsIcon
              icon={ArrowUpRight}
              size={14}
              strokeWidth={2}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

export const TabsClient: React.FC<TabsClientProps> = ({
  contentType,
  categoryTabs,
  customTabs,
}) => {
  const isCategories = contentType === "categories";

  const defaultTab = isCategories
    ? categoryTabs?.[0]?.parentSlug
    : customTabs?.[0]?.tab;

  if (!defaultTab) return null;

  return (
    <div className="w-full">
      <Tabs defaultValue={defaultTab} className="w-full">
        <div className="mb-6 w-full overflow-x-auto pb-2 scrollbar-none">
          <TabsList
            variant={isCategories ? "default" : "line"}
            className={
              isCategories
                ? "inline-flex w-max justify-start gap-2 rounded-none bg-transparent p-0"
                : "inline-flex w-max min-w-full justify-start border-b border-border"
            }
          >
            {isCategories
              ? categoryTabs?.map((parent) => (
                  <TabsTrigger
                    key={parent.parentSlug}
                    value={parent.parentSlug}
                    className="flex-none rounded-none border border-border bg-transparent px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:text-foreground data-active:border-primary data-active:bg-primary data-active:text-primary-foreground"
                  >
                    {parent.parentName}
                  </TabsTrigger>
                ))
              : customTabs?.map((tab, i) => (
                  <TabsTrigger
                    key={tab.tab || i}
                    value={tab.tab || String(i)}
                    className="px-4 pb-3 text-sm font-medium uppercase tracking-wider sm:text-base"
                  >
                    {tab.tab}
                  </TabsTrigger>
                ))}
          </TabsList>
        </div>

        <div className="relative w-full">
          {isCategories
            ? categoryTabs?.map((parent) => (
                <TabsContent key={parent.parentSlug} value={parent.parentSlug}>
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.05 },
                      },
                    }}
                    className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4"
                  >
                    {parent.children.map((child) => (
                      <CategoryCard key={child.slug} {...child} />
                    ))}
                  </motion.div>
                </TabsContent>
              ))
            : customTabs?.map((tab, i) => (
                <TabsContent key={tab.tab || i} value={tab.tab || String(i)}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="prose dark:prose-invert max-w-none"
                  >
                    {tab.content && (
                      <RichText data={tab.content} enableGutter={false} />
                    )}
                  </motion.div>
                </TabsContent>
              ))}
        </div>
      </Tabs>
    </div>
  );
};
