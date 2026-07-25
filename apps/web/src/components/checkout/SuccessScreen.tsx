"use client";

import React from "react";
import Link from "next/link";

import { CheckCircle2, CreditCard, Package, Truck } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";

type Props = {
  orderID: string;
};

export const SuccessScreen: React.FC<Props> = ({ orderID }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[70vh] py-16"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mb-8"
      >
        <div className="w-24 h-24 rounded-full bg-foreground flex items-center justify-center relative shadow-lg">
          <CheckCircle2
            className="w-12 h-12 text-background"
            strokeWidth={1.5}
          />
          <div className="absolute -inset-4 border border-foreground/10 rounded-full animate-[spin_10s_linear_infinite]" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="font-serif text-[40px] text-foreground mb-4 text-center leading-tight"
      >
        Thank You for Your Order
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="font-sans text-[15px] text-muted-foreground mb-12"
      >
        Order ID:{" "}
        <span className="font-mono text-foreground tracking-wider ml-1">
          {orderID}
        </span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-[440px] space-y-4 mb-12"
      >
        <div className="flex items-center gap-5 p-5 bg-card border border-border rounded-[4px] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-foreground" />
          <CreditCard
            className="w-6 h-6 text-foreground shrink-0"
            strokeWidth={1.5}
          />
          <div>
            <p className="font-serif text-[18px] text-foreground mb-1">
              Payment Confirmed
            </p>
            <p className="text-[13px] font-sans text-muted-foreground">
              Your payment has been successfully processed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 p-5 bg-secondary/50 border border-border rounded-[4px] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-border" />
          <Package
            className="w-6 h-6 text-muted-foreground shrink-0"
            strokeWidth={1.5}
          />
          <div>
            <p className="font-serif text-[18px] text-muted-foreground mb-1">
              Order Processing
            </p>
            <p className="text-[13px] font-sans text-muted-foreground">
              We are preparing your order
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 p-5 bg-secondary/50 border border-border rounded-[4px] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-border" />
          <Truck
            className="w-6 h-6 text-muted-foreground shrink-0"
            strokeWidth={1.5}
          />
          <div>
            <p className="font-serif text-[18px] text-muted-foreground mb-1">
              Delivery expected
            </p>
            <p className="text-[13px] font-sans text-muted-foreground">
              Usually within 3-5 business days
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-4 w-full max-w-[440px]"
      >
        <Link href={`/orders/${orderID}`} className="flex-1">
          <Button
            variant="default"
            className="w-full h-12 uppercase tracking-[0.08em] font-medium rounded-[4px]"
          >
            View Order
          </Button>
        </Link>
        <Link href="/search" className="flex-1">
          <Button
            variant="outline"
            className="w-full h-12 uppercase tracking-[0.08em] font-medium rounded-[4px]"
          >
            Continue Shopping
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
};
