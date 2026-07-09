"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import { motion } from "motion/react";

import { RichText } from "@/components/RichText";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Media } from "@/payload-types";

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
}> = ({ name, id, image }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 15 },
      visible: { opacity: 1, y: 0 },
    }}
    whileHover={{ scale: 1.03, y: -4 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  >
    <Link
      href={`/shop?category=${id}`}
      className="group relative flex h-[200px] w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-black sm:h-[250px]"
    >
      {image?.url && (
        <Image
          fill
          src={image.url}
          alt={image.alt ?? name}
          className="object-cover transition duration-500 ease-in-out group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      )}
      <div className="absolute inset-0 flex items-end bg-linear-to-b from-transparent via-black/10 to-black/70 p-4 transition-opacity duration-300 group-hover:to-black/80">
        <span className="text-base font-semibold capitalize text-white drop-shadow-md sm:text-lg">
          {name}
        </span>
      </div>
    </Link>
  </motion.div>
);

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
            variant="line"
            className="inline-flex w-max min-w-full justify-start border-b border-border"
          >
            {isCategories
              ? categoryTabs?.map((parent) => (
                  <TabsTrigger
                    key={parent.parentSlug}
                    value={parent.parentSlug}
                    className="px-4 pb-3 font-serif text-lg capitalize sm:text-xl"
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
