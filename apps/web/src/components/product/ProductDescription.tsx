'use client'
import type { Product, Variant } from '@/payload-types'

import { RichText } from '@/components/RichText'
import { AddToCart } from '@/components/Cart/AddToCart'
import { Price } from '@/components/Price'
import React, { Suspense } from 'react'

import { VariantSelector } from './VariantSelector'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { StockIndicator } from '@/components/product/StockIndicator'
import { useSearchParams } from 'next/navigation'

function ProductPrice({ product, currencyCode }: { product: Product; currencyCode: string }) {
  const searchParams = useSearchParams()
  const variantId = searchParams.get('variant')
  const priceField = `priceIn${currencyCode}` as keyof Product

  const hasVariants = product.enableVariants && Boolean(product.variants?.docs?.length)
  let selectedVariant: Variant | undefined

  if (hasVariants && variantId && product.variants?.docs) {
    selectedVariant = product.variants.docs.find(
      (v) => typeof v === 'object' && String(v.id) === variantId
    ) as Variant | undefined
  }

  if (selectedVariant) {
    const variantPriceField = `priceIn${currencyCode}` as keyof Variant
    const vPrice = selectedVariant[variantPriceField]
    const originalAmount = typeof vPrice === 'number' ? vPrice : (product[priceField] as number | undefined)
    const effectiveAmount = selectedVariant.effectivePrice ?? originalAmount
    return <Price amount={effectiveAmount as number} originalAmount={originalAmount} />
  }

  if (hasVariants) {
    const minPrice = product.minEffectivePrice
    const maxPrice = product.maxEffectivePrice
    if (typeof minPrice === 'number' && typeof maxPrice === 'number') {
      return <Price lowestAmount={minPrice} highestAmount={maxPrice} />
    }
  }

  const basePrice = product[priceField] as number
  const effectivePrice = product.effectivePrice ?? basePrice

  return <Price amount={effectivePrice} originalAmount={basePrice} />
}

export function ProductDescription({ product }: { product: Product }) {
  const { currency } = useCurrency()
  const hasVariants = product.enableVariants && Boolean(product.variants?.docs?.length)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-medium">{product.title}</h1>
        <div className="uppercase font-mono">
          <Suspense fallback={null}>
            <ProductPrice product={product} currencyCode={currency.code} />
          </Suspense>
        </div>
      </div>
      {product.description ? (
        <RichText className="" data={product.description} enableGutter={false} />
      ) : null}
      <hr />
      {hasVariants && (
        <>
          <Suspense fallback={null}>
            <VariantSelector product={product} />
          </Suspense>

          <hr />
        </>
      )}
      <div className="flex items-center justify-between">
        <Suspense fallback={null}>
          <StockIndicator product={product} />
        </Suspense>
      </div>

      <div className="flex items-center justify-between">
        <Suspense fallback={null}>
          <AddToCart product={product} />
        </Suspense>
      </div>
    </div>
  )
}
