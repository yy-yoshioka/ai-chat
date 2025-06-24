import { NextRequest, NextResponse } from 'next/server';
import { StripeWebhookEvent } from '@/app/_domains/billing';

// Webhook signature verification (実際の実装ではstripeライブラリを使用)
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  // 開発環境用のモック実装
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // 実際の実装では以下のようになります:
  /*
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret);
    return !!event;
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return false;
  }
  */

  return payload && signature && secret ? true : false;
}

// サブスクリプション更新処理
async function handleSubscriptionUpdated(subscriptionData: Record<string, unknown>): Promise<void> {
  try {
    console.log('Processing subscription.updated event:', subscriptionData.id);

    // 実際の実装では以下のような処理を行います:
    /*
    await prisma.subscription.upsert({
      where: { stripeSubscriptionId: subscriptionData.id },
      update: {
        status: subscriptionData.status,
        currentPeriodStart: new Date(subscriptionData.current_period_start * 1000),
        currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000),
        trialStart: subscriptionData.trial_start ? new Date(subscriptionData.trial_start * 1000) : null,
        trialEnd: subscriptionData.trial_end ? new Date(subscriptionData.trial_end * 1000) : null,
        canceledAt: subscriptionData.canceled_at ? new Date(subscriptionData.canceled_at * 1000) : null,
        cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
        updatedAt: new Date()
      },
      create: {
        stripeSubscriptionId: subscriptionData.id,
        stripeCustomerId: subscriptionData.customer,
        status: subscriptionData.status,
        currentPeriodStart: new Date(subscriptionData.current_period_start * 1000),
        currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000),
        trialStart: subscriptionData.trial_start ? new Date(subscriptionData.trial_start * 1000) : null,
        trialEnd: subscriptionData.trial_end ? new Date(subscriptionData.trial_end * 1000) : null,
        canceledAt: subscriptionData.canceled_at ? new Date(subscriptionData.canceled_at * 1000) : null,
        cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    */

    // モック処理（ログ出力のみ）
    console.log(`Subscription ${subscriptionData.id} status: ${subscriptionData.status}`);
  } catch (error) {
    console.error('Failed to handle subscription.updated:', error);
    throw error;
  }
}

// 支払い完了処理
async function handleInvoicePaid(invoiceData: Record<string, unknown>): Promise<void> {
  try {
    console.log('Processing invoice.paid event:', invoiceData.id);

    // 実際の実装では以下のような処理を行います:
    /*
    const invoice = invoiceData;
    const subscriptionId = invoice.subscription;
    
    // 支払い記録を作成
    await prisma.payment.create({
      data: {
        stripeInvoiceId: invoice.id,
        stripeSubscriptionId: subscriptionId,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'succeeded',
        paidAt: new Date(invoice.status_transitions.paid_at * 1000),
        createdAt: new Date()
      }
    });

    // サブスクリプションステータスを更新
    if (subscriptionId) {
      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscriptionId },
        data: {
          status: 'active',
          lastPaymentAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    // ユーザーにメール通知送信
    await sendPaymentSuccessEmail(invoice.customer_email, {
      amount: invoice.amount_paid,
      currency: invoice.currency,
      invoiceUrl: invoice.hosted_invoice_url
    });
    */

    // モック処理（ログ出力のみ）
    console.log(
      `Invoice ${invoiceData.id} paid: ${invoiceData.amount_paid} ${invoiceData.currency}`
    );
  } catch (error) {
    console.error('Failed to handle invoice.paid:', error);
    throw error;
  }
}

// 支払い失敗処理
async function handleInvoicePaymentFailed(invoiceData: Record<string, unknown>): Promise<void> {
  try {
    console.log('Processing invoice.payment_failed event:', invoiceData.id);

    // 実際の実装では支払い失敗時の処理を行います:
    /*
    - サブスクリプション状態をpast_dueに更新
    - ユーザーに支払い失敗の通知メール送信
    - 再試行スケジュール設定
    */

    console.log(`Payment failed for invoice: ${invoiceData.id}`);
  } catch (error) {
    console.error('Failed to handle invoice.payment_failed:', error);
    throw error;
  }
}

// カスタマー削除処理
async function handleCustomerDeleted(customerData: Record<string, unknown>): Promise<void> {
  try {
    console.log('Processing customer.deleted event:', customerData.id);

    // 実際の実装では顧客削除時の処理を行います:
    /*
    - サブスクリプションの無効化
    - ユーザーアカウントの状態更新
    - データ保持ポリシーに従った処理
    */

    console.log(`Customer deleted: ${customerData.id}`);
  } catch (error) {
    console.error('Failed to handle customer.deleted:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Webhook signature verification
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Raw body取得
    const payload = await req.text();

    // Signature verification
    if (!verifyWebhookSignature(payload, signature || '', webhookSecret)) {
      console.error('Webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Webhook event parsing
    const event: StripeWebhookEvent = JSON.parse(payload);

    console.log(`Processing webhook event: ${event.type} (${event.id})`);

    // Event type based processing
    switch (event.type) {
      case 'subscription.created':
      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.deleted':
        await handleCustomerDeleted(event.data.object);
        break;

      case 'checkout.session.completed':
        // チェックアウト完了時の処理
        console.log('Checkout session completed:', event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
        break;
    }

    return NextResponse.json({ received: true, processed: event.type });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
