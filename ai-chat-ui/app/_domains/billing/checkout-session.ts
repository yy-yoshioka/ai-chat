/** 旧フロー（planId ベース）の Checkout セッション作成リクエスト */
export interface CheckoutSessionRequest {
  planId: string;
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
  trial?: boolean;
}
