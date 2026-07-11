import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils'
import type { PayloadRequest } from 'payload'
import type { RazorpayWebhookEvent } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPayload = any

export type RazorpayWebhookHandler = (args: {
  event: RazorpayWebhookEvent
  req: PayloadRequest
}) => Promise<void> | void

export type WebhookHandlers = {
  [eventType: string]: RazorpayWebhookHandler
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string,
): boolean {
  try {
    validateWebhookSignature(rawBody, signature, secret)
    return true
  } catch {
    return false
  }
}

export function parseWebhookEvent(rawBody: string): RazorpayWebhookEvent {
  return JSON.parse(rawBody) as RazorpayWebhookEvent
}

export async function dispatchWebhookEvent(
  event: RazorpayWebhookEvent,
  handlers: WebhookHandlers,
  req: PayloadRequest,
): Promise<void> {
  const handler = handlers[event.event]
  if (typeof handler === 'function') {
    await handler({ event, req })
  }
}

export function createPaymentCaptureHandler(): RazorpayWebhookHandler {
  return async ({ event, req }) => {
    const payment = event.payload.payment?.entity
    if (!payment?.order_id || !payment?.id) return

    const payload = req.payload as AnyPayload

    const transactions = await payload.find({
      collection: 'transactions',
      req,
      where: {
        'razorpay.orderID': {
          equals: payment.order_id,
        },
      },
      limit: 1,
    })

    if (transactions.totalDocs === 0) return

    const transaction = transactions.docs[0]
    if (!transaction) return

    if (transaction.status === 'succeeded') return

    await payload.update({
      id: transaction.id,
      collection: 'transactions',
      data: {
        status: 'succeeded',
        razorpay: {
          ...(typeof transaction.razorpay === 'object' && transaction.razorpay !== null
            ? transaction.razorpay
            : {}),
          paymentID: payment.id,
        },
      },
      req,
    })

    if (!transaction.order) {
      const order = await payload.create({
        collection: 'orders',
        data: {
          amount: transaction.amount,
          currency: transaction.currency,
          customer: transaction.customer,
          customerEmail: transaction.customerEmail,
          items: transaction.items,
          shippingAddress: transaction.billingAddress,
          status: 'processing',
          transactions: [transaction.id],
        },
        req,
      })

      await payload.update({
        id: transaction.id,
        collection: 'transactions',
        data: { order: order.id },
        req,
      })
    }
  }
}

export function createPaymentFailedHandler(): RazorpayWebhookHandler {
  return async ({ event, req }) => {
    const payment = event.payload.payment?.entity
    if (!payment?.order_id) return

    const payload = req.payload as AnyPayload

    const transactions = await payload.find({
      collection: 'transactions',
      req,
      where: {
        'razorpay.orderID': {
          equals: payment.order_id,
        },
      },
      limit: 1,
    })

    if (transactions.totalDocs === 0) return

    const transaction = transactions.docs[0]
    if (!transaction) return

    await payload.update({
      id: transaction.id,
      collection: 'transactions',
      data: { status: 'failed' },
      req,
    })
  }
}

export function createDefaultWebhookHandlers(): WebhookHandlers {
  return {
    'payment.captured': createPaymentCaptureHandler(),
    'payment.failed': createPaymentFailedHandler(),
  }
}
