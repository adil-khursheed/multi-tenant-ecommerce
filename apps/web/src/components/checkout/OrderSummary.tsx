'use client'

import React from 'react'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'

import { Media } from '@/components/Media'
import { Price } from '@/components/Price'

export const OrderSummary: React.FC = () => {
  const { cart } = useCart()

  if (!cart || !cart.items || !cart.items.length) return null

  const vendorGroups: Record<string, typeof cart.items> = {}

  cart.items.forEach((item) => {
    if (typeof item.product === 'object' && item.product) {
      const vendor =
        typeof item.product.vendor === 'object' && item.product.vendor
          ? (item.product.vendor as Record<string, unknown>)
          : null
      const vendorName = vendor?.storeName || vendor?.name || 'Store'
      const vendorId = (item.product.vendor as string) || 'unknown'

      if (!vendorGroups[vendorId]) {
        vendorGroups[vendorId] = []
      }
      vendorGroups[vendorId].push(item)
    }
  })

  const vendorCount = Object.keys(vendorGroups).length

  return (
    <div className="bg-primary/5 border border-border rounded-sm p-5">
      <h3 className="font-serif text-lg text-foreground mb-4">
        Order Summary
        {vendorCount > 1 && (
          <span className="font-sans text-xs text-muted-foreground ml-2 font-normal">
            from {vendorCount} sellers
          </span>
        )}
      </h3>

      <div className="space-y-4">
        {Object.entries(vendorGroups).map(([vendorId, items]) => {
          const firstProduct = items[0]?.product
          const vendorName =
            typeof firstProduct === 'object' && firstProduct
              ? typeof firstProduct.vendor === 'object' && firstProduct.vendor
                ? ((firstProduct.vendor as Record<string, unknown>).storeName as string) ||
                  ((firstProduct.vendor as Record<string, unknown>).name as string) ||
                  'Store'
                : 'Store'
              : 'Store'

          return (
            <div key={vendorId}>
              {vendorCount > 1 && (
                <p className="text-[11px] font-sans uppercase tracking-[0.08em] font-medium text-muted-foreground mb-2">
                  {vendorName}
                </p>
              )}

              <div className="space-y-3">
                {items.map((item, index) => {
                  if (typeof item.product !== 'object' || !item.product) return null

                  const { product, quantity, variant } = item
                  let price = product.priceInINR
                  let image = product.gallery?.[0]?.image || product.meta?.image

                  const isVariant = Boolean(variant) && typeof variant === 'object'
                  if (isVariant) {
                    price = variant?.priceInINR
                    const imageVariant = product.gallery?.find((g: any) => {
                      if (!g.variantOption) return false
                      const variantOptionID =
                        typeof g.variantOption === 'object' ? g.variantOption.id : g.variantOption
                      return variant?.options?.some((o: any) =>
                        typeof o === 'object' ? o.id === variantOptionID : o === variantOptionID,
                      )
                    })
                    if (imageVariant && typeof imageVariant.image !== 'string') {
                      image = imageVariant.image
                    }
                  }

                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className="relative w-14 h-14 rounded-sm border border-border overflow-hidden shrink-0 bg-secondary">
                        {image && typeof image !== 'string' && (
                          <Media
                            fill
                            imgClassName="object-cover"
                            resource={image}
                            size="120px"
                          />
                        )}
                        <span className="absolute -top-1 -right-1 bg-foreground text-background text-[9px] font-mono w-4 h-4 flex items-center justify-center rounded-full">
                          {quantity}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-sans font-medium text-foreground truncate">
                          {product.title}
                        </p>
                        {isVariant && (
                          <p className="text-[10px] font-mono text-muted-foreground tracking-wider truncate">
                            {variant?.options
                              ?.map((o: any) => (typeof o === 'object' ? o.label : ''))
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        )}
                      </div>

                      {typeof price === 'number' && (
                        <Price amount={price * (quantity || 1)} className="text-sm font-sans text-foreground shrink-0" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-border mt-4 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-sans font-medium uppercase tracking-wider text-muted-foreground">Total</span>
          <Price className="text-lg font-sans font-medium text-foreground" amount={cart.subtotal || 0} />
        </div>
      </div>
    </div>
  )
}
