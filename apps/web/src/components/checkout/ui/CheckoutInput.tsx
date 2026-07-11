'use client'

import React from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/utilities/cn'

type CheckoutInputProps = {
  label: string
  required?: boolean
  placeholder?: string
  className?: string
  error?: string
  success?: boolean
  type?: string
  disabled?: boolean
} & React.InputHTMLAttributes<HTMLInputElement>

export const CheckoutInput = React.forwardRef<HTMLInputElement, CheckoutInputProps>(
  ({ label, required, placeholder, className, error, success, type = 'text', disabled, ...props }, ref) => (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="font-sans font-medium text-[11px] tracking-[0.08em] uppercase text-foreground">
        {label} {required && <span className="text-primary ml-0.5">•</span>}
      </label>
      <div className="relative">
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full h-12 bg-background border border-border rounded-sm px-3.5 font-sans text-sm text-foreground placeholder-muted-foreground transition-all focus:border-foreground outline-none',
            error && 'border-destructive',
            success && 'border-primary/60',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
          {...props}
        />
        {success && (
          <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/60" />
        )}
        {error && (
          <X className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-destructive" />
        )}
      </div>
      {error && <p className="font-sans text-xs text-destructive">{error}</p>}
    </div>
  ),
)

CheckoutInput.displayName = 'CheckoutInput'
