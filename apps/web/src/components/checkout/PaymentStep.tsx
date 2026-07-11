'use client'

import React, { useCallback, useState } from 'react'
import { usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { CreditCard, Smartphone, Banknote, Lock, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StepHeader } from '@/components/checkout/ui/StepHeader'
import { FlipCard, CardFront, CardBack } from '@/components/checkout/ui/FlipCard'

type PaymentMethod = 'razorpay' | 'cod'

type Props = {
  isCompleted?: boolean
  onEdit?: () => void
  onPaymentReady: (method: PaymentMethod, subMethod: string, data: Record<string, unknown>) => void
  billingAddress?: Record<string, unknown>
  shippingAddress?: Record<string, unknown>
  email?: string
}

const paymentMethods = [
  { id: 'card' as const, label: 'Card', icon: CreditCard, description: 'Credit or Debit card' },
  { id: 'upi' as const, label: 'UPI', icon: Smartphone, description: 'Google Pay, PhonePe, etc.' },
  { id: 'cod' as const, label: 'Cash on Delivery', icon: Banknote, description: 'Pay on delivery' },
]

type PaymentTab = 'card' | 'upi' | 'cod'

export const PaymentStep: React.FC<Props> = ({
  isCompleted,
  onEdit,
  onPaymentReady,
  billingAddress,
  shippingAddress,
  email,
}) => {
  const [activeTab, setActiveTab] = useState<PaymentTab>('card')
  const [isInitiating, setIsInitiating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { initiatePayment } = usePayments()

  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCVV, setCardCVV] = useState('')
  const [upiId, setUpiId] = useState('')
  const [isCVVFocused, setIsCVVFocused] = useState(false)

  const formatCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return digits
  }

  const handleInitiate = useCallback(
    async (method: PaymentMethod) => {
      setIsInitiating(true)
      setError(null)

      try {
        const data = (await initiatePayment(method, {
          additionalData: {
            ...(email ? { customerEmail: email } : {}),
            billingAddress,
            shippingAddress,
            ...(method === 'razorpay' ? { paymentMethod: activeTab } : {}),
          },
        })) as Record<string, unknown> | null

        if (data) {
          onPaymentReady(method, activeTab, data)
        }
      } catch (err) {
        const errorData = err instanceof Error
          ? (() => { try { return JSON.parse(err.message) } catch { return {} } })()
          : {}
        let msg = 'Failed to initiate payment. Please try again.'
        if (errorData?.cause?.code === 'OutOfStock') {
          msg = 'One or more items in your cart are out of stock.'
        }
        setError(msg)
      } finally {
        setIsInitiating(false)
      }
    },
    [activeTab, email, billingAddress, shippingAddress, initiatePayment, onPaymentReady],
  )

  const handleCardSubmit = useCallback(() => {
    if (!cardNumber || !cardHolder || !cardExpiry || !cardCVV) {
      setError('Please fill in all card details.')
      return
    }
    if (cardCVV.length < 3) {
      setError('CVV must be 3 or 4 digits.')
      return
    }
    setError(null)
    handleInitiate('razorpay')
  }, [cardNumber, cardHolder, cardExpiry, cardCVV, handleInitiate])

  const handleUPISubmit = useCallback(() => {
    if (!upiId || !upiId.includes('@')) {
      setError('Please enter a valid UPI ID (e.g., name@upi).')
      return
    }
    setError(null)
    handleInitiate('razorpay')
  }, [upiId, handleInitiate])

  return (
    <div>
      <StepHeader number="03" title="Payment" isCompleted={isCompleted} onEdit={onEdit} />

      {error && (
        <div className="mb-4 bg-destructive/10 border border-destructive/30 rounded-sm p-3 flex items-start gap-2 text-sm font-sans text-destructive">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-0 border border-border rounded-sm overflow-hidden">
        {/* Side Nav */}
        <div className="w-full md:w-52 shrink-0 bg-card border-b md:border-b-0 md:border-r border-border">
          <div className="flex md:flex-col">
            {paymentMethods.map((pm) => {
              const Icon = pm.icon
              const isActive =
                (pm.id === 'card' && activeTab === 'card') ||
                (pm.id === 'upi' && activeTab === 'upi') ||
                (pm.id === 'cod' && activeTab === 'cod')

              return (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(pm.id as PaymentTab)
                    setError(null)
                  }}
                  className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
                    isActive
                      ? 'bg-foreground/[0.04] border-l-2 md:border-l-0 md:border-l-2 border-foreground'
                      : 'border-l-2 md:border-l-0 md:border-l-2 border-transparent hover:bg-foreground/[0.02]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
                  <div className="min-w-0">
                    <p className={`text-sm font-sans font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {pm.label}
                    </p>
                    <p className="text-[11px] font-sans text-muted-foreground hidden md:block">{pm.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-5 min-h-[340px]">
          {/* Card Tab */}
          {activeTab === 'card' && (
            <div className="space-y-5">
              <FlipCard
                isFlipped={isCVVFocused}
                className="max-w-[340px]"
                front={
                  <CardFront
                    cardNumber={cardNumber}
                    cardHolder={cardHolder}
                    expiry={cardExpiry}
                  />
                }
                back={
                  <CardBack cvv={cardCVV} />
                }
              />

              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[11px] font-sans uppercase tracking-[0.08em] font-medium">
                    Card number
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      className="h-11 font-mono tracking-wider pr-10"
                      maxLength={19}
                    />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-[11px] font-sans uppercase tracking-[0.08em] font-medium">
                    Cardholder name
                  </Label>
                  <Input
                    placeholder="John Doe"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-sans uppercase tracking-[0.08em] font-medium">
                      Expiry
                    </Label>
                    <Input
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      className="h-11 font-mono"
                      maxLength={5}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-sans uppercase tracking-[0.08em] font-medium">
                      CVV
                    </Label>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder="•••"
                        value={cardCVV}
                        onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        onFocus={() => setIsCVVFocused(true)}
                        onBlur={() => setIsCVVFocused(false)}
                        className="h-11 font-mono"
                        maxLength={4}
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                variant="default"
                className="w-full h-11"
                disabled={isInitiating}
                onClick={handleCardSubmit}
              >
                {isInitiating ? 'Processing...' : 'Pay with Card'}
              </Button>
            </div>
          )}

          {/* UPI Tab */}
          {activeTab === 'upi' && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-sans text-muted-foreground mb-4">
                  Enter your UPI ID to pay securely. You will receive a payment request on your UPI app.
                </p>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-[11px] font-sans uppercase tracking-[0.08em] font-medium">
                    UPI ID <span className="text-primary">*</span>
                  </Label>
                  <Input
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="h-11 font-mono"
                  />
                  <p className="text-[11px] font-sans text-muted-foreground">
                    Supported: Google Pay, PhonePe, Paytm, BHIM, etc.
                  </p>
                </div>
              </div>

              <Button
                variant="default"
                className="w-full h-11"
                disabled={isInitiating || !upiId}
                onClick={handleUPISubmit}
              >
                {isInitiating ? 'Processing...' : 'Pay with UPI'}
              </Button>
            </div>
          )}

          {/* COD Tab */}
          {activeTab === 'cod' && (
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-sm p-4">
                  <Banknote className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-sans font-medium text-foreground">Cash on Delivery</p>
                    <p className="text-xs font-sans text-muted-foreground mt-1">
                      Pay with cash when your order is delivered. Please keep the exact change ready.
                    </p>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-sm p-3">
                  <p className="text-xs font-sans text-muted-foreground">
                    COD orders may take slightly longer to process. A nominal convenience fee may apply.
                  </p>
                </div>
              </div>

              <Button
                variant="default"
                className="w-full h-11"
                disabled={isInitiating}
                onClick={() => handleInitiate('cod')}
              >
                {isInitiating ? 'Placing order...' : 'Place Order (COD)'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
