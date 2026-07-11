'use client'

import React, { Suspense, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { motion, AnimatePresence } from 'motion/react'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'

import {
  useAddresses,
  useCart,
  usePayments,
} from '@payloadcms/plugin-ecommerce/client/react'

import { ContactStep } from '@/components/checkout/ContactStep'
import { AddressStep } from '@/components/checkout/AddressStep'
import { PaymentStep } from '@/components/checkout/PaymentStep'
import { ReviewStep } from '@/components/checkout/ReviewStep'
import { CODCheckout } from '@/components/checkout/CODCheckout'
import { MobileSummary } from '@/components/checkout/MobileSummary'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import { RazorpayCheckout } from '@/components/checkout/RazorpayCheckout'
import { SuccessScreen } from '@/components/checkout/SuccessScreen'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Address } from '@/payload-types'
import { useAuth } from '@/providers/Auth'

type PaymentMethod = 'razorpay' | 'cod'
type Step = 'contact' | 'address' | 'payment' | 'review' | 'success'

const steps: { key: Step; number: string; title: string }[] = [
  { key: 'contact', number: '01', title: 'Contact' },
  { key: 'address', number: '02', title: 'Delivery Address' },
  { key: 'payment', number: '03', title: 'Payment' },
  { key: 'review', number: '04', title: 'Review' },
]

type StepAccordionProps = {
  stepNumber: string
  title: string
  status: 'completed' | 'current' | 'upcoming'
  onEdit?: () => void
  summary?: React.ReactNode
  children: React.ReactNode
}

const StepAccordion: React.FC<StepAccordionProps> = ({
  stepNumber,
  title,
  status,
  onEdit,
  summary,
  children,
}) => {
  const isExpanded = status === 'current'
  const isCompleted = status === 'completed'

  return (
    <div
      className={`border rounded-sm transition-colors ${
        status === 'current'
          ? 'border-foreground/20 bg-card'
          : isCompleted
            ? 'border-border bg-card'
            : 'border-border bg-background'
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center gap-4 px-5 py-4 ${
          isCompleted ? 'cursor-pointer' : ''
        }`}
        onClick={isCompleted ? onEdit : undefined}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-mono ${
            isCompleted
              ? 'bg-success text-success-foreground'
              : status === 'current'
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground'
          }`}
        >
          {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
        </div>

        <h3
          className={`font-serif text-xl flex-1 ${
            status === 'current'
              ? 'text-foreground'
              : isCompleted
                ? 'text-foreground'
                : 'text-muted-foreground'
          }`}
        >
          {title}
        </h3>

        {isCompleted && summary && (
          <div className="hidden md:block text-right mr-2">
            {summary}
          </div>
        )}

        {isCompleted && (
          <button className="text-xs font-sans text-primary hover:underline shrink-0">
            Edit
          </button>
        )}

        {!isCompleted && !isExpanded && (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </div>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth()
  const { cart, clearCart } = useCart()
  const { addresses } = useAddresses()

  const [activeStep, setActiveStep] = useState<Step>('contact')
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [emailEditable, setEmailEditable] = useState(true)

  const [billingAddress, setBillingAddress] = useState<Partial<Address>>()
  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>()
  const [sameAsShipping, setSameAsShipping] = useState(true)

  const [paymentData, setPaymentData] = useState<Record<string, unknown> | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('razorpay')
  const [selectedPaymentSubMethod, setSelectedPaymentSubMethod] = useState<string>('card')
  const [isProcessingPayment, setProcessingPayment] = useState(false)

  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null)

  const cartIsEmpty = !cart || !cart.items || !cart.items.length

  useEffect(() => {
    if (!billingAddress && addresses && addresses.length > 0) {
      setBillingAddress(addresses[0])
    }
  }, [addresses, billingAddress])

  useEffect(() => {
    if (user && activeStep === 'contact') {
      setActiveStep('address')
    }
  }, [user, activeStep])

  const effectiveShippingAddress = sameAsShipping ? billingAddress : shippingAddress
  const canProceedToPayment = Boolean(user || (email && !emailEditable)) && Boolean(billingAddress)

  const getStepStatus = (step: Step): 'completed' | 'current' | 'upcoming' => {
    const order: Step[] = ['contact', 'address', 'payment', 'review']
    const currentIdx = order.indexOf(activeStep)
    const stepIdx = order.indexOf(step)

    if (activeStep === 'success') return 'completed'
    if (stepIdx < currentIdx) return 'completed'
    if (stepIdx === currentIdx) return 'current'
    return 'upcoming'
  }

  const handleContactContinue = useCallback(() => {
    setActiveStep('address')
  }, [])

  const handlePaymentReady = useCallback(
    (method: PaymentMethod, subMethod: string, data: Record<string, unknown>) => {
      setSelectedPaymentMethod(method)
      setSelectedPaymentSubMethod(subMethod)
      setPaymentData(data)
      setError(null)
      setActiveStep('review')
    },
    [],
  )

  const handlePaymentSuccess = useCallback(
    (result: { orderID: string; accessToken?: string }) => {
      setCompletedOrderId(result.orderID)
      setActiveStep('success')
    },
    [],
  )

  if (cartIsEmpty && isProcessingPayment) {
    return (
      <div className="py-12 w-full flex items-center justify-center">
        <div className="text-center">
          <p className="font-sans text-sm text-muted-foreground mb-4">Processing your payment...</p>
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (cartIsEmpty && activeStep !== 'success') {
    return (
      <div className="py-12 w-full items-center">
        <p className="font-sans text-sm text-muted-foreground mb-4">Your cart is empty.</p>
        <Link href="/search" className="font-sans text-sm text-primary hover:underline">
          Continue shopping?
        </Link>
      </div>
    )
  }

  if (activeStep === 'success' && completedOrderId) {
    return <SuccessScreen orderID={completedOrderId} />
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 my-8 lg:my-12">
        {/* Left Column - Stepper */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Contact */}
          <StepAccordion
            stepNumber="01"
            title="Contact"
            status={getStepStatus('contact')}
            onEdit={() => setActiveStep('contact')}
            summary={
              <span className="text-xs font-sans text-muted-foreground">
                {user?.email || email || ''}
              </span>
            }
          >
            <ContactStep
              email={email}
              setEmail={setEmail}
              emailEditable={emailEditable}
              setEmailEditable={setEmailEditable}
              user={user}
              onContinue={handleContactContinue}
            />
          </StepAccordion>

          {/* Address */}
          <StepAccordion
            stepNumber="02"
            title="Delivery Address"
            status={getStepStatus('address')}
            onEdit={() => {
              setPaymentData(null)
              setActiveStep('address')
            }}
            summary={
              billingAddress ? (
                <span className="text-xs font-sans text-muted-foreground">
                  {billingAddress.firstName} {billingAddress.lastName}, {billingAddress.city}
                </span>
              ) : undefined
            }
          >
            <AddressStep
              billingAddress={billingAddress}
              setBillingAddress={setBillingAddress}
              shippingAddress={shippingAddress}
              setShippingAddress={setShippingAddress}
              sameAsShipping={sameAsShipping}
              setSameAsShipping={setSameAsShipping}
              email={email}
              user={user}
              emailEditable={emailEditable}
            />

            {activeStep === 'address' && (
              <div className="mt-6">
                <Button
                  variant="default"
                  className="w-full h-11"
                  disabled={!canProceedToPayment}
                  onClick={() => setActiveStep('payment')}
                >
                  Continue to Payment
                </Button>
              </div>
            )}
          </StepAccordion>

          {/* Payment */}
          <StepAccordion
            stepNumber="03"
            title="Payment"
            status={getStepStatus('payment')}
            onEdit={() => {
              setPaymentData(null)
              setActiveStep('payment')
            }}
            summary={
              <span className="text-xs font-sans text-muted-foreground">
                {selectedPaymentMethod === 'cod'
                  ? 'Cash on Delivery'
                  : selectedPaymentSubMethod === 'upi'
                    ? 'UPI'
                    : 'Card'}
              </span>
            }
          >
            {activeStep === 'payment' && !paymentData && (
              <PaymentStep
                onPaymentReady={handlePaymentReady}
                billingAddress={billingAddress as Record<string, unknown>}
                shippingAddress={effectiveShippingAddress as Record<string, unknown>}
                email={email || (user as any)?.email as string}
              />
            )}

            {activeStep === 'review' && paymentData && (
              <div className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-sm p-3 text-sm font-sans text-destructive">
                    {error}
                  </div>
                )}

                <Suspense
                  fallback={
                    <div className="py-8 text-center">
                      <LoadingSpinner />
                    </div>
                  }
                >
                  {selectedPaymentMethod === 'razorpay' && Boolean(paymentData['razorpayOrderID']) && (
                    <RazorpayCheckout
                      razorpayOrderID={paymentData['razorpayOrderID'] as string}
                      amount={paymentData['amount'] as number}
                      currency={paymentData['currency'] as string}
                      customerEmail={email || (user as any)?.email as string}
                      billingAddress={billingAddress as Record<string, unknown>}
                      setProcessingPayment={setProcessingPayment}
                      onSuccess={handlePaymentSuccess}
                    />
                  )}

                  {selectedPaymentMethod === 'cod' && Boolean(paymentData['transactionID']) && (
                    <CODCheckout
                      transactionID={paymentData['transactionID'] as string}
                      customerEmail={email || (user as any)?.email as string}
                      setProcessingPayment={setProcessingPayment}
                      onSuccess={handlePaymentSuccess}
                    />
                  )}
                </Suspense>

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setPaymentData(null)
                    setActiveStep('payment')
                  }}
                >
                  Back to Payment
                </Button>
              </div>
            )}
          </StepAccordion>

          {/* Review */}
          {activeStep === 'review' && paymentData && (
            <StepAccordion
              stepNumber="04"
              title="Review"
              status="current"
            >
              <ReviewStep
                billingAddress={billingAddress}
                shippingAddress={effectiveShippingAddress}
                paymentMethod={selectedPaymentMethod}
                paymentSubMethod={selectedPaymentSubMethod}
                onEdit={(step) => {
                  setPaymentData(null)
                  setActiveStep(step)
                }}
              />
            </StepAccordion>
          )}
        </div>

        {/* Right Column - Summary */}
        <div className="w-full lg:w-[380px] shrink-0 hidden lg:block">
          <div className="sticky top-8">
            <OrderSummary />
          </div>
        </div>

        {/* Mobile Summary */}
        <MobileSummary />
      </div>
    </>
  )
}
