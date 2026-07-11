import type { PaymentAdapterArgs } from '@payloadcms/plugin-ecommerce/types'

export type CODAdapterArgs = {
  label?: string
} & PaymentAdapterArgs

export type CODInitiatePaymentReturnType = {
  transactionID: string
  message: string
}

export type CODConfirmOrderReturnType = {
  message: string
  orderID: string
  transactionID: string
  accessToken?: string
}
