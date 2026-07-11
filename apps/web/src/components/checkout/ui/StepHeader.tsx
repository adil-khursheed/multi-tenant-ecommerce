'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/utilities/cn'

type StepHeaderProps = {
  number: string
  title: string
  subtitle?: string
  isCompleted?: boolean
  onEdit?: () => void
}

export const StepHeader: React.FC<StepHeaderProps> = ({
  number,
  title,
  subtitle,
  isCompleted,
  onEdit,
}) => (
  <div className="flex items-start justify-between mb-8">
    <div className="flex items-start gap-4">
      <div className="bg-foreground text-background font-mono text-[11px] px-[7px] py-[3px] rounded-sm mt-2">
        {number}
      </div>
      <div>
        <h2 className="font-serif text-3xl leading-tight text-foreground">{title}</h2>
        {subtitle && (
          <p className="font-sans text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
    {isCompleted && (
      <button
        onClick={onEdit}
        className="font-sans text-sm text-primary hover:underline mt-2"
      >
        Edit
      </button>
    )}
  </div>
)
