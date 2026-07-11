import type { PayloadRequest } from 'payload'
import type {
  PaymentAdapter as PaymentAdapterType,
  PaymentAdapterClient as PaymentAdapterClientType,
  PaymentAdapterArgs as PaymentAdapterArgsType,
} from '@payloadcms/plugin-ecommerce/types'

export type PaymentAdapter = PaymentAdapterType
export type PaymentAdapterClient = PaymentAdapterClientType
export type PaymentAdapterArgs = PaymentAdapterArgsType

export interface PaymentAdapterModule {
  adapter: (args: any) => any
  clientAdapter: (args?: any) => any
}

export interface WebhookHandlerArgs {
  req: PayloadRequest
}
