'use client'

import React from 'react'
import { cn } from '@/utilities/cn'

type FlipCardProps = {
  isFlipped: boolean
  className?: string
  front: React.ReactNode
  back: React.ReactNode
}

export const FlipCard: React.FC<FlipCardProps> = ({ isFlipped, className, front, back }) => (
  <div className={cn('perspective-[1000px]', className)}>
    <div
      className="relative w-full transition-transform duration-500 [transform-style:preserve-3d]"
      style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
    >
      <div className="[backface-visibility:hidden]">{front}</div>
      <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">{back}</div>
    </div>
  </div>
)

type CardVisualProps = {
  cardNumber?: string
  cardHolder?: string
  expiry?: string
  className?: string
}

export const CardFront: React.FC<CardVisualProps> = ({
  cardNumber = '•••• •••• •••• ••••',
  cardHolder = 'YOUR NAME',
  expiry = 'MM/YY',
  className,
}) => (
  <div
    className={cn(
      'relative w-full aspect-[1.586/1] rounded-sm bg-foreground p-5 flex flex-col justify-between overflow-hidden',
      className,
    )}
  >
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary/30 -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-primary/20 translate-y-1/3 -translate-x-1/4" />
    </div>

    <div className="flex items-center justify-between relative z-10">
      <div className="w-8 h-5 rounded-sm bg-primary/80" />
      <span className="font-mono text-[10px] text-background/60 tracking-wider">CREDIT</span>
    </div>

    <div className="relative z-10">
      <p className="font-mono text-lg text-background tracking-[0.15em] mb-3">
        {cardNumber.length > 19 ? cardNumber.slice(0, 19) : cardNumber.padEnd(19, '•')}
      </p>
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[8px] uppercase text-background/50 tracking-wider mb-0.5">Card Holder</p>
          <p className="font-mono text-xs text-background tracking-wider uppercase">
            {cardHolder || 'YOUR NAME'}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[8px] uppercase text-background/50 tracking-wider mb-0.5">Expires</p>
          <p className="font-mono text-xs text-background tracking-wider">{expiry || 'MM/YY'}</p>
        </div>
      </div>
    </div>
  </div>
)

export const CardBack: React.FC<{ cvv?: string; className?: string }> = ({ cvv = '•••', className }) => (
  <div
    className={cn(
      'relative w-full aspect-[1.586/1] rounded-sm bg-foreground overflow-hidden',
      className,
    )}
  >
    <div className="w-full h-10 bg-black/40 mt-6" />
    <div className="mx-5 mt-4 flex items-center gap-2">
      <div className="flex-1 h-7 bg-background/20 rounded-sm flex items-center justify-end px-3">
        <span className="font-mono text-xs text-background tracking-wider">{cvv}</span>
      </div>
      <span className="font-mono text-[8px] text-background/50 tracking-wider shrink-0">CVV</span>
    </div>
    <div className="mx-5 mt-4">
      <p className="font-mono text-[8px] text-background/40 tracking-wider text-center">
        This card is issued by the bank. Use of this card is subject to the card agreement.
      </p>
    </div>
  </div>
)
