// Email template utilities for consistent styling and branding

export interface EmailTemplateData {
  name: string;
  organizationName: string;
  trialEndDate: string;
  setupGuideUrl: string;
  dashboardUrl: string;
  supportUrl: string;
  upgradeUrl: string;
  extendTrialUrl: string;
  contactUrl: string;
  [key: string]: string | number;
}

// Base email styling
export const emailStyles = {
  container: `
    font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
  `,
  header: `
    padding: 40px 20px;
    text-align: center;
    color: white;
    margin: 0;
  `,
  content: `
    padding: 40px 20px;
    background: white;
  `,
  button: `
    display: inline-block;
    padding: 15px 30px;
    text-decoration: none;
    border-radius: 8px;
    font-weight: bold;
    text-align: center;
    transition: all 0.3s ease;
  `,
  primaryButton: `
    background: #4CAF50;
    color: white;
  `,
  secondaryButton: `
    background: #666;
    color: white;
  `,
  warningButton: `
    background: #ff9800;
    color: white;
  `,
};

// Common email components
export const emailComponents = {
  header: (
    title: string,
    subtitle: string,
    gradient: string = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  ) => `
    <div style="background: ${gradient}; ${emailStyles.header}">
      <h1 style="font-size: 28px; margin: 0;">${title}</h1>
      <p style="font-size: 16px; margin: 10px 0 0 0; opacity: 0.9;">${subtitle}</p>
    </div>
  `,

  infoBox: (
    content: string,
    borderColor: string = '#2196F3',
    backgroundColor: string = '#e3f2fd'
  ) => `
    <div style="background: ${backgroundColor}; padding: 20px; border-radius: 8px; border-left: 4px solid ${borderColor}; margin: 20px 0;">
      ${content}
    </div>
  `,

  warningBox: (content: string) => `
    <div style="background: #ffebee; padding: 20px; border-radius: 8px; border-left: 4px solid #f44336; margin: 20px 0;">
      <p style="color: #d32f2f; line-height: 1.6; margin: 0; font-weight: bold;">
        ${content}
      </p>
    </div>
  `,

  statsBox: (stats: Array<{ label: string; value: string; color?: string }>) => {
    const statItems = stats
      .map(
        (stat) => `
      <div style="flex: 1; min-width: 120px; text-align: center; background: white; padding: 15px; border-radius: 8px;">
        <div style="font-size: 24px; font-weight: bold; color: ${stat.color || '#4CAF50'};">${stat.value}</div>
        <div style="color: #666; font-size: 14px;">${stat.label}</div>
      </div>
    `
      )
      .join('');

    return `
      <div style="display: flex; flex-wrap: wrap; gap: 15px; margin: 20px 0;">
        ${statItems}
      </div>
    `;
  },

  buttonGroup: (
    buttons: Array<{ text: string; url: string; style?: 'primary' | 'secondary' | 'warning' }>
  ) => {
    const buttonItems = buttons
      .map((button) => {
        const buttonStyle =
          button.style === 'warning'
            ? emailStyles.warningButton
            : button.style === 'secondary'
              ? emailStyles.secondaryButton
              : emailStyles.primaryButton;

        return `
        <a href="${button.url}" style="${emailStyles.button} ${buttonStyle} margin: 5px;">
          ${button.text}
        </a>
      `;
      })
      .join('');

    return `
      <div style="text-align: center; margin: 30px 0;">
        ${buttonItems}
      </div>
    `;
  },

  footer: () => `
    <div style="padding: 20px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee;">
      <p style="margin: 0 0 10px 0;">
        このメールは AIチャット のトライアルユーザーに送信されています。
      </p>
      <p style="margin: 0;">
        配信停止をご希望の場合は <a href="{{unsubscribeUrl}}" style="color: #666;">こちら</a> からお手続きください。
      </p>
    </div>
  `,
};

// Email template replacer utility
export function replaceEmailVariables(template: string, data: EmailTemplateData): string {
  let result = template;

  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value));
  });

  return result;
}

// Generate base URLs for email links
export function generateEmailUrls(organizationId: string): Partial<EmailTemplateData> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    setupGuideUrl: `${baseUrl}/onboarding/step-install`,
    dashboardUrl: `${baseUrl}/admin/org/${organizationId}`,
    supportUrl: `${baseUrl}/help/support`,
    upgradeUrl: `${baseUrl}/admin/org/${organizationId}/billing-plans`,
    extendTrialUrl: `${baseUrl}/onboarding/step-install`,
    contactUrl: `${baseUrl}/help/contact`,
  };
}

// Predefined email templates using the components
export const emailTemplates = {
  welcome: {
    subject: '🎉 AIチャットの無料トライアル開始！設定ガイドをご確認ください',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getHtml: (data: EmailTemplateData) => `
      <div style="${emailStyles.container}">
        ${emailComponents.header(
          'AIチャット 無料トライアル開始！',
          '14日間、すべての機能をお試しください'
        )}
        
        <div style="${emailStyles.content}">
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

          ${emailComponents.buttonGroup([
            { text: '設定ガイドを見る', url: '{{setupGuideUrl}}', style: 'primary' },
          ])}

          ${emailComponents.infoBox(`
            <p style="margin: 0; color: #1976D2;">
              <strong>💡 ヒント:</strong> ご不明な点がございましたら、チャット右下のサポートボタンからお気軽にお問い合わせください。
            </p>
          `)}
        </div>
        
        ${emailComponents.footer()}
      </div>
    `,
  },

  reminder: {
    subject: '🚨 【緊急】トライアル残り2日｜継続手続きをお忘れなく',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getHtml: (data: EmailTemplateData) => `
      <div style="${emailStyles.container}">
        ${emailComponents.header(
          '🚨 トライアル終了まで残り2日',
          '継続手続きをお忘れなく',
          'linear-gradient(135deg, #ff4757 0%, #ff3838 100%)'
        )}
        
        <div style="${emailStyles.content}">
          <h2 style="color: #333; font-size: 20px; margin-bottom: 20px;">{{name}}さん、継続のご検討をお願いします</h2>
          
          ${emailComponents.warningBox(`
            ⚠️ {{organizationName}}のトライアル期間は<span style="font-size: 18px;">{{trialEndDate}}</span>に終了します。<br>
            継続をご希望の場合は、今すぐプランをお選びください。
          `)}

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">📈 トライアル期間の成果</h3>
            ${emailComponents.statsBox([
              { label: '処理したチャット', value: '{{totalMessages}}', color: '#4CAF50' },
              { label: '節約した時間', value: '{{savedHours}}', color: '#2196F3' },
              { label: '顧客満足度', value: '{{satisfactionScore}}', color: '#ff9800' },
            ])}
          </div>

          ${emailComponents.infoBox(
            `
            <h3 style="color: #2e7d32; margin: 0 0 15px 0; font-size: 18px;">💝 特別オファー</h3>
            <p style="color: #666; line-height: 1.6; margin: 0;">
              今なら<strong>初月50%オフ</strong>でProプランをご利用いただけます！<br>
              月額2,980円→<span style="color: #f44336; font-weight: bold; font-size: 18px;">1,490円</span>（初月のみ）
            </p>
          `,
            '#4CAF50',
            '#e8f5e8'
          )}

          ${emailComponents.buttonGroup([
            { text: '今すぐ継続する（50%オフ）', url: '{{upgradeUrl}}', style: 'primary' },
          ])}

          <div style="text-align: center;">
            <a href="{{contactUrl}}" style="color: #666; text-decoration: underline; font-size: 14px;">
              ご相談・ご質問はこちら
            </a>
          </div>

          ${emailComponents.infoBox(
            `
            <p style="margin: 0; color: #e65100; font-size: 14px;">
              <strong>⏰ 注意:</strong> トライアル終了後、データは30日間保持されますが、新しいチャットを受け付けることができなくなります。
            </p>
          `,
            '#ff9800',
            '#fff3e0'
          )}
        </div>
        
        ${emailComponents.footer()}
      </div>
    `,
  },
};

// Email template validator
export function validateEmailTemplate(template: string, requiredVariables: string[]): boolean {
  return requiredVariables.every((variable) => template.includes(`{{${variable}}}`));
}
