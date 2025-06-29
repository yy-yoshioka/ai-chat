/** BFF → Express で使う Checkout 要求 */
export interface BillingCheckoutRequest {
  priceId: string;
  orgId: string;
}

/** Express → BFF 応答 */
export interface BillingCheckoutResponse {
  sessionId: string;
  sessionUrl: string;
}
