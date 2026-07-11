'use client'

import React, { useState } from 'react'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { Drawer } from 'vaul'
import { ChevronUp } from 'lucide-react'

import { Media } from '@/components/Media'
import { Price } from '@/components/Price'

export const MobileSummary: React.FC = () => {
  const [open, setOpen] = useState(false)
  const { cart } = useCart()

  if (!cart || !cart.items || !cart.items.length) return null

  const itemCount = cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-foreground text-background border-t border-foreground/10 px-5 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-sans font-medium">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
          <ChevronUp className="w-4 h-4" />
        </div>
        <Price amount={cart.subtotal || 0} className="text-base font-sans font-medium" />
      </button>

      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border rounded-t-sm max-h-[80vh] overflow-auto">
            <div className="p-5">
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />

              <h3 className="font-serif text-lg text-foreground mb-4">Order Summary</h3>

              <div className="space-y-3">
                {cart.items.map((item, index) => {
                  if (typeof item.product !== 'object' || !item.product) return null
                  const { product, quantity } = item
                  let price = product.priceInINR
                  let image = product.gallery?.[0]?.image || product.meta?.image

                  const isVariant = Boolean(item.variant) && typeof item.variant === 'object'
                  if (isVariant) {
                    price = item.variant?.priceInINR
                    const imageVariant = product.gallery?.find((g: any) => {
                      if (!g.variantOption) return false
                      const variantOptionID =
                        typeof g.variantOption === 'object' ? g.variantOption.id : g.variantOption
                      return item.variant?.options?.some((o: any) =>
                        typeof o === 'object' ? o.id === variantOptionID : o === variantOptionID,
                      )
                    })
                    if (imageVariant && typeof imageVariant.image !== 'string') {
                      image = imageVariant.image
                    }
                  }

                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className="relative w-12 h-12 rounded-sm border border-border overflow-hidden shrink-0 bg-secondary">
                        {image && typeof image !== 'string' && (
                          <Media fill imgClassName="object-cover" resource={image} size="100px" />
                        )}
                        <span className="absolute -top-1 -right-1 bg-foreground text-background text-[9px] font-mono w-4 h-4 flex items-center justify-center rounded-full">
                          {quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-sans font-medium text-foreground truncate">{product.title}</p>
                        {isVariant && (
                          <p className="text-[10px] font-mono text-muted-foreground tracking-wider">
                            {item.variant?.options
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

              <div className="border-t border-border mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-sans font-medium uppercase tracking-wider text-muted-foreground">Total</span>
                  <Price className="text-lg font-sans font-medium text-foreground" amount={cart.subtotal || 0} />
                </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}
