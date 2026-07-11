'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react'
import { defaultCountries as supportedCountries } from '@payloadcms/plugin-ecommerce/client/react'
import { Plus, Check, MapPin, Building2 } from 'lucide-react'

import { AddressItem } from '@/components/addresses/AddressItem'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Address } from '@/payload-types'
import { StepHeader } from '@/components/checkout/ui/StepHeader'
import { FormError } from '@/components/forms/FormError'

type AddressFormValues = {
  title?: string | null
  firstName?: string | null
  lastName?: string | null
  company?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
  phone?: string | null
}

type Props = {
  billingAddress?: Partial<Address>
  setBillingAddress: (addr: Partial<Address>) => void
  shippingAddress?: Partial<Address>
  setShippingAddress: (addr: Partial<Address>) => void
  sameAsShipping: boolean
  setSameAsShipping: (v: boolean) => void
  isCompleted?: boolean
  onEdit?: () => void
  email?: string
  user?: { email?: string | null } | null
  emailEditable?: boolean
}

const titles = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Mx.', 'Other']

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
  const { addresses } = useAddresses()
  const [showForm, setShowForm] = useState(false)
  const [needsGST, setNeedsGST] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<AddressFormValues>()

  useEffect(() => {
    if (billingAddress?.id) {
      setSelectedAddressId(billingAddress.id as string)
      setShowForm(false)
    }
  }, [billingAddress])

  const onFormSubmit = useCallback(
    (data: AddressFormValues) => {
      setBillingAddress(data as Partial<Address>)
      setShowForm(false)
    },
    [setBillingAddress],
  )

  const handleSelectAddress = useCallback(
    (addr: Partial<Address>) => {
      setBillingAddress(addr)
      setSelectedAddressId(addr.id as string)
      setShowForm(false)
    },
    [setBillingAddress],
  )

  const hasSavedAddresses = addresses && addresses.length > 0

  return (
    <div>
      <StepHeader
        number="02"
        title="Delivery Address"
        isCompleted={isCompleted}
        onEdit={onEdit}
      />

      <div className="space-y-5">
        {/* Saved Addresses */}
        {hasSavedAddresses && !showForm && (
          <div className="space-y-3">
            <p className="text-xs font-sans uppercase tracking-[0.08em] font-medium text-foreground">
              Saved addresses
            </p>

            <div className="space-y-2">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => handleSelectAddress(addr)}
                  className={`w-full text-left border rounded-sm p-4 transition-colors ${
                    selectedAddressId === addr.id
                      ? 'border-foreground bg-foreground/[0.02]'
                      : 'border-border hover:border-foreground/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedAddressId === addr.id ? 'border-foreground' : 'border-border'
                        }`}
                      >
                        {selectedAddressId === addr.id && (
                          <div className="w-2 h-2 rounded-full bg-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <AddressItem address={addr} hideActions />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 text-sm font-sans text-primary hover:underline"
            >
              <Plus className="w-4 h-4" />
              Add a new address
            </button>
          </div>
        )}

        {/* No saved addresses or adding new */}
        {(!hasSavedAddresses || showForm) && (
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <p className="text-xs font-sans uppercase tracking-[0.08em] font-medium text-foreground">
              {showForm ? 'New address' : 'Enter your address'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="addr-title" className="text-[11px] font-sans uppercase tracking-[0.08em] font-medium">
                  Title
                </Label>
                <Select
                  onValueChange={(v) => setValue('title', v)}
                  defaultValue={billingAddress?.title || ''}
                >
                  <SelectTrigger id="addr-title" className="h-11">
                    <SelectValue placeholder="Title" />
                  </SelectTrigger>
                  <SelectContent>
                    {titles.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="addr-firstName" className="text-[11px] font-sans uppercase tracking-[0.08em] font-medium">
                  First name <span className="text-primary">*</span>
                </Label>
                <Input
                  id="addr-firstName"
                  className="h-11"
                  {...register('firstName', { required: 'Required' })}
                />
                {errors.firstName && <FormError message={errors.firstName.message} />}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="addr-lastName" className="text-[11px] font-sans uppercase tracking-[0.08em] font-medium">
                  Last name <span className="text-primary">*</span>
                </Label>
                <Input
                  id="addr-lastName"
                  className="h-11"
                  {...register('lastName', { required: 'Required' })}
                />
                {errors.lastName && <FormError message={errors.lastName.message} />}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-phone" className="text-[11px] font-sans uppercase tracking-[0.08em] font-medium">
                Phone
              </Label>
              <Input
                id="addr-phone"
                type="tel"
                className="h-11"
                {...register('phone')}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-company" className="text-[11px] font-sans uppercase tracking-[0.08em] font-medium">
                Company
              </Label>
              <Input
                id="addr-company"
                className="h-11"
                {...register('company')}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-line1" className="text-[11px] font-sans uppercase tracking-[0.08em] font-medium">
                Address line 1 <span className="text-primary">*</span>
              </Label>
              <Input
                id="addr-line1"
                className="h-11"
                {...register('addressLine1', { required: 'Required' })}
              />
              {errors.addressLine1 && <FormError message={errors.addressLine1.message} />}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-line2" className="text-[11px] font-sans uppercase tracking-[0.08em] font-medium">
                Address line 2
              </Label>
              <Input
                id="addr-line2"
                className="h-11"
                {...register('addressLine2')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="addr-city" className="text-[11px] font-sans uppercase tracking-[0.08em] font-medium">
                  City <span className="text-primary">*</span>
                </Label>
                <Input
                  id="addr-city"
                  className="h-11"
                  {...register('city', { required: 'Required' })}
                />
                {errors.city && <FormError message={errors.city.message} />}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="addr-state" className="text-[11px] font-sans uppercase tracking-[0.08em] font-medium">
                  State
                </Label>
                <Input
                  id="addr-state"
                  className="h-11"
                  {...register('state')}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="addr-postalCode" className="text-[11px] font-sans uppercase tracking-[0.08em] font-medium">
                  Postal code <span className="text-primary">*</span>
                </Label>
                <Input
                  id="addr-postalCode"
                  className="h-11"
                  {...register('postalCode', { required: 'Required' })}
                />
                {errors.postalCode && <FormError message={errors.postalCode.message} />}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-country" className="text-[11px] font-sans uppercase tracking-[0.08em] font-medium">
                Country <span className="text-primary">*</span>
              </Label>
              <Select
                onValueChange={(v) => setValue('country', v)}
                defaultValue={billingAddress?.country || ''}
              >
                <SelectTrigger id="addr-country" className="h-11 w-full">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {supportedCountries.map((c) => {
                    const value = typeof c === 'string' ? c : c.value
                    const label = typeof c === 'string' ? c : typeof c.label === 'string' ? c.label : value
                    return (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {errors.country && <FormError message={errors.country.message} />}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="default" className="h-11 px-8">
                Save address
              </Button>
              {showForm && (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        )}

        {/* GST Toggle */}
        {billingAddress && (
          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="gst-toggle"
                checked={needsGST}
                onCheckedChange={(v) => setNeedsGST(v as boolean)}
              />
              <Label htmlFor="gst-toggle" className="text-sm font-sans text-foreground cursor-pointer flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                I need a GST invoice
              </Label>
            </div>
            {needsGST && (
              <div className="mt-3 bg-primary/5 border border-primary/20 rounded-sm p-3">
                <p className="text-xs font-sans text-muted-foreground">
                  GST invoice will be generated with your order. Please ensure your GST details are correct in the address above.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Shipping Same as Billing */}
        {billingAddress && (
          <div className="flex items-center gap-3">
            <Checkbox
              id="shippingSame"
              checked={sameAsShipping}
              onCheckedChange={(state) => setSameAsShipping(state as boolean)}
            />
            <Label htmlFor="shippingSame" className="text-sm font-sans text-foreground cursor-pointer">
              Shipping address same as billing
            </Label>
          </div>
        )}

        {/* Separate Shipping Address */}
        {!sameAsShipping && billingAddress && (
          <div className="bg-card border border-border rounded-sm p-5">
            <p className="text-xs font-sans uppercase tracking-[0.08em] font-medium text-foreground mb-3">
              Shipping address
            </p>
            {shippingAddress ? (
              <div className="border border-border rounded-sm p-4">
                <AddressItem
                  address={shippingAddress}
                  actions={
                    <Button variant="outline" size="sm" onClick={() => setShippingAddress({})}>
                      Change
                    </Button>
                  }
                />
              </div>
            ) : user ? (
              <div className="space-y-3">
                {addresses && addresses.length > 0 ? (
                  addresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => setShippingAddress(addr)}
                      className="w-full text-left border border-border rounded-sm p-4 hover:border-foreground/30 transition-colors"
                    >
                      <AddressItem address={addr} hideActions />
                    </button>
                  ))
                ) : (
                  <CreateAddressModal
                    callback={(addr) => setShippingAddress(addr)}
                    skipSubmission
                  />
                )}
              </div>
            ) : (
              <CreateAddressModal
                disabled={!email || !!emailEditable}
                callback={(addr) => setShippingAddress(addr)}
                skipSubmission
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
