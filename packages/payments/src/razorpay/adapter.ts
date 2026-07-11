import type { PaymentAdapter, PaymentAdapterClient } from '@payloadcms/plugin-ecommerce/types'
import { initiatePayment } from './initiatePayment'
import { confirmOrder } from './confirmOrder'
import type { RazorpayAdapterArgs } from './types'

export const razorpayAdapter = (props: RazorpayAdapterArgs): PaymentAdapter => {
  const { keyId, keySecret, groupOverrides } = props
  const label = props?.label || 'UPI / Card / Wallets'

  const baseFields = [
    {
      name: 'customerID',
      type: 'text' as const,
      label: 'Razorpay Customer ID',
    },
    {
      name: 'orderID',
      type: 'text' as const,
      label: 'Razorpay Order ID',
    },
    {
      name: 'paymentID',
      type: 'text' as const,
      label: 'Razorpay Payment ID',
    },
  ]

  const groupField = {
    name: 'razorpay',
    type: 'group' as const,
    ...groupOverrides,
    admin: {
      condition: (data: Record<string, unknown>) => {
        return data?.paymentMethod === 'razorpay'
      },
      ...groupOverrides?.admin,
    },
    fields:
      groupOverrides?.fields && typeof groupOverrides.fields === 'function'
        ? groupOverrides.fields({ defaultFields: baseFields })
        : baseFields,
  }

  return {
    name: 'razorpay',
    confirmOrder: confirmOrder({ keyId, keySecret }),
    group: groupField,
    initiatePayment: initiatePayment({ keyId, keySecret }),
    label,
  }
}

export const razorpayAdapterClient = (): PaymentAdapterClient => {
  return {
    name: 'razorpay',
    confirmOrder: true,
    initiatePayment: true,
    label: 'UPI / Card / Wallets',
  }
}
