"use client";

import React from "react";

import {
  AlignLeftIcon,
  DeliveryTruck01Icon,
  RulerIcon,
  Shirt01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { RichText } from "@/components/RichText";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Product, SizeGuide } from "@/payload-types";
import { SizeGuideTable } from "./SizeGuideTable";

export const ProductDetailsAccordion: React.FC<{
  product: Product;
  sizeGuide?: SizeGuide | null;
}> = ({ product, sizeGuide }) => {
  const tenant = typeof product.tenant === "object" ? product.tenant : null;

  // For materials, use a simple text representation if available.
  const materialsContent =
    product.materials && product.materials.length > 0 ? (
      <ul className="list-disc pl-5 mt-2 space-y-1">
        {product.materials.map((m, i) => (
          <li key={i}>{typeof m === "object" ? m.name : "Material"}</li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-muted-foreground">
        No material information available.
      </p>
    );

  return (
    <Accordion className="w-full mt-12" defaultValue={["description"]}>
      <AccordionItem value="description">
        <AccordionTrigger className="text-base font-medium">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={AlignLeftIcon}
              size={20}
              className="text-muted-foreground"
            />
            Product Details
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {product.description ? (
              <RichText
                data={product.description as any}
                enableGutter={false}
              />
            ) : (
              <p>No description available.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <span className="text-[10px] uppercase font-medium text-muted-foreground block mb-1">
                Country of Origin
              </span>
              <span className="text-sm font-medium">
                {product.countryOfOrigin || "Not specified"}
              </span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="fabric">
        <AccordionTrigger className="text-base font-medium">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Shirt01Icon}
              size={20}
              className="text-muted-foreground"
            />
            Fabric & Care
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {materialsContent}
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">Care Instructions</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.careInstructions || "Not specified"}
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>

      {sizeGuide && (
        <AccordionItem value="size">
          <AccordionTrigger className="text-base font-medium">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={RulerIcon}
                size={20}
                className="text-muted-foreground"
              />
              Size Guide
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <SizeGuideTable sizeGuide={sizeGuide} />
          </AccordionContent>
        </AccordionItem>
      )}

      <AccordionItem value="delivery">
        <AccordionTrigger className="text-base font-medium">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={DeliveryTruck01Icon}
              size={20}
              className="text-muted-foreground"
            />
            Delivery & Returns
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Shipping Policy</h4>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                {tenant?.shippingPolicy ? (
                  <RichText
                    data={tenant.shippingPolicy as any}
                    enableGutter={false}
                  />
                ) : (
                  <p>
                    Shipping and delivery information will be provided by the
                    seller. Please check the product page or contact the seller
                    for specific shipping timelines and costs.
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">
                Return & Exchange Policy
              </h4>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                {tenant?.returnAndExchangePolicy ? (
                  <RichText
                    data={tenant.returnAndExchangePolicy as any}
                    enableGutter={false}
                  />
                ) : (
                  <p>
                    Returns are accepted within 30 days of purchase. Items must
                    be in their original condition with tags attached. Final
                    sale items cannot be returned. Please visit our Returns
                    Center to initiate a return or exchange.
                  </p>
                )}
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
