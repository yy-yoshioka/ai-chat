import { NextRequest, NextResponse } from 'next/server';

interface BetaInviteRequest {
  email: string;
  company: string;
}

interface BetaRequest {
  email: string;
  company: string;
  timestamp: string;
  status: string;
  source: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, company }: BetaInviteRequest = body;

    // バリデーション
    if (!email || !company) {
      return NextResponse.json({ error: 'Email and company are required' }, { status: 400 });
    }

    // メールアドレスの簡単なバリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // ベータ招待データを保存（実際の実装では適切なデータベースに保存）
    const betaRequest: BetaRequest = {
      email,
      company,
      timestamp: new Date().toISOString(),
      status: 'pending',
      source: 'landing_page',
    };

    // TODO: 実際のデータベースに保存する処理
    console.log('Beta invite request:', betaRequest);

    // 管理者へのSlack通知
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await sendSlackNotification(betaRequest);
      } catch (error) {
        console.error('Failed to send Slack notification:', error);
      }
    }

    // ユーザーへの確認メール送信（実際の実装では適切なメールサービスを使用）
    console.log(`Sending beta invite confirmation email to: ${email}`);

    // 成功レスポンス
    return NextResponse.json({
      success: true,
      message: 'Beta invite request submitted successfully',
    });
  } catch (error) {
    console.error('Beta invite processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function sendSlackNotification(betaRequest: BetaRequest) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const message = {
    text: '🚀 新しいベータ招待リクエスト',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*🚀 新しいベータ招待リクエスト*',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*会社名:*\n${betaRequest.company}`,
          },
          {
            type: 'mrkdwn',
            text: `*メールアドレス:*\n${betaRequest.email}`,
          },
          {
            type: 'mrkdwn',
            text: `*申請時刻:*\n${new Date(betaRequest.timestamp).toLocaleString('ja-JP')}`,
          },
          {
            type: 'mrkdwn',
            text: `*ソース:*\n${betaRequest.source}`,
          },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'ベータアクセス承認',
            },
            style: 'primary',
            action_id: 'approve_beta',
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'CRMで詳細確認',
            },
            action_id: 'view_crm',
          },
        ],
      },
    ],
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error(`Slack API error: ${response.status}`);
  }
}
