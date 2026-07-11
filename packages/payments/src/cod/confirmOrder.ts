import type { PayloadRequest } from 'payload'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPayload = any

export const confirmOrder = () =>
  async ({
    cartsSlug = 'carts',
    data,
    ordersSlug = 'orders',
    req,
    transactionsSlug = 'transactions',
  }: {
    cartsSlug?: string
    data: {
      transactionID?: string
      customerEmail?: string
      [key: string]: unknown
    }
    ordersSlug?: string
    req: PayloadRequest
    transactionsSlug?: string
  }) => {
    const payload = req.payload as AnyPayload
    const { transactionID, customerEmail } = data

    if (!transactionID) {
      throw new Error('Transaction ID is required for COD confirmation.')
    }

    try {
      const transaction = await payload.findByID({
        id: transactionID,
        collection: transactionsSlug,
        req,
        depth: 0,
      })

      if (!transaction) {
        throw new Error('Transaction not found.')
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

      const order = await payload.create({
        collection: ordersSlug,
        data: {
          amount: transaction.amount,
          currency: transaction.currency,
          ...(req.user
            ? { customer: req.user.id }
            : customerEmail
              ? { customerEmail }
              : {}),
          items: transaction.items,
          shippingAddress: transaction.billingAddress,
          status: 'processing',
          transactions: [transaction.id],
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
          cod: {
            codConfirmed: true,
          },
        },
        req,
      })

      return {
        message: 'COD order confirmed successfully',
        orderID: order.id,
        transactionID: transaction.id,
        ...('accessToken' in order
          ? { accessToken: (order as { accessToken?: string }).accessToken }
          : {}),
      }
    } catch (error) {
      payload.logger.error({
        err: error,
        msg: 'Error confirming COD order',
      })
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Unknown error confirming COD order',
      )
    }
  }
