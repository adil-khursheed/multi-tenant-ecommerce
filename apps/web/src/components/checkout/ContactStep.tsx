"use client";

import React, { useState } from "react";
import Link from "next/link";

import { CheckoutInput as Input } from "@/components/checkout/ui/CheckoutInput";
import { Button } from "@/components/ui/button";

type Props = {
  email: string;
  setEmail: (v: string) => void;
  emailEditable: boolean;
  setEmailEditable: (v: boolean) => void;
  user?: { email?: string | null } | null;
  onContinue: () => void;
};

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
      <div className="overflow-hidden">
        <div className="bg-secondary border border-border rounded-[4px] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-sans font-medium text-xs">
              {(user.email?.[0] || "").toUpperCase()}
            </div>
            <div>
              <p className="font-sans text-[13px] text-muted-foreground">
                {user.email}
              </p>
              <Link
                href="/logout"
                className="font-sans text-[11px] text-primary hover:underline"
              >
                Not you? Log out
              </Link>
            </div>
          </div>
          <button
            onClick={onContinue}
            className="font-sans font-medium text-[13px] text-foreground underline"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="flex gap-8 border-b border-border mb-8">
        <button className="pb-2 font-sans font-medium text-[13px] text-foreground border-b-2 border-primary">
          Guest Checkout
        </button>
        <Link
          href="/login"
          className="pb-2 font-sans text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign In
        </Link>
      </div>

      <div className="max-w-md">
        <Input
          label="EMAIL ADDRESS FOR ORDER UPDATES"
          placeholder="e.g. name@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          success={email.includes("@") && email.includes(".")}
          disabled={!emailEditable}
          onKeyDown={(e) => {
            if (e.key === "Enter" && email && emailEditable) {
              setEmailEditable(false);
              onContinue();
            }
          }}
        />
        <p className="font-sans text-[11px] text-muted-foreground mt-4 text-center">
          By continuing, you agree to our{" "}
          <a href="#" className="text-primary">
            Terms
          </a>{" "}
          &{" "}
          <a href="#" className="text-primary">
            Privacy Policy
          </a>
        </p>

        {email && !emailEditable ? (
          <div className="mt-8 flex items-center justify-between bg-secondary border border-border rounded-[4px] p-4">
            <span className="font-sans text-[13px] text-muted-foreground">
              {email}
            </span>
            <button
              onClick={() => {
                setEmailEditable(true);
                setEmail("");
              }}
              className="text-[12px] font-sans text-primary hover:underline"
            >
              Change
            </button>
          </div>
        ) : (
          <Button
            disabled={!email.includes("@") || !emailEditable}
            onClick={() => {
              setEmailEditable(false);
              onContinue();
            }}
            variant="default"
            className="mt-8 w-full h-14 uppercase tracking-[0.1em] text-[14px] font-medium"
          >
            Continue to Shipping →
          </Button>
        )}
      </div>
    </div>
  );
};
