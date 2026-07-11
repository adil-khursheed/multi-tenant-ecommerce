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

      <div className="space-y-6 mt-4">
        {/* Address Summary */}
        <div className="bg-card border border-border rounded-[4px] p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-secondary group-hover:bg-primary transition-colors" />
          <div className="flex items-center justify-between mb-4 pl-3">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <p className="text-[11px] font-sans uppercase tracking-[0.1em] font-medium text-foreground">
                Delivery Address
              </p>
            </div>
            <button
              onClick={() => onEdit?.('address')}
              className="text-[11px] font-sans font-medium uppercase tracking-[0.08em] text-primary hover:underline transition-colors"
            >
              Change
            </button>
          </div>
          {billingAddress && (
            <div className="text-[13px] font-sans text-muted-foreground pl-7 space-y-1">
              <p className="text-foreground font-medium mb-2">{billingAddress.firstName} {billingAddress.lastName}</p>
              <p>{billingAddress.addressLine1}</p>
              {billingAddress.addressLine2 && (
                <p>{billingAddress.addressLine2}</p>
              )}
              <p>
                {billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}
              </p>
              <p>{billingAddress.country}</p>
              {billingAddress.phone && (
                <p className="mt-2 text-foreground">{billingAddress.phone}</p>
              )}
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="bg-card border border-border rounded-[4px] p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-secondary group-hover:bg-primary transition-colors" />
          <div className="flex items-center justify-between mb-4 pl-3">
            <div className="flex items-center gap-3">
              {paymentMethod === 'cod' ? (
                <Banknote className="w-4 h-4 text-muted-foreground" />
              ) : (
                <CreditCard className="w-4 h-4 text-muted-foreground" />
              )}
              <p className="text-[11px] font-sans uppercase tracking-[0.1em] font-medium text-foreground">
                Payment Method
              </p>
            </div>
            <button
              onClick={() => onEdit?.('payment')}
              className="text-[11px] font-sans font-medium uppercase tracking-[0.08em] text-primary hover:underline transition-colors"
            >
              Change
            </button>
          </div>
          <p className="text-[13px] font-sans font-medium text-foreground pl-7">
            {paymentMethod === 'cod'
              ? 'Cash on Delivery'
              : paymentSubMethod === 'upi'
                ? 'UPI'
                : 'Credit / Debit Card'}
          </p>
        </div>

        {/* Items */}
        <div className="bg-card border border-border rounded-[4px] p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
          <p className="text-[11px] font-sans uppercase tracking-[0.1em] font-medium text-foreground mb-6 pl-3">
            Items ({cart.items.reduce((s, i) => s + (i.quantity || 0), 0)})
          </p>
          <div className="space-y-4 pl-3">
            {cart.items.map((item, index) => {
              if (typeof item.product !== 'object' || !item.product) return null
              const { product, quantity } = item
              let price = product.priceInINR
              let image = product.gallery?.[0]?.image || product.meta?.image

              return (
                <div key={index} className="flex items-start gap-4">
                  <div className="relative w-16 h-20 rounded-[2px] border border-border overflow-hidden shrink-0 bg-secondary">
                    {image && typeof image !== 'string' && (
                      <Media fill imgClassName="object-cover" resource={image} size="100px" />
                    )}
                    <div className="absolute top-0 right-0 bg-foreground text-background text-[10px] font-mono px-1.5 py-0.5 m-1 rounded-sm">
                      {quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="font-serif text-[16px] text-foreground truncate mb-1">{product.title}</p>
                    {typeof price === 'number' && (
                      <Price amount={price * (quantity || 1)} className="font-sans text-[13px] text-muted-foreground" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Trust */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground pt-4">
          <ShieldCheck className="w-4 h-4 text-muted-foreground opacity-50" />
          <p className="text-[11px] font-sans tracking-wide">Secure checkout. Your data is protected.</p>
        </div>
      </div>
    </div>
  )
}
