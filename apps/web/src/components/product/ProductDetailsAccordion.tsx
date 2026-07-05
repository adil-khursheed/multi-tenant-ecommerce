'use client'

import React from 'react'
import type { Product } from '@/payload-types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  AlignLeftIcon,
  Shirt01Icon,
  RulerIcon,
  DeliveryTruck01Icon
} from '@hugeicons/core-free-icons'

import { RichText } from '@/components/RichText'

export const ProductDetailsAccordion: React.FC<{ product: Product }> = ({ product }) => {
  const tenant = typeof product.tenant === 'object' ? product.tenant : null

  // For materials, use a simple text representation if available.
  const materialsContent = product.materials && product.materials.length > 0 ? (
    <ul className="list-disc pl-5 mt-2 space-y-1">
      {product.materials.map((m, i) => (
        <li key={i}>{typeof m === 'object' ? m.name : 'Material'}</li>
      ))}
    </ul>
  ) : (
    <div className="mt-4 p-4 border border-border rounded-lg bg-muted/30">
       <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Cotton Blend</h4>
            <p className="text-xs text-muted-foreground">Primary Material</p>
          </div>
          <div className="text-xl font-medium">85%</div>
       </div>
       <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary w-[85%]" />
       </div>
    </div>
  )

  return (
    <Accordion className="w-full mt-12" defaultValue={["description"]}>
      <AccordionItem value="description">
        <AccordionTrigger className="text-base font-medium">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={AlignLeftIcon} size={20} className="text-muted-foreground" />
            Product Details
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {product.description ? (
              <RichText data={product.description as any} enableGutter={false} />
            ) : (
              <p>No description available.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
             <div className="bg-muted/50 p-4 rounded-lg">
                <span className="text-[10px] uppercase font-medium text-muted-foreground block mb-1">Country of Origin</span>
                <span className="text-sm font-medium">{product.countryOfOrigin || 'Imported'}</span>
             </div>
             <div className="bg-muted/50 p-4 rounded-lg">
                <span className="text-[10px] uppercase font-medium text-muted-foreground block mb-1">Care</span>
                <span className="text-sm font-medium">{product.careInstructions || 'Machine Wash'}</span>
             </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="fabric">
        <AccordionTrigger className="text-base font-medium">
           <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Shirt01Icon} size={20} className="text-muted-foreground" />
            Fabric & Care
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {materialsContent}
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">Care Instructions</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.careInstructions || 'Machine wash cold with like colors. Do not bleach. Tumble dry low. Iron on low heat if needed. Do not dry clean.'}
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="size">
        <AccordionTrigger className="text-base font-medium">
           <div className="flex items-center gap-2">
            <HugeiconsIcon icon={RulerIcon} size={20} className="text-muted-foreground" />
            Size Guide
          </div>
        </AccordionTrigger>
        <AccordionContent>
           <p className="text-sm text-muted-foreground mb-4">Measurements are in centimeters.</p>
           <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Size</TableHead>
                  <TableHead>Chest</TableHead>
                  <TableHead>Waist</TableHead>
                  <TableHead>Hip</TableHead>
                  <TableHead>Length</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { size: 'XS', chest: 78, waist: 62, hip: 86, length: 136 },
                  { size: 'S', chest: 82, waist: 66, hip: 90, length: 138 },
                  { size: 'M', chest: 86, waist: 70, hip: 94, length: 140 },
                  { size: 'L', chest: 90, waist: 74, hip: 98, length: 142 },
                  { size: 'XL', chest: 96, waist: 80, hip: 104, length: 144 },
                  { size: 'XXL', chest: 102, waist: 86, hip: 110, length: 146 },
                ].map((row) => (
                  <TableRow key={row.size}>
                    <TableCell className="font-medium">{row.size}</TableCell>
                    <TableCell>{row.chest}</TableCell>
                    <TableCell>{row.waist}</TableCell>
                    <TableCell>{row.hip}</TableCell>
                    <TableCell>{row.length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="delivery">
        <AccordionTrigger className="text-base font-medium">
           <div className="flex items-center gap-2">
            <HugeiconsIcon icon={DeliveryTruck01Icon} size={20} className="text-muted-foreground" />
            Delivery & Returns
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Shipping Policy</h4>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                {tenant?.shippingPolicy ? (
                   <RichText data={tenant.shippingPolicy as any} enableGutter={false} />
                ) : (
                  <p>
                    We offer free standard shipping on all orders over $100. Standard shipping typically
                    takes 3-5 business days. Expedited shipping is available at checkout for an additional fee.
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Return & Exchange Policy</h4>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                 {tenant?.returnAndExchangePolicy ? (
                   <RichText data={tenant.returnAndExchangePolicy as any} enableGutter={false} />
                 ) : (
                   <p>
                     Returns are accepted within 30 days of purchase. Items must be in their original condition
                     with tags attached. Final sale items cannot be returned. Please visit our Returns Center
                     to initiate a return or exchange.
                   </p>
                 )}
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
