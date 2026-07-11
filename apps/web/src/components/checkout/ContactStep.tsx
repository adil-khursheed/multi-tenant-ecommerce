'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { LogIn, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StepHeader } from '@/components/checkout/ui/StepHeader'

type Props = {
  email: string
  setEmail: (v: string) => void
  emailEditable: boolean
  setEmailEditable: (v: boolean) => void
  user?: { email?: string | null } | null
  onContinue: () => void
}

export const ContactStep: React.FC<Props> = ({
  email,
  setEmail,
  emailEditable,
  setEmailEditable,
  user,
  onContinue,
}) => {
  if (user) {
    return (
      <div>
        <StepHeader number="01" title="Contact" />
        <div className="bg-card border border-border rounded-sm p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="font-sans text-sm font-medium text-primary">
                  {(user.email?.[0] || '').toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-sans font-medium text-foreground">{user.email}</p>
                <p className="text-xs font-sans text-muted-foreground">
                  Not you?{' '}
                  <Link href="/logout" className="text-primary hover:underline">
                    Log out
                  </Link>
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onContinue}>
              Continue
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <StepHeader number="01" title="Contact" subtitle="Checkout as guest or log in to your account" />

      <div className="bg-card border border-border rounded-sm p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs font-sans uppercase tracking-[0.08em] font-medium text-foreground">
            Email address
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!emailEditable}
            className="flex-1 h-11"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && email && emailEditable) {
                setEmailEditable(false)
                onContinue()
              }
            }}
          />
          <Button
            variant="default"
            disabled={!email || !emailEditable}
            onClick={() => {
              setEmailEditable(false)
              onContinue()
            }}
            className="h-11 px-6"
          >
            Continue
          </Button>
        </div>

        {email && !emailEditable && (
          <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-sm p-3">
            <span className="text-sm font-sans text-foreground flex-1">{email}</span>
            <button
              onClick={() => {
                setEmailEditable(true)
                setEmail('')
              }}
              className="text-xs font-sans text-primary hover:underline shrink-0"
            >
              Change
            </button>
          </div>
        )}

        <div className="border-t border-border pt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-sans text-primary hover:underline"
          >
            <LogIn className="w-4 h-4" />
            Log in to your account
          </Link>
        </div>
      </div>
    </div>
  )
}
