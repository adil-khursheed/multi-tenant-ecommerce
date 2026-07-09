"use client";

import React from "react";
import { motion } from "motion/react";

import { ProductGridItem } from "@/components/ProductGridItem";
import type { Product } from "@/payload-types";

export const FiveItemGridClient: React.FC<{ products: Product[] }> = ({
  products,
}) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-4 sm:gap-6">
      {products.map((product, index) => {
        const isHero = index === 0;

        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={
              isHero
                ? "col-span-2 row-span-1 lg:row-span-2 [&>div>a]:lg:aspect-auto [&>div>a]:lg:h-full"
                : "col-span-1 row-span-1"
            }
          >
            <ProductGridItem product={product} />
          </motion.div>
        );
      })}
    </div>
  );
};
