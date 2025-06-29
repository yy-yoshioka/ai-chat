import { emailStyles } from '../styles';
import { header, buttonGroup, footer } from '../components';
import { replaceEmailVariables } from '../replaceVars';

export interface WelcomeData {
  name: string;
  organizationName: string;
  trialEndDate: string;
  setupGuideUrl: string;
  unsubscribeUrl: string;
}

export const welcomeTemplate = {
  subject: '🎉 AIチャットの無料トライアル開始！',
  required: [
    'name',
    'organizationName',
    'trialEndDate',
    'setupGuideUrl',
    'unsubscribeUrl',
  ] as const,

  getHtml: (raw: WelcomeData) => {
    const html = `
      <div style="${emailStyles.container}">
        ${header('AIチャット 無料トライアル開始！', '14日間、すべての機能をお試しください')}
        <div style="${emailStyles.content}">
          <h2 style="color:#333;font-size:20px;margin-bottom:20px;">{{name}} さん、ようこそ！</h2>

          <p style="color:#666;line-height:1.6;margin-bottom:20px;">
            {{organizationName}} のトライアルは <strong>{{trialEndDate}}</strong> まで有効です。
          </p>

          ${buttonGroup([{ text: '設定ガイドを見る', url: '{{setupGuideUrl}}', style: 'primary' }])}
        </div>
        ${footer()}
      </div>
    `;
    return replaceEmailVariables(html, raw);
  },
};
