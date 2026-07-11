import Razorpay from 'razorpay'
import type { PayloadRequest } from 'payload'

type FlattenCartItem = {
  product: string
  quantity: number
  variant?: string
  [key: string]: unknown
}

type CartItem = {
  product: unknown
  variant?: unknown
  quantity: number
  [key: string]: unknown
}

function flattenCartItems(items: CartItem[]): FlattenCartItem[] {
  return items.map((item) => {
    const productID =
      typeof item.product === 'object' && item.product !== null
        ? (item.product as { id: string }).id
        : (item.product as string)

    const variantID = item.variant
      ? typeof item.variant === 'object' && item.variant !== null
        ? (item.variant as { id: string }).id
        : (item.variant as string)
      : undefined

    const { product: _product, variant: _variant, ...customProps } = item

    return {
      ...customProps,
      product: productID,
      quantity: item.quantity,
      ...(variantID ? { variant: variantID } : {}),
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPayload = any

export const initiatePayment = (props: { keyId: string; keySecret: string }) =>
  async ({
    data,
    req,
    transactionsSlug,
  }: {
    data: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      billingAddress: any
      cart: {
        id: string | number
        items: CartItem[]
        subtotal?: number
        customerEmail?: string
      }
      currency: string
      customerEmail: string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      shippingAddress?: any
    }
    req: PayloadRequest
    transactionsSlug: string
  }) => {
    const payload = req.payload as AnyPayload
    const { keyId, keySecret } = props
    const { customerEmail, currency, cart, billingAddress } = data
    const amount = cart.subtotal || 0

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials are required.')
    }
    if (!currency) {
      throw new Error('Currency is required.')
    }
    if (!cart?.items?.length) {
      throw new Error('Cart is empty or not provided.')
    }
    if (!customerEmail || typeof customerEmail !== 'string') {
      throw new Error('A valid customer email is required to make a purchase.')
    }
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      throw new Error('A valid amount is required to initiate a payment.')
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })

    try {
      const flattenedCart = flattenCartItems(cart.items)

      const order = await razorpay.orders.create({
        amount,
        currency: currency.toUpperCase(),
        receipt: String(cart.id),
        notes: { cartID: String(cart.id) },
      }) as { id: string }

      const transaction = await payload.create({
        collection: transactionsSlug,
        data: {
          ...(req.user ? { customer: req.user.id } : { customerEmail }),
          amount,
          billingAddress,
          cart: cart.id,
          currency: currency.toUpperCase(),
          items: flattenedCart,
          paymentMethod: 'razorpay',
          status: 'pending',
          razorpay: {
            orderID: order.id,
          },
        },
        req,
      })

      return {
        razorpayOrderID: order.id,
        amount,
        currency: currency.toUpperCase(),
        keyId,
        message: 'Payment initiated successfully',
        transactionID: transaction.id,
      }
    } catch (error) {
      payload.logger.error({
        err: error,
        msg: 'Error initiating payment with Razorpay',
      })
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Unknown error initiating payment',
      )
    }
  }
