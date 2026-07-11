"use client";

import React from "react";

import { Check, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import { cn } from "@/utilities/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
  success?: boolean;
  containerClassName?: string;
}

export const CheckoutInput = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      required,
      className,
      containerClassName,
      error,
      success,
      type = "text",
      ...props
    },
    ref,
  ) => {
    return (
      <Field className={containerClassName}>
        <FieldLabel required={required} className="font-sans font-medium text-[11px] tracking-[0.08em] uppercase text-foreground">
          {label}
        </FieldLabel>
        <FieldContent className="relative">
          <Input
            type={type}
            ref={ref}
            className={cn(
              "w-full h-12 bg-card border border-border px-3.5 font-sans text-sm text-foreground placeholder-muted-foreground transition-all focus-visible:border-foreground focus-visible:ring-0 shadow-none outline-none",
              error && "border-destructive",
              success && "border-success",
              className,
            )}
            {...props}
          />
          {success && (
            <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-success pointer-events-none" />
          )}
          {error && (
            <X className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-destructive pointer-events-none" />
          )}
        </FieldContent>
        {error && <FieldError errors={[{ message: error }]} className="font-sans text-[12px]" />}
      </Field>
    );
  },
);
CheckoutInput.displayName = "CheckoutInput";
