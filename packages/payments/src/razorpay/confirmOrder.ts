import Razorpay from 'razorpay'
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils'
import type { PayloadRequest } from 'payload'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPayload = any

export const confirmOrder = (props: { keyId: string; keySecret: string }) =>
  async ({
    cartsSlug = 'carts',
    data,
    ordersSlug = 'orders',
    req,
    transactionsSlug = 'transactions',
  }: {
    cartsSlug?: string
    data: {
      razorpayPaymentID?: string
      razorpayOrderID?: string
      razorpaySignature?: string
      customerEmail?: string
      [key: string]: unknown
    }
    ordersSlug?: string
    req: PayloadRequest
    transactionsSlug?: string
  }) => {
    const payload = req.payload as AnyPayload
    const { keyId, keySecret } = props
    const {
      razorpayPaymentID,
      razorpayOrderID,
      razorpaySignature,
      customerEmail,
    } = data

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials are required.')
    }
    if (!razorpayPaymentID) {
      throw new Error('Razorpay Payment ID is required.')
    }
    if (!razorpayOrderID) {
      throw new Error('Razorpay Order ID is required.')
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })

    try {
      if (razorpaySignature) {
        const body = razorpayOrderID + '|' + razorpayPaymentID
        validateWebhookSignature(body, razorpaySignature, keySecret)
      }

      const transactionsResults = await payload.find({
        collection: transactionsSlug,
        req,
        where: {
          'razorpay.orderID': {
            equals: razorpayOrderID,
          },
        },
      })

      const transaction = transactionsResults.docs[0]

      if (!transactionsResults.totalDocs || !transaction) {
        throw new Error(
          'No transaction found for the provided Razorpay Order ID',
        )
      }

      const existingOrders = await payload.find({
        collection: ordersSlug,
        req,
        where: {
          transactions: {
            equals: transaction.id,
          },
        },
        limit: 1,
      })

      if (existingOrders.totalDocs > 0) {
        const existing = existingOrders.docs[0]
        if (existing) {
          return {
            message: 'Order already confirmed',
            orderID: existing.id,
            transactionID: transaction.id,
            ...('accessToken' in existing
              ? { accessToken: (existing as { accessToken?: string }).accessToken }
              : {}),
          }
        }
      }

      const payment = await razorpay.payments.fetch(razorpayPaymentID)
      if (payment.status !== 'captured') {
        throw new Error(
          `Payment status is '${payment.status}', expected 'captured'`,
        )
      }

      const order = await payload.create({
        collection: ordersSlug,
        data: {
          amount: transaction.amount,
          currency: transaction.currency,
          ...(req.user
            ? { customer: req.user.id }
            : { customerEmail: customerEmail || transaction.customerEmail }),
          items: transaction.items,
          shippingAddress: transaction.billingAddress,
          status: 'processing',
          transactions: [transaction.id],
          couponCode: (transaction as Record<string, unknown>).couponCode || undefined,
          discount: (transaction as Record<string, unknown>).discount || 0,
          shippingCharge: (transaction as Record<string, unknown>).shippingCharge || 0,
        },
        req,
      })

      await payload.update({
        id: transaction.cart,
        collection: cartsSlug,
        data: {
          purchasedAt: new Date().toISOString(),
        },
        req,
      })

      await payload.update({
        id: transaction.id,
        collection: transactionsSlug,
        data: {
          order: order.id,
          status: 'succeeded',
          razorpay: {
            ...(typeof transaction.razorpay === 'object' && transaction.razorpay !== null
              ? transaction.razorpay
              : {}),
            paymentID: razorpayPaymentID,
          },
        },
        req,
      })

      return {
        message: 'Order confirmed successfully',
        orderID: order.id,
        transactionID: transaction.id,
        ...('accessToken' in order
          ? { accessToken: (order as { accessToken?: string }).accessToken }
          : {}),
      }
    } catch (error) {
      payload.logger.error({
        err: error,
        msg: 'Error confirming order with Razorpay',
      })
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Unknown error confirming order',
      )
    }
  }
