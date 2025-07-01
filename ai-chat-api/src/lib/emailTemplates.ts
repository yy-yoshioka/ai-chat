export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface OnboardingData {
  firstName: string;
  company: string;
  email: string;
  setupUrl: string;
  dashboardUrl: string;
  supportUrl: string;
}

// Day 1: ウェルカムメール
export function getWelcomeEmailTemplate(data: OnboardingData): EmailTemplate {
  return {
    subject: `🎉 ${data.firstName}さん、AI Chatへようこそ！セットアップを完了しましょう`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AI Chat へようこそ</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .feature { margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #2563eb; }
    .footer { background: #f8fafc; padding: 30px; text-align: center; color: #666; font-size: 14px; }
    .checklist { background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .checkitem { margin: 10px 0; }
    .checkitem::before { content: "✅ "; color: #10b981; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 AI Chat へようこそ！</h1>
      <p>こんにちは ${data.firstName}さん！${data.company} でのカスタマーサポート革新の第一歩です。</p>
    </div>
    
    <div class="content">
      <h2>🚀 たった5分でセットアップ完了</h2>
      <p>AI Chat を始めるのは驚くほど簡単です。以下のステップに従って、今すぐ顧客サポートを向上させましょう！</p>
      
      <div class="checklist">
        <h3>📋 セットアップチェックリスト</h3>
        <div class="checkitem">アカウント作成（完了！）</div>
        <div class="checkitem">ウィジェットのカスタマイズ</div>
        <div class="checkitem">ウェブサイトにコード追加</div>
        <div class="checkitem">最初のテストメッセージ</div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.setupUrl}" class="button">🔧 今すぐセットアップを開始</a>
      </div>
      
      <div class="feature">
        <h3>💡 セットアップのポイント</h3>
        <ul>
          <li><strong>1-2分:</strong> ウィジェットの色・位置をカスタマイズ</li>
          <li><strong>1-2分:</strong> 1行のJavaScriptコードをサイトに追加</li>
          <li><strong>1分:</strong> テストメッセージで動作確認</li>
        </ul>
        <p>技術的な知識は一切不要です！</p>
      </div>
      
      <h2>🎯 導入後に期待できる効果</h2>
      <div style="display: flex; justify-content: space-between; text-align: center; margin: 30px 0;">
        <div style="flex: 1; margin: 0 10px;">
          <div style="font-size: 32px; color: #10b981; font-weight: bold;">92%</div>
          <div style="color: #666;">顧客満足度向上</div>
        </div>
        <div style="flex: 1; margin: 0 10px;">
          <div style="font-size: 32px; color: #10b981; font-weight: bold;">80%</div>
          <div style="color: #666;">対応時間短縮</div>
        </div>
        <div style="flex: 1; margin: 0 10px;">
          <div style="font-size: 32px; color: #10b981; font-weight: bold;">3.2倍</div>
          <div style="color: #666;">コンバージョン率向上</div>
        </div>
      </div>
      
      <h2>📞 サポートチームがお手伝いします</h2>
      <p>何か質問がございましたら、いつでもお気軽にお声がけください。私たちのサポートチームが24時間以内にご回答いたします。</p>
      
      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p><strong>💬 チャットサポート:</strong> ダッシュボード右下のチャットアイコン</p>
        <p><strong>📧 メールサポート:</strong> <a href="mailto:support@aichat.com">support@aichat.com</a></p>
        <p><strong>📚 ヘルプセンター:</strong> <a href="${data.supportUrl}">詳細ガイド・FAQ</a></p>
      </div>
    </div>
    
    <div class="footer">
      <p>今後数日間、セットアップのコツや成功事例をお送りします。</p>
      <p>AI Chat で素晴らしいカスタマーエクスペリエンスを実現しましょう！</p>
      <p><a href="${data.dashboardUrl}">ダッシュボードにアクセス</a> | <a href="${data.supportUrl}">ヘルプセンター</a></p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
${data.firstName}さん、AI Chat へようこそ！

こんにちは！${data.company} でのカスタマーサポート革新の第一歩です。

🚀 たった5分でセットアップ完了

セットアップチェックリスト:
✅ アカウント作成（完了！）
✅ ウィジェットのカスタマイズ
✅ ウェブサイトにコード追加  
✅ 最初のテストメッセージ

今すぐセットアップを開始: ${data.setupUrl}

💡 セットアップのポイント:
• 1-2分: ウィジェットの色・位置をカスタマイズ
• 1-2分: 1行のJavaScriptコードをサイトに追加
• 1分: テストメッセージで動作確認

技術的な知識は一切不要です！

🎯 導入後に期待できる効果:
• 92% 顧客満足度向上
• 80% 対応時間短縮
• 3.2倍 コンバージョン率向上

📞 サポート:
💬 チャットサポート: ダッシュボード右下
📧 メール: support@aichat.com
📚 ヘルプセンター: ${data.supportUrl}

AI Chat チーム
    `,
  };
}

// Day 3: 活用ガイドメール
export function getUsageGuideEmailTemplate(
  data: OnboardingData
): EmailTemplate {
  return {
    subject: `🎯 ${data.firstName}さん、AI Chatの効果を最大化する3つのコツ`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AI Chat 活用ガイド</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .tip { margin: 30px 0; padding: 25px; background: #f0fdf4; border-radius: 12px; border-left: 4px solid #10b981; }
    .tip-number { background: #10b981; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; }
    .stats { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
    .footer { background: #f8fafc; padding: 30px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 AI Chat 活用ガイド</h1>
      <p>${data.firstName}さん、セットアップはいかがでしたか？</p>
      <p>今日は効果を最大化する3つのコツをお伝えします！</p>
    </div>
    
    <div class="content">
      <div class="stats">
        <h3>📊 ${data.company} の現在の状況</h3>
        <p>ダッシュボードで詳細な分析をご確認いただけます</p>
        <a href="${data.dashboardUrl}" class="button">📈 分析を確認する</a>
      </div>
      
      <h2>🚀 効果を最大化する3つのコツ</h2>
      
      <div class="tip">
        <div style="display: flex; align-items: flex-start;">
          <span class="tip-number">1</span>
          <div>
            <h3>🎨 ブランドに合わせてカスタマイズ</h3>
            <p>ウィジェットの色・位置・挨拶メッセージを御社のブランドに合わせることで、より自然な顧客体験を提供できます。</p>
            <ul>
              <li><strong>色の変更:</strong> ブランドカラーに統一</li>
              <li><strong>位置の調整:</strong> 右下・左下・中央から選択</li>
              <li><strong>挨拶文:</strong> 「こんにちは！何かお手伝いできることはありますか？」</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="tip">
        <div style="display: flex; align-items: flex-start;">
          <span class="tip-number">2</span>
          <div>
            <h3>💡 よくある質問を事前設定</h3>
            <p>御社特有のFAQを設定することで、AI の回答精度が格段に向上します。</p>
            <ul>
              <li><strong>商品・サービス情報</strong></li>
              <li><strong>料金・プラン詳細</strong></li>
              <li><strong>サポート営業時間</strong></li>
              <li><strong>お問い合わせ先</strong></li>
            </ul>
            <p>設定は管理画面の「ナレッジベース」から簡単に行えます。</p>
          </div>
        </div>
      </div>
      
      <div class="tip">
        <div style="display: flex; align-items: flex-start;">
          <span class="tip-number">3</span>
          <div>
            <h3>📊 定期的な分析・改善</h3>
            <p>週1回の簡単な振り返りで、継続的に効果を向上させましょう。</p>
            <ul>
              <li><strong>よくある質問:</strong> 回答できなかった質問をチェック</li>
              <li><strong>顧客満足度:</strong> 評価の低い会話を分析</li>
              <li><strong>コンバージョン:</strong> 購入・申込みにつながった経路を確認</li>
            </ul>
          </div>
        </div>
      </div>
      
      <h2>🏆 成功事例: EC企業A社の場合</h2>
      <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3>導入3日後の効果</h3>
        <div style="display: flex; justify-content: space-between; text-align: center; margin: 20px 0;">
          <div style="flex: 1;">
            <div style="font-size: 24px; color: #0ea5e9; font-weight: bold;">+47%</div>
            <div>問い合わせ増加</div>
          </div>
          <div style="flex: 1;">
            <div style="font-size: 24px; color: #0ea5e9; font-weight: bold;">-65%</div>
            <div>対応時間短縮</div>
          </div>
          <div style="flex: 1;">
            <div style="font-size: 24px; color: #0ea5e9; font-weight: bold;">+23%</div>
            <div>売上向上</div>
          </div>
        </div>
        <p><em>「深夜の問い合わせにも即座に対応できるようになり、機会損失が大幅に減少しました」</em></p>
      </div>
      
      <h2>🤝 専任サポートをご活用ください</h2>
      <p>設定でお困りのことがございましたら、遠慮なくお声がけください。御社専任のカスタマーサクセス担当がサポートいたします。</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.supportUrl}" class="button">💬 サポートに相談する</a>
      </div>
    </div>
    
    <div class="footer">
      <p>明日は他社の成功事例と具体的な ROI 計算方法をお送りします。</p>
      <p><a href="${data.dashboardUrl}">ダッシュボードにアクセス</a> | <a href="${data.supportUrl}">ヘルプセンター</a></p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
${data.firstName}さん、AI Chat 活用ガイド

セットアップはいかがでしたか？
今日は効果を最大化する3つのコツをお伝えします！

📊 ${data.company} の現在の状況
ダッシュボードで詳細な分析をご確認いただけます
分析確認: ${data.dashboardUrl}

🚀 効果を最大化する3つのコツ

1. 🎨 ブランドに合わせてカスタマイズ
• 色の変更: ブランドカラーに統一
• 位置の調整: 右下・左下・中央から選択
• 挨拶文: 自然な顧客体験を提供

2. 💡 よくある質問を事前設定
• 商品・サービス情報
• 料金・プラン詳細
• サポート営業時間
• お問い合わせ先

3. 📊 定期的な分析・改善
• よくある質問: 回答できなかった質問をチェック
• 顧客満足度: 評価の低い会話を分析
• コンバージョン: 購入・申込みにつながった経路を確認

🏆 成功事例: EC企業A社
導入3日後の効果:
• +47% 問い合わせ増加
• -65% 対応時間短縮
• +23% 売上向上

🤝 専任サポート: ${data.supportUrl}

AI Chat チーム
    `,
  };
}

// Day 7: 成功事例・ROI計算メール
export function getSuccessStoriesEmailTemplate(
  data: OnboardingData
): EmailTemplate {
  return {
    subject: `📈 ${data.firstName}さん、AI Chatで${data.company}のROIを計算してみませんか？`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AI Chat 成功事例 & ROI 計算</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .case-study { margin: 30px 0; padding: 25px; background: #faf5ff; border-radius: 12px; border-left: 4px solid #7c3aed; }
    .roi-calculator { background: #f0fdf4; border: 1px solid #10b981; border-radius: 12px; padding: 25px; margin: 30px 0; }
    .metrics { display: flex; justify-content: space-between; text-align: center; margin: 20px 0; }
    .metric { flex: 1; margin: 0 10px; }
    .metric-value { font-size: 28px; color: #7c3aed; font-weight: bold; }
    .footer { background: #f8fafc; padding: 30px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📈 1週間後の振り返り</h1>
      <p>${data.firstName}さん、AI Chat をお使いいただき1週間が経ちました！</p>
      <p>今日は成功事例と ROI 計算をご紹介します</p>
    </div>
    
    <div class="content">
      <h2>🏆 他社の驚きの成功事例</h2>
      
      <div class="case-study">
        <h3>💻 SaaS企業 B社（従業員50名）</h3>
        <p><strong>導入背景:</strong> カスタマーサポート担当者2名では問い合わせ対応が追いつかず、顧客満足度が低下</p>
        
        <div class="metrics">
          <div class="metric">
            <div class="metric-value">+250%</div>
            <div>CV率向上</div>
          </div>
          <div class="metric">
            <div class="metric-value">-70%</div>
            <div>CS工数削減</div>
          </div>
          <div class="metric">
            <div class="metric-value">+180%</div>
            <div>月間問い合わせ増</div>
          </div>
        </div>
        
        <p><strong>導入効果:</strong> 技術的な質問にも正確に答えてくれるので、顧客満足度が格段に向上。サポート担当者は高度な問題解決に集中できるようになりました。</p>
        
        <p><strong>具体的改善:</strong></p>
        <ul>
          <li>FAQ対応: 24時間自動化 → 人件費 月額30万円削減</li>
          <li>初回問い合わせ解決率: 45% → 87%</li>
          <li>平均応答時間: 4時間 → 0.3秒</li>
        </ul>
      </div>
      
      <div class="case-study">
        <h3>🏥 医療法人 C社（クリニック5院）</h3>
        <p><strong>導入背景:</strong> 診療時間外の問い合わせ対応ができず、予約機会を逃していた</p>
        
        <div class="metrics">
          <div class="metric">
            <div class="metric-value">+95%</div>
            <div>患者満足度向上</div>
          </div>
          <div class="metric">
            <div class="metric-value">-80%</div>
            <div>問い合わせ処理時間</div>
          </div>
          <div class="metric">
            <div class="metric-value">+42%</div>
            <div>オンライン予約増</div>
          </div>
        </div>
        
        <p><strong>導入効果:</strong> 24時間対応が可能になり、患者様に安心感を提供。診療時間外の予約も大幅に増加しました。</p>
      </div>
      
      <h2>💰 ${data.company} の ROI を計算してみましょう</h2>
      
      <div class="roi-calculator">
        <h3>📊 ROI 計算ツール</h3>
        <p>御社の現在の状況を入力して、AI Chat による費用対効果を確認してみませんか？</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4>💡 計算例（従業員数50名の企業）</h4>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f8fafc;">
              <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>項目</strong></td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>導入前</strong></td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>導入後</strong></td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>効果</strong></td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">月間人件費</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">60万円</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">25万円</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #10b981;"><strong>-35万円</strong></td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">ツール費用</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">8万円</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">2万円</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #10b981;"><strong>-6万円</strong></td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">機会損失</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">15万円</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">3万円</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #10b981;"><strong>-12万円</strong></td>
            </tr>
            <tr style="background: #f0fdf4; font-weight: bold;">
              <td style="padding: 10px; border: 1px solid #e2e8f0;">月間節約額</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">-</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">-</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #10b981;"><strong>53万円</strong></td>
            </tr>
          </table>
          
          <p style="text-align: center; margin: 20px 0; font-size: 18px; color: #10b981; font-weight: bold;">
            年間節約額: 636万円 | ROI: 3,180%
          </p>
        </div>
        
        <div style="text-align: center;">
          <a href="${data.dashboardUrl}/roi-calculator" class="button">🧮 詳細ROI計算をする</a>
        </div>
      </div>
      
      <h2>🚀 次のステップ</h2>
      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3>📈 更なる効果向上のために</h3>
        <ul>
          <li><strong>A/Bテスト:</strong> ウィジェットの位置・色を最適化</li>
          <li><strong>高度な設定:</strong> 業界特化型AIモデルに切り替え</li>
          <li><strong>連携強化:</strong> CRM・ヘルプデスクとの連携設定</li>
          <li><strong>チーム拡張:</strong> 複数部署での活用</li>
        </ul>
      </div>
      
      <h2>💼 エンタープライズプランのご案内</h2>
      <p>より大規模な運用や高度な機能をご希望の場合は、エンタープライズプランをご検討ください：</p>
      <ul>
        <li>🏢 無制限のウィジェット数</li>
        <li>👥 専任カスタマーサクセス担当</li>
        <li>🔒 SSO・SAML対応</li>
        <li>📊 高度な分析・レポート機能</li>
        <li>⚡ 優先サポート（1時間以内対応）</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.supportUrl}/enterprise" class="button">🏢 エンタープライズ相談</a>
      </div>
    </div>
    
    <div class="footer">
      <p>今後も定期的に活用ガイドや成功事例をお送りします。</p>
      <p>AI Chat で、${data.company} のカスタマーサポートを次のレベルへ！</p>
      <p><a href="${data.dashboardUrl}">ダッシュボードにアクセス</a> | <a href="${data.supportUrl}">ヘルプセンター</a></p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
${data.firstName}さん、1週間後の振り返り

AI Chat をお使いいただき1週間が経ちました！
今日は成功事例と ROI 計算をご紹介します

🏆 他社の驚きの成功事例

💻 SaaS企業 B社（従業員50名）
導入効果:
• +250% CV率向上
• -70% CS工数削減  
• +180% 月間問い合わせ増

具体的改善:
• FAQ対応: 24時間自動化 → 人件費 月額30万円削減
• 初回問い合わせ解決率: 45% → 87%
• 平均応答時間: 4時間 → 0.3秒

🏥 医療法人 C社（クリニック5院）
導入効果:
• +95% 患者満足度向上
• -80% 問い合わせ処理時間
• +42% オンライン予約増

💰 ${data.company} の ROI 計算例

計算例（従業員数50名の企業）:
• 月間人件費削減: -35万円
• ツール費用削減: -6万円
• 機会損失削減: -12万円
• 月間節約額: 53万円
• 年間節約額: 636万円
• ROI: 3,180%

詳細ROI計算: ${data.dashboardUrl}/roi-calculator

🚀 次のステップ
• A/Bテスト: ウィジェットの位置・色を最適化
• 高度な設定: 業界特化型AIモデルに切り替え
• 連携強化: CRM・ヘルプデスクとの連携設定
• チーム拡張: 複数部署での活用

💼 エンタープライズプラン:
• 無制限のウィジェット数
• 専任カスタマーサクセス担当
• SSO・SAML対応
• 高度な分析・レポート機能
• 優先サポート（1時間以内対応）

エンタープライズ相談: ${data.supportUrl}/enterprise

AI Chat チーム
    `,
  };
}

// Section-5: Password Reset Template
export const passwordResetTemplate = (resetUrl: string) => ({
  subject: 'パスワードリセットのご案内',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>パスワードリセット</h2>
      <p>パスワードリセットのリクエストを受け付けました。</p>
      <p>以下のボタンをクリックして、新しいパスワードを設定してください：</p>
      <div style="margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          パスワードをリセット
        </a>
      </div>
      <p>このリンクは24時間有効です。</p>
      <p>心当たりがない場合は、このメールを無視してください。</p>
    </div>
  `,
  text: `
    パスワードリセット
    
    パスワードリセットのリクエストを受け付けました。
    以下のURLから新しいパスワードを設定してください：
    
    ${resetUrl}
    
    このリンクは24時間有効です。
    心当たりがない場合は、このメールを無視してください。
  `,
});

// Section-5: Email Verification Template
export const emailVerificationTemplate = (verifyUrl: string) => ({
  subject: 'メールアドレスの確認',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>メールアドレスの確認</h2>
      <p>ご登録ありがとうございます。</p>
      <p>以下のボタンをクリックして、メールアドレスを確認してください：</p>
      <div style="margin: 30px 0;">
        <a href="${verifyUrl}" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          メールアドレスを確認
        </a>
      </div>
      <p>このリンクは72時間有効です。</p>
    </div>
  `,
  text: `
    メールアドレスの確認
    
    ご登録ありがとうございます。
    以下のURLからメールアドレスを確認してください：
    
    ${verifyUrl}
    
    このリンクは72時間有効です。
  `,
});
