'use client'

import React from 'react'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { MapPin, CreditCard, Banknote, ShieldCheck } from 'lucide-react'

import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { Address } from '@/payload-types'
import { StepHeader } from '@/components/checkout/ui/StepHeader'

type Props = {
  billingAddress?: Partial<Address>
  shippingAddress?: Partial<Address>
  paymentMethod: 'razorpay' | 'cod'
  paymentSubMethod?: string
  isCompleted?: boolean
  onEdit?: (step: 'address' | 'payment') => void
}

export const ReviewStep: React.FC<Props> = ({
  billingAddress,
  shippingAddress,
  paymentMethod,
  paymentSubMethod,
  isCompleted,
  onEdit,
}) => {
  const { cart } = useCart()

  if (!cart || !cart.items || !cart.items.length) return null

  return (
    <div>
      <StepHeader number="04" title="Review Order" isCompleted={isCompleted} onEdit={() => onEdit?.('address')} />

      <div className="space-y-4">
        {/* Address Summary */}
        <div className="bg-card border border-border rounded-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-sans uppercase tracking-[0.08em] font-medium text-foreground">
                Delivery address
              </p>
            </div>
            <button
              onClick={() => onEdit?.('address')}
              className="text-xs font-sans text-primary hover:underline"
            >
              Edit
            </button>
          </div>
          {billingAddress && (
            <div className="text-sm font-sans text-foreground">
              <p>{billingAddress.firstName} {billingAddress.lastName}</p>
              <p className="text-muted-foreground">{billingAddress.addressLine1}</p>
              {billingAddress.addressLine2 && (
                <p className="text-muted-foreground">{billingAddress.addressLine2}</p>
              )}
              <p className="text-muted-foreground">
                {billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}
              </p>
              <p className="text-muted-foreground">{billingAddress.country}</p>
              {billingAddress.phone && (
                <p className="text-muted-foreground mt-1">{billingAddress.phone}</p>
              )}
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="bg-card border border-border rounded-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {paymentMethod === 'cod' ? (
                <Banknote className="w-4 h-4 text-muted-foreground" />
              ) : (
                <CreditCard className="w-4 h-4 text-muted-foreground" />
              )}
              <p className="text-xs font-sans uppercase tracking-[0.08em] font-medium text-foreground">
                Payment method
              </p>
            </div>
            <button
              onClick={() => onEdit?.('payment')}
              className="text-xs font-sans text-primary hover:underline"
            >
              Edit
            </button>
          </div>
          <p className="text-sm font-sans text-foreground">
            {paymentMethod === 'cod'
              ? 'Cash on Delivery'
              : paymentSubMethod === 'upi'
                ? 'UPI'
                : 'Credit / Debit Card'}
          </p>
        </div>

        {/* Items */}
        <div className="bg-card border border-border rounded-sm p-4">
          <p className="text-xs font-sans uppercase tracking-[0.08em] font-medium text-foreground mb-3">
            Items ({cart.items.reduce((s, i) => s + (i.quantity || 0), 0)})
          </p>
          <div className="space-y-3">
            {cart.items.map((item, index) => {
              if (typeof item.product !== 'object' || !item.product) return null
              const { product, quantity } = item
              let price = product.priceInINR
              let image = product.gallery?.[0]?.image || product.meta?.image

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
                  </div>
                  {typeof price === 'number' && (
                    <Price amount={price * (quantity || 1)} className="text-sm font-sans text-foreground shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Trust */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="w-4 h-4" />
          <p className="text-xs font-sans">Secure checkout. Your data is protected.</p>
        </div>
      </div>
    </div>
  )
}
