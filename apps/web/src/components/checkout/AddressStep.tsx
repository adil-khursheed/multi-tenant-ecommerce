"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  defaultCountries as supportedCountries,
  useAddresses,
} from "@payloadcms/plugin-ecommerce/client/react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Plus } from "lucide-react";
import * as z from "zod";

import { CheckoutInput } from "@/components/checkout/ui/CheckoutInput";
import { FormError } from "@/components/forms/FormError";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Address } from "@/payload-types";
import { cn } from "@/utilities/cn";

const getCountryLabel = (code: string): string => {
  const country = supportedCountries.find((c) =>
    typeof c === "string" ? c === code : c.value === code,
  );
  if (!country) return code;
  return typeof country === "string" ? country : country.label;
};

const addressSchema = z.object({
  title: z.string().nullable().optional(),
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  company: z.string().nullable().optional(),
  addressLine1: z.string().min(1, "Required"),
  addressLine2: z.string().nullable().optional(),
  city: z.string().min(1, "Required"),
  state: z.string().nullable().optional(),
  postalCode: z.string().min(1, "Required"),
  country: z.string().min(1, "Required"),
  phone: z.string().nullable().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

type Props = {
  billingAddress?: Partial<Address>;
  setBillingAddress: (addr: Partial<Address>) => void;
  shippingAddress?: Partial<Address>;
  setShippingAddress: (addr: Partial<Address>) => void;
  sameAsShipping: boolean;
  setSameAsShipping: (v: boolean) => void;
  isCompleted?: boolean;
  onEdit?: () => void;
  email?: string;
  user?: { email?: string | null } | null;
  emailEditable?: boolean;
};

export const AddressStep: React.FC<Props> = ({
  billingAddress,
  setBillingAddress,
  shippingAddress,
  setShippingAddress,
  sameAsShipping,
  setSameAsShipping,
  isCompleted,
  onEdit,
  email,
  user,
  emailEditable,
}) => {
  const { addresses } = useAddresses();
  const [showForm, setShowForm] = useState(false);
  const [needsGST, setNeedsGST] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  const { control, handleSubmit, reset } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: billingAddress?.firstName || "",
      lastName: billingAddress?.lastName || "",
      addressLine1: billingAddress?.addressLine1 || "",
      addressLine2: billingAddress?.addressLine2 || "",
      city: billingAddress?.city || "",
      state: billingAddress?.state || "",
      postalCode: billingAddress?.postalCode || "",
      country: billingAddress?.country || "",
      phone: billingAddress?.phone || "",
    },
  });

  useEffect(() => {
    if (billingAddress?.id) {
      setSelectedAddressId(billingAddress.id as string);
      setShowForm(false);
    }
  }, [billingAddress]);

  const onFormSubmit = useCallback(
    (data: AddressFormValues) => {
      setBillingAddress(data as Partial<Address>);
      setShowForm(false);
    },
    [setBillingAddress],
  );

  const handleSelectAddress = useCallback(
    (addr: Partial<Address>) => {
      setBillingAddress(addr);
      setSelectedAddressId(addr.id as string);
      setShowForm(false);
    },
    [setBillingAddress],
  );

  const hasSavedAddresses = addresses && addresses.length > 0;

  return (
    <div className="overflow-hidden">
      <div className="space-y-5">
        {/* Saved Addresses */}
        {hasSavedAddresses && !showForm && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => handleSelectAddress(addr)}
                    className={cn(
                      "border rounded-lg p-4 relative cursor-pointer transition-colors",
                      isSelected
                        ? "border-foreground bg-card"
                        : "border-border bg-transparent hover:border-foreground",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-4 right-4 w-4 h-4 rounded-full",
                        isSelected
                          ? "border-4 border-foreground"
                          : "border border-border",
                      )}
                    />
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-sans font-medium text-[13px] text-foreground">
                        {addr.title || "Saved Address"}
                      </h4>
                      {isSelected && (
                        <span className="bg-secondary text-foreground text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-[2px]">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="font-sans text-[13px] text-muted-foreground leading-relaxed mb-4">
                      {addr.firstName} {addr.lastName}
                      <br />
                      {addr.addressLine1}
                      {addr.addressLine2 && (
                        <>
                          <br />
                          {addr.addressLine2}
                        </>
                      )}
                      <br />
                      {addr.city}, {addr.state} {addr.postalCode}
                      <br />
                      {getCountryLabel(addr.country || "")}
                    </p>
                    <div className="flex items-center gap-4 border-t border-border pt-3">
                      <Button
                        type="button"
                        variant="link"
                        className="font-sans text-[12px] text-primary h-auto p-0 hover:underline"
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="link"
                        className="font-sans text-[12px] text-muted-foreground h-auto p-0 hover:text-foreground hover:no-underline"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 h-12 border-dashed border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors mb-8"
            >
              <Plus className="w-4 h-4" />
              <span className="font-sans text-[12px] uppercase tracking-[0.08em] font-medium">
                Add New Address
              </span>
            </Button>
          </>
        )}

        {/* Form (New or no saved addresses) */}
        {(!hasSavedAddresses || showForm) && (
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="font-sans font-medium text-[11px] tracking-[0.08em] uppercase text-foreground">
                {showForm && hasSavedAddresses
                  ? "New address"
                  : "Enter your address"}
              </p>
              {showForm && hasSavedAddresses && (
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setShowForm(false)}
                  className="font-sans text-[12px] text-primary h-auto p-0 hover:underline"
                >
                  Cancel
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="firstName"
                control={control}
                render={({ field, fieldState }) => (
                  <CheckoutInput
                    label="First name"
                    required
                    error={fieldState.error?.message}
                    {...field}
                    value={field.value || ""}
                  />
                )}
              />
              <Controller
                name="lastName"
                control={control}
                render={({ field, fieldState }) => (
                  <CheckoutInput
                    label="Last name"
                    required
                    error={fieldState.error?.message}
                    {...field}
                    value={field.value || ""}
                  />
                )}
              />
            </div>

            <Controller
              name="phone"
              control={control}
              render={({ field, fieldState }) => (
                <CheckoutInput
                  label="Phone"
                  type="tel"
                  error={fieldState.error?.message}
                  {...field}
                  value={field.value || ""}
                />
              )}
            />

            <Controller
              name="addressLine1"
              control={control}
              render={({ field, fieldState }) => (
                <CheckoutInput
                  label="Address line 1"
                  required
                  error={fieldState.error?.message}
                  {...field}
                  value={field.value || ""}
                />
              )}
            />

            <Controller
              name="addressLine2"
              control={control}
              render={({ field, fieldState }) => (
                <CheckoutInput
                  label="Address line 2 (Optional)"
                  error={fieldState.error?.message}
                  {...field}
                  value={field.value || ""}
                />
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name="city"
                control={control}
                render={({ field, fieldState }) => (
                  <CheckoutInput
                    label="City"
                    required
                    error={fieldState.error?.message}
                    {...field}
                    value={field.value || ""}
                  />
                )}
              />
              <Controller
                name="state"
                control={control}
                render={({ field, fieldState }) => (
                  <CheckoutInput
                    label="State"
                    error={fieldState.error?.message}
                    {...field}
                    value={field.value || ""}
                  />
                )}
              />
              <Controller
                name="postalCode"
                control={control}
                render={({ field, fieldState }) => (
                  <CheckoutInput
                    label="Postal code"
                    required
                    error={fieldState.error?.message}
                    {...field}
                    value={field.value || ""}
                  />
                )}
              />
            </div>

            <Controller
              name="country"
              control={control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="addr-country"
                    className="font-sans font-medium text-[11px] tracking-[0.08em] uppercase text-foreground"
                  >
                    Country <span className="text-primary ml-0.5">•</span>
                  </Label>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <SelectTrigger
                      id="addr-country"
                      className="data-[size=default]:h-12 w-full bg-card border-border font-sans text-sm text-foreground focus:ring-0 focus:border-foreground"
                    >
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedCountries.map((c) => {
                        const value = typeof c === "string" ? c : c.value;
                        const label =
                          typeof c === "string"
                            ? c
                            : typeof c.label === "string"
                              ? c.label
                              : value;
                        return (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <FormError message={fieldState.error.message} />
                  )}
                </div>
              )}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="default"
                className="w-full h-14 uppercase tracking-[0.1em] text-[14px] font-medium"
              >
                Use this Address
              </Button>
            </div>
          </form>
        )}

        {/* Extra Options */}
        {billingAddress && !showForm && (
          <div className="space-y-4 pt-4 border-t border-border">
            {/* GST Toggle */}
            <div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="gst-toggle"
                  checked={needsGST}
                  onCheckedChange={(v) => setNeedsGST(v as boolean)}
                  className="border-border data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
                />
                <Label
                  htmlFor="gst-toggle"
                  className="text-[13px] font-sans text-foreground cursor-pointer flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-muted-foreground" />I need
                  a GST invoice
                </Label>
              </div>
              {needsGST && (
                <div className="mt-3 bg-secondary border border-border rounded-lg p-3">
                  <p className="text-[12px] font-sans text-muted-foreground">
                    GST invoice will be generated with your order. Please ensure
                    your GST details are correct in the address above.
                  </p>
                </div>
              )}
            </div>

            {/* Shipping Same as Billing */}
            <div className="flex items-center gap-3">
              <Checkbox
                id="shippingSame"
                checked={sameAsShipping}
                onCheckedChange={(state) => setSameAsShipping(state as boolean)}
                className="border-border data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
              />
              <Label
                htmlFor="shippingSame"
                className="text-[13px] font-sans text-foreground cursor-pointer"
              >
                Shipping address same as billing
              </Label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
