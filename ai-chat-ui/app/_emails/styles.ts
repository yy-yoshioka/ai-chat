/**
 * 共通スタイルを集約。テンプレート側はインライン style に展開して使う
 */
export const emailStyles = {
  container: `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Hiragino Sans',
        'Hiragino Kaku Gothic Pro', sans-serif;
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
  buttonBase: `
      display: inline-block;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      text-align: center;
      transition: all 0.3s ease;
      margin: 5px;
    `,
  buttonColor: {
    primary: `background: #4caf50; color: #fff;`,
    secondary: `background: #666; color: #fff;`,
    warning: `background: #ff9800; color: #fff;`,
  },
};
