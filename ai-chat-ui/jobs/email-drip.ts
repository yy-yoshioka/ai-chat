import { NextApiRequest, NextApiResponse } from 'next';

// Cron authorization check
function verifyCronToken(token: string): boolean {
  // 開発環境用のモック実装
  if (process.env.NODE_ENV === 'development') {
    return token === 'dev-cron-token';
  }

  // 実際の実装では専用のCronトークンを検証
  return token === process.env.CRON_SECRET_TOKEN;
}

// トライアルユーザー情報の型定義
interface TrialUser {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  organizationName: string;
  trialStartDate: string;
  trialEndDate: string;
  daysInTrial: number;
}

// メールテンプレート型定義
interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

// Day-1 ウェルカムメール
const welcomeEmailTemplate: EmailTemplate = {
  subject: '🎉 AIチャットの無料トライアル開始！設定ガイドをご確認ください',
  htmlContent: `
    <div style="font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic Pro', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">AIチャット 無料トライアル開始！</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">14日間、すべての機能をお試しください</p>
      </div>
      
      <div style="padding: 40px 20px; background: white;">
        <h2 style="color: #333; font-size: 20px; margin-bottom: 20px;">{{name}}さん、ようこそ！</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          AIチャットの無料トライアルを開始いただき、ありがとうございます。<br>
          {{organizationName}}のトライアル期間は<strong>{{trialEndDate}}</strong>まで有効です。
        </p>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">📋 最初にやっておくこと</h3>
          <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>ウェブサイトにチャットウィジェットを設置</li>
            <li>FAQとナレッジベースの設定</li>
            <li>チーム メンバーの招待</li>
            <li>AI設定のカスタマイズ</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{setupGuideUrl}}" style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            設定ガイドを見る
          </a>
        </div>

        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196F3;">
          <p style="margin: 0; color: #1976D2;">
            <strong>💡 ヒント:</strong> ご不明な点がございましたら、チャット右下のサポートボタンからお気軽にお問い合わせください。
          </p>
        </div>
      </div>
    </div>
  `,
  textContent: `
AIチャット 無料トライアル開始！

{{name}}さん、ようこそ！

AIチャットの無料トライアルを開始いただき、ありがとうございます。
{{organizationName}}のトライアル期間は{{trialEndDate}}まで有効です。

最初にやっておくこと：
- ウェブサイトにチャットウィジェットを設置
- FAQとナレッジベースの設定  
- チーム メンバーの招待
- AI設定のカスタマイズ

設定ガイド: {{setupGuideUrl}}

ご不明な点がございましたら、お気軽にお問い合わせください。
  `,
};

// Day-3 活用ヒントメール
const tipsEmailTemplate: EmailTemplate = {
  subject: '🚀 AIチャット活用のコツ｜トライアル残り11日',
  htmlContent: `
    <div style="font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic Pro', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🚀 AIチャット活用のコツ</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">トライアル残り11日 - 効果を最大化しましょう</p>
      </div>
      
      <div style="padding: 40px 20px; background: white;">
        <h2 style="color: #333; font-size: 20px; margin-bottom: 20px;">{{name}}さん、調子はいかがですか？</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
          トライアル開始から3日が経ちました。AIチャットをより効果的に活用するためのヒントをご紹介します。
        </p>

        <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #f57c00; margin: 0 0 15px 0; font-size: 18px;">💡 成功のポイント</h3>
          <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li><strong>FAQ充実:</strong> よくある質問を10-20個追加すると回答精度が向上</li>
            <li><strong>カスタム応答:</strong> 業界特有の用語に合わせてAIをトレーニング</li>
            <li><strong>エスカレーション設定:</strong> 複雑な問い合わせを人間のサポートへ自動転送</li>
          </ul>
        </div>

        <div style="background: #f3e5f5; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #7b1fa2; margin: 0 0 15px 0; font-size: 18px;">📈 効果測定のご提案</h3>
          <p style="color: #666; line-height: 1.6; margin: 0;">
            ダッシュボードで<strong>解決率</strong>と<strong>顧客満足度</strong>をチェックしてみてください。<br>
            改善点が見つかれば、お気軽にサポートチームにご相談ください。
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" style="background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-right: 15px;">
            ダッシュボードを確認
          </a>
          <a href="{{supportUrl}}" style="background: #666; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            サポートに相談
          </a>
        </div>
      </div>
    </div>
  `,
  textContent: `
🚀 AIチャット活用のコツ｜トライアル残り11日

{{name}}さん、調子はいかがですか？

トライアル開始から3日が経ちました。AIチャットをより効果的に活用するためのヒントをご紹介します。

💡 成功のポイント：
- FAQ充実: よくある質問を10-20個追加すると回答精度が向上
- カスタム応答: 業界特有の用語に合わせてAIをトレーニング  
- エスカレーション設定: 複雑な問い合わせを人間のサポートへ自動転送

📈 効果測定のご提案：
ダッシュボードで解決率と顧客満足度をチェックしてみてください。
改善点が見つかれば、お気軽にサポートチームにご相談ください。

ダッシュボード: {{dashboardUrl}}
サポート: {{supportUrl}}
  `,
};

// Day-7 中間チェックメール
const midTrialEmailTemplate: EmailTemplate = {
  subject: '⚡ トライアル週間レポート｜残り7日でプランをご検討ください',
  htmlContent: `
    <div style="font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic Pro', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">⚡ トライアル週間レポート</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">残り7日 - プランのご検討をお願いします</p>
      </div>
      
      <div style="padding: 40px 20px; background: white;">
        <h2 style="color: #333; font-size: 20px; margin-bottom: 20px;">{{name}}さん、1週間お疲れさまでした！</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
          AIチャットをご利用いただき1週間が経ちました。トライアル期間も残り7日となりましたので、
          プランのご検討をお願いいたします。
        </p>

        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 25px; border: 2px solid #4CAF50;">
          <h3 style="color: #2e7d32; margin: 0 0 15px 0; font-size: 18px;">📊 {{organizationName}}の活用状況</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 15px;">
            <div style="flex: 1; min-width: 120px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #2e7d32;">{{totalMessages}}</div>
              <div style="color: #666; font-size: 14px;">総チャット数</div>
            </div>
            <div style="flex: 1; min-width: 120px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #2e7d32;">{{resolutionRate}}%</div>
              <div style="color: #666; font-size: 14px;">解決率</div>
            </div>
            <div style="flex: 1; min-width: 120px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #2e7d32;">{{avgResponseTime}}s</div>
              <div style="color: #666; font-size: 14px;">平均応答時間</div>
            </div>
          </div>
        </div>

        <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #f57c00; margin: 0 0 15px 0; font-size: 18px;">🎯 おすすめプラン</h3>
          <p style="color: #666; line-height: 1.6; margin: 0 0 15px 0;">
            現在の利用状況から、<strong>Proプラン（月額2,980円）</strong>が最適です。<br>
            月間10,000メッセージまで対応し、高度なAI機能をご利用いただけます。
          </p>
          <ul style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li>無制限のカスタムブランディング</li>
            <li>詳細な分析レポート</li>
            <li>優先サポート対応</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{upgradeUrl}}" style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-right: 15px;">
            プランを選択する
          </a>
          <a href="{{extendTrialUrl}}" style="background: #ff9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            トライアル延長
          </a>
        </div>
      </div>
    </div>
  `,
  textContent: `
⚡ トライアル週間レポート｜残り7日

{{name}}さん、1週間お疲れさまでした！

AIチャットをご利用いただき1週間が経ちました。トライアル期間も残り7日となりましたので、プランのご検討をお願いいたします。

📊 {{organizationName}}の活用状況：
- 総チャット数: {{totalMessages}}
- 解決率: {{resolutionRate}}%  
- 平均応答時間: {{avgResponseTime}}s

🎯 おすすめプラン：
現在の利用状況から、Proプラン（月額2,980円）が最適です。
月間10,000メッセージまで対応し、高度なAI機能をご利用いただけます。

- 無制限のカスタムブランディング
- 詳細な分析レポート
- 優先サポート対応

プラン選択: {{upgradeUrl}}
トライアル延長: {{extendTrialUrl}}
  `,
};

// Day-12 最終リマインダーメール
const finalReminderEmailTemplate: EmailTemplate = {
  subject: '🚨 【緊急】トライアル残り2日｜継続手続きをお忘れなく',
  htmlContent: `
    <div style="font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic Pro', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🚨 トライアル終了まで残り2日</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">継続手続きをお忘れなく</p>
      </div>
      
      <div style="padding: 40px 20px; background: white;">
        <h2 style="color: #333; font-size: 20px; margin-bottom: 20px;">{{name}}さん、継続のご検討をお願いします</h2>
        
        <div style="background: #ffebee; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #f44336;">
          <p style="color: #d32f2f; line-height: 1.6; margin: 0; font-weight: bold;">
            ⚠️ {{organizationName}}のトライアル期間は<span style="font-size: 18px;">{{trialEndDate}}</span>に終了します。<br>
            継続をご希望の場合は、今すぐプランをお選びください。
          </p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">📈 トライアル期間の成果</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 15px;">
            <div style="flex: 1; min-width: 120px; text-align: center; background: white; padding: 15px; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold; color: #4CAF50;">{{totalMessages}}</div>
              <div style="color: #666; font-size: 14px;">処理したチャット</div>
            </div>
            <div style="flex: 1; min-width: 120px; text-align: center; background: white; padding: 15px; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold; color: #2196F3;">{{savedHours}}</div>
              <div style="color: #666; font-size: 14px;">節約した時間</div>
            </div>
            <div style="flex: 1; min-width: 120px; text-align: center; background: white; padding: 15px; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold; color: #ff9800;">{{satisfactionScore}}</div>
              <div style="color: #666; font-size: 14px;">顧客満足度</div>
            </div>
          </div>
        </div>

        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #2e7d32; margin: 0 0 15px 0; font-size: 18px;">💝 特別オファー</h3>
          <p style="color: #666; line-height: 1.6; margin: 0;">
            今なら<strong>初月50%オフ</strong>でProプランをご利用いただけます！<br>
            月額2,980円→<span style="color: #f44336; font-weight: bold; font-size: 18px;">1,490円</span>（初月のみ）
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{upgradeUrl}}" style="background: #4CAF50; color: white; padding: 20px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 18px; margin-bottom: 15px;">
            今すぐ継続する（50%オフ）
          </a>
          <br>
          <a href="{{contactUrl}}" style="color: #666; text-decoration: underline; font-size: 14px;">
            ご相談・ご質問はこちら
          </a>
        </div>

        <div style="background: #fff3e0; padding: 15px; border-radius: 8px; border-left: 4px solid #ff9800;">
          <p style="margin: 0; color: #e65100; font-size: 14px;">
            <strong>⏰ 注意:</strong> トライアル終了後、データは30日間保持されますが、新しいチャットを受け付けることができなくなります。
          </p>
        </div>
      </div>
    </div>
  `,
  textContent: `
🚨 【緊急】トライアル残り2日｜継続手続きをお忘れなく

{{name}}さん、継続のご検討をお願いします

⚠️ {{organizationName}}のトライアル期間は{{trialEndDate}}に終了します。
継続をご希望の場合は、今すぐプランをお選びください。

📈 トライアル期間の成果：
- 処理したチャット: {{totalMessages}}
- 節約した時間: {{savedHours}}  
- 顧客満足度: {{satisfactionScore}}

💝 特別オファー：
今なら初月50%オフでProプランをご利用いただけます！
月額2,980円→1,490円（初月のみ）

継続する: {{upgradeUrl}}
ご相談: {{contactUrl}}

⏰ 注意: トライアル終了後、データは30日間保持されますが、新しいチャットを受け付けることができなくなります。
  `,
};

// メールテンプレート選択
function getEmailTemplate(dayInTrial: number): EmailTemplate | null {
  switch (dayInTrial) {
    case 1:
      return welcomeEmailTemplate;
    case 3:
      return tipsEmailTemplate;
    case 7:
      return midTrialEmailTemplate;
    case 12:
      return finalReminderEmailTemplate;
    default:
      return null;
  }
}

// トライアルユーザー取得（モック実装）
async function getTrialUsers(): Promise<TrialUser[]> {
  // 実際の実装では以下のような処理を行います:
  /*
  const trialUsers = await prisma.organization.findMany({
    where: {
      subscription: {
        status: 'trial',
        trialEnd: {
          gte: new Date(), // まだ終了していない
        }
      }
    },
    include: {
      subscription: true,
      users: {
        where: {
          role: 'admin'
        },
        take: 1
      }
    }
  });

  return trialUsers.map(org => ({
    id: org.users[0].id,
    email: org.users[0].email,
    name: org.users[0].name,
    organizationId: org.id,
    organizationName: org.name,
    trialStartDate: org.subscription.trialStart,
    trialEndDate: org.subscription.trialEnd,
    daysInTrial: Math.floor(
      (Date.now() - new Date(org.subscription.trialStart).getTime()) / 
      (1000 * 60 * 60 * 24)
    ) + 1
  }));
  */

  // モック実装
  const mockUsers: TrialUser[] = [
    {
      id: 'user-1',
      email: 'admin@example1.com',
      name: '田中太郎',
      organizationId: 'org-1',
      organizationName: '株式会社サンプル',
      trialStartDate: '2024-01-01T00:00:00Z',
      trialEndDate: '2024-01-15T00:00:00Z',
      daysInTrial: 1,
    },
    {
      id: 'user-2',
      email: 'admin@example2.com',
      name: '佐藤花子',
      organizationId: 'org-2',
      organizationName: 'テスト商事',
      trialStartDate: '2024-01-01T00:00:00Z',
      trialEndDate: '2024-01-15T00:00:00Z',
      daysInTrial: 3,
    },
    {
      id: 'user-3',
      email: 'admin@example3.com',
      name: '山田一郎',
      organizationId: 'org-3',
      organizationName: 'サンプル株式会社',
      trialStartDate: '2024-01-01T00:00:00Z',
      trialEndDate: '2024-01-15T00:00:00Z',
      daysInTrial: 7,
    },
    {
      id: 'user-4',
      email: 'admin@example4.com',
      name: '鈴木次郎',
      organizationId: 'org-4',
      organizationName: 'デモ会社',
      trialStartDate: '2024-01-01T00:00:00Z',
      trialEndDate: '2024-01-15T00:00:00Z',
      daysInTrial: 12,
    },
  ];

  return mockUsers;
}

// 使用量統計取得（モック実装）
async function getUsageStats(organizationId: string): Promise<{
  totalMessages: number;
  resolutionRate: number;
  avgResponseTime: number;
  savedHours: number;
  satisfactionScore: string;
}> {
  // モック実装
  console.log(`Getting usage stats for organization: ${organizationId}`);
  return {
    totalMessages: Math.floor(Math.random() * 500) + 100,
    resolutionRate: Math.floor(Math.random() * 30) + 70,
    avgResponseTime: Math.floor(Math.random() * 5) + 2,
    savedHours: Math.floor(Math.random() * 20) + 10,
    satisfactionScore: (Math.random() * 1 + 4).toFixed(1) + '/5.0',
  };
}

// メール送信（モック実装）
async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
  textContent: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // モック実装
    console.log(`📧 Sending email to: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    console.log(`📧 HTML length: ${htmlContent.length} chars`);
    console.log(`📧 Text length: ${textContent.length} chars`);

    // モック処理の遅延
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// テンプレート変数置換
function replaceTemplateVariables(
  template: string,
  user: TrialUser,
  stats?: {
    totalMessages?: number;
    resolutionRate?: number;
    avgResponseTime?: number;
    savedHours?: number;
    satisfactionScore?: string;
  }
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const variables: Record<string, string> = {
    name: user.name,
    organizationName: user.organizationName,
    trialEndDate: new Date(user.trialEndDate).toLocaleDateString('ja-JP'),
    setupGuideUrl: `${baseUrl}/onboarding/step-install`,
    dashboardUrl: `${baseUrl}/admin/org/${user.organizationId}`,
    supportUrl: `${baseUrl}/help/support`,
    upgradeUrl: `${baseUrl}/admin/org/${user.organizationId}/billing-plans`,
    extendTrialUrl: `${baseUrl}/onboarding/step-install`,
    contactUrl: `${baseUrl}/help/contact`,
    ...(stats && {
      totalMessages: String(stats.totalMessages || 0),
      resolutionRate: String(stats.resolutionRate || 0),
      avgResponseTime: String(stats.avgResponseTime || 0),
      savedHours: String(stats.savedHours || 0),
      satisfactionScore: stats.satisfactionScore || '0/5.0',
    }),
  };

  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value));
  });

  return result;
}

// メイン処理
async function processEmailDrip(): Promise<{
  success: boolean;
  processed: number;
  errors: number;
  details: Array<{ email: string; day: number; status: string; error?: string }>;
}> {
  let processed = 0;
  let errors = 0;
  const details: Array<{ email: string; day: number; status: string; error?: string }> = [];

  try {
    // トライアルユーザー取得
    const trialUsers = await getTrialUsers();
    console.log(`Found ${trialUsers.length} trial users to process`);

    // 各ユーザーに対してメール送信判定
    for (const user of trialUsers) {
      try {
        const template = getEmailTemplate(user.daysInTrial);

        if (!template) {
          // このユーザーは今日メール送信対象ではない
          details.push({
            email: user.email,
            day: user.daysInTrial,
            status: 'skipped',
          });
          continue;
        }

        // 使用量統計取得
        const stats = await getUsageStats(user.organizationId);

        // テンプレート変数置換
        const subject = replaceTemplateVariables(template.subject, user, stats);
        const htmlContent = replaceTemplateVariables(template.htmlContent, user, stats);
        const textContent = replaceTemplateVariables(template.textContent, user, stats);

        // メール送信
        const result = await sendEmail(user.email, subject, htmlContent, textContent);

        if (result.success) {
          processed++;
          details.push({
            email: user.email,
            day: user.daysInTrial,
            status: 'sent',
          });
          console.log(`✅ Successfully sent Day-${user.daysInTrial} email to ${user.email}`);
        } else {
          errors++;
          details.push({
            email: user.email,
            day: user.daysInTrial,
            status: 'failed',
            error: result.error,
          });
          console.error(`❌ Failed to send email to ${user.email}: ${result.error}`);
        }
      } catch (error) {
        errors++;
        details.push({
          email: user.email,
          day: user.daysInTrial,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        console.error(`❌ Exception processing user ${user.email}:`, error);
      }
    }

    console.log(`Email drip processing complete: ${processed} sent, ${errors} errors`);

    return {
      success: true,
      processed,
      errors,
      details,
    };
  } catch (error) {
    console.error('Failed to process email drip:', error);
    return {
      success: false,
      processed,
      errors: errors + 1,
      details,
    };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Cron認証チェック
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  const token = authHeader.split(' ')[1];
  if (!verifyCronToken(token)) {
    return res.status(403).json({ error: 'Invalid cron token' });
  }

  const startTime = Date.now();

  try {
    if (req.method === 'POST') {
      console.log('📧 Starting email drip campaign processing...');

      const result = await processEmailDrip();
      const processingTime = Date.now() - startTime;

      const response = {
        ...result,
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString(),
      };

      console.log(`✅ Email drip processing completed in ${processingTime}ms`);

      return res.status(200).json(response);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    const processingTime = Date.now() - startTime;

    console.error('Email drip cron job failed:', error);

    return res.status(500).json({
      success: false,
      error: 'Email drip cron job execution failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      processingTimeMs: processingTime,
      timestamp: new Date().toISOString(),
    });
  }
}
