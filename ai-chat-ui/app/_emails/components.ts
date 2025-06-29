import { emailStyles } from './styles';

/** セクション見出し付きヘッダー */
export const header = (
  title: string,
  subtitle: string,
  gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
) => `
  <div style="background:${gradient};${emailStyles.header}">
    <h1 style="font-size:28px;margin:0;">${title}</h1>
    <p style="font-size:16px;margin:10px 0 0 0;opacity:0.9;">${subtitle}</p>
  </div>
`;

/** 🚧 情報 or 警告ボックス */
export const infoBox = (html: string, border = '#2196f3', bg = '#e3f2fd') => `
  <div style="background:${bg};padding:20px;border-radius:8px;border-left:4px solid ${border};margin:20px 0;">
    ${html}
  </div>
`;

/** 強調警告 */
export const warningBox = (html: string) => `
  <div style="background:#ffebee;padding:20px;border-radius:8px;border-left:4px solid #f44336;margin:20px 0;">
    <p style="color:#d32f2f;line-height:1.6;margin:0;font-weight:bold;">${html}</p>
  </div>
`;

/** 指標3件までを横並び表示 */
export const statsBox = (stats: Array<{ label: string; value: string; color?: string }>) => {
  const items = stats
    .map(
      (s) => `
      <div style="flex:1;min-width:120px;text-align:center;background:#fff;padding:15px;border-radius:8px;">
        <div style="font-size:24px;font-weight:bold;color:${s.color ?? '#4caf50'};">${s.value}</div>
        <div style="color:#666;font-size:14px;">${s.label}</div>
      </div>`
    )
    .join('');
  return `<div style="display:flex;flex-wrap:wrap;gap:15px;margin:20px 0;">${items}</div>`;
};

/** ボタン群 */
export const buttonGroup = (
  list: Array<{ text: string; url: string; style?: 'primary' | 'secondary' | 'warning' }>
) =>
  `
  <div style="text-align:center;margin:30px 0;">
    ${list
      .map(
        (btn) => `
      <a href="${btn.url}" style="${emailStyles.buttonBase}${
        emailStyles.buttonColor[btn.style ?? 'primary']
      }">${btn.text}</a>`
      )
      .join('')}
  </div>
`;

/** フッター（定型） */
export const footer = () => `
  <div style="padding:20px;text-align:center;color:#666;font-size:14px;border-top:1px solid #eee;">
    <p style="margin:0 0 10px 0;">このメールは AIチャット・トライアルユーザーに送信されています。</p>
    <p style="margin:0;">配信停止は <a href="{{unsubscribeUrl}}" style="color:#666;">こちら</a></p>
  </div>
`;
