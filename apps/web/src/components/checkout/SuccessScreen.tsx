'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { CheckCircle2, Package, Truck, CreditCard } from 'lucide-react'

import { Button } from '@/components/ui/button'

type Props = {
  orderID: string
}

export const SuccessScreen: React.FC<Props> = ({ orderID }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[60vh] py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="mb-8"
      >
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-success" strokeWidth={1.5} />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="font-serif text-4xl text-foreground mb-2"
      >
        Order Confirmed
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="font-sans text-sm text-muted-foreground mb-10"
      >
        Order ID: <span className="font-mono text-foreground">{orderID}</span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm space-y-3 mb-10"
      >
        <div className="flex items-center gap-4 p-4 bg-success/5 border border-success/20 rounded-sm">
          <CreditCard className="w-5 h-5 text-success shrink-0" />
          <div>
            <p className="text-sm font-sans font-medium text-foreground">Payment Confirmed</p>
            <p className="text-xs font-sans text-muted-foreground">Your payment has been processed</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-primary/5 border border-border rounded-sm">
          <Package className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-sans font-medium text-foreground">Order Processing</p>
            <p className="text-xs font-sans text-muted-foreground">We are preparing your order</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-primary/5 border border-border rounded-sm">
          <Truck className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-sans font-medium text-foreground">Delivery</p>
            <p className="text-xs font-sans text-muted-foreground">Estimated 3-5 business days</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex gap-3"
      >
        <Link href={`/orders/${orderID}`}>
          <Button variant="default" size="lg">View Order</Button>
        </Link>
        <Link href="/search">
          <Button variant="outline" size="lg">Continue Shopping</Button>
        </Link>
      </motion.div>
    </motion.div>
  )
}
