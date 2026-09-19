/**
 * Who the customer is being told about. One env var per fact, so fitting this
 * for a different trade is configuration rather than a code change — and so no
 * other firm's name is ever hardcoded into this product.
 */
export const TRADE_NAME = process.env.NEXT_PUBLIC_TRADE_NAME || 'Your tradesperson'
export const TRADE_PHONE = process.env.NEXT_PUBLIC_TRADE_PHONE || ''
export const TRADE_PHONE_TEL =
  process.env.NEXT_PUBLIC_TRADE_PHONE_TEL || TRADE_PHONE.replace(/\D/g, '')
