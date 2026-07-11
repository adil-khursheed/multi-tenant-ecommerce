import type { PayloadRequest } from 'payload'
import type { PaymentAdapterArgs } from '@payloadcms/plugin-ecommerce/types'

export type RazorpayAdapterArgs = {
  keyId: string
  keySecret: string
  webhookSecret?: string
  webhooks?: Record<string, RazorpayWebhookHandler>
} & PaymentAdapterArgs

export type RazorpayWebhookHandler = (args: {
  event: RazorpayWebhookEvent
  req: PayloadRequest
  razorpay: any
}) => Promise<void> | void

export type RazorpayWebhookEvent = {
  event: string
  id: string
  payload: {
    payment?: { entity: RazorpayPayment }
    order?: { entity: RazorpayOrder }
  }
}

export type RazorpayPayment = {
  id: string
  entity: 'payment'
  amount: number
  currency: string
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed'
  order_id: string
  method: string
  description?: string
  email?: string
  contact?: string
  created_at: number
}

export type RazorpayOrder = {
  id: string
  entity: 'order'
  amount: number
  currency: string
  status: 'created' | 'attempted' | 'paid'
  receipt?: string
  created_at: number
}

export type InitiatePaymentReturnType = {
  razorpayOrderID: string
  amount: number
  currency: string
  keyId: string
  message: string
}

export type ConfirmOrderReturnType = {
  message: string
  orderID: string
  transactionID: string
  accessToken?: string
}
