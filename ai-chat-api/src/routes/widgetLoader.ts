import { Router, Request, Response } from 'express';

const router = Router();

/**
 *  /widget-loader/<widgetKey>.js
 *  /widget-loader/<widgetKey>.v<version>.js
 *
 *  - 「/widget-loader」は app.ts 側でマウント済みなので **ここには書かない**。
 *  - 正規表現で .js / .v1.js の両方を安全に受け取る。
 */
router.get(
  //           ┌─ [0] = widgetKey           ┐┌─ [1] = version (任意) ┐
  /^\/([^/]+?)(?:\.v(\d+))?\.js$/,
  async (req: Request, res: Response) => {
    try {
      const matches = req.path.match(/^\/([^/]+?)(?:\.v(\d+))?\.js$/);
      if (!matches) {
        return res.status(400).send('// Invalid widget path format');
      }

      const widgetKey = matches[1]; // 例: "test-widget-key-2"
      const version = matches[2] ?? '1'; // 例: "1" / undefined → '1'

      // --- ここで DB に問い合わせてもいいが、まずは 200 を返して動作確認 ---
      const loaderScript = generateLoaderScript(widgetKey, `v${version}`);

      res.set({
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cross-Origin-Resource-Policy': 'cross-origin',
      });

      res.send(loaderScript);
    } catch (error) {
      console.error('Widget loader error:', error);
      res.status(500).send('// Error loading widget');
    }
  }
);

/* ------------------------------------------------------------------ */
/* ↓ 以降は変更なし -------------------------------------------------- */
/* ------------------------------------------------------------------ */

function generateLoaderScript(widgetKey: string, _version: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  return `
(function () {
  'use strict';
  if (window.aiChatWidgetLoaded) return;
  window.aiChatWidgetLoaded = true;

  const WIDGET_KEY = '${widgetKey}';
  const API_URL    = '${apiUrl}';
  const WIDGET_URL = '${frontendUrl}/chat-widget';

  function createWidget() {
    fetch(API_URL + '/api/widgets/' + WIDGET_KEY)
      .then(r => r.json())
      .then(cfg => {
        if (!cfg.isActive) return console.warn('AI Chat Widget is inactive');

        const box = document.createElement('div');
        box.id = 'ai-chat-widget-container';
        box.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;width:350px;height:500px;';

        const iframe = document.createElement('iframe');
        iframe.src = WIDGET_URL + '?widgetKey=' + WIDGET_KEY;
        iframe.style.cssText = 'width:100%;height:100%;border:none;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.15);';
        iframe.title = 'AI Chat Widget';

        box.appendChild(iframe);
        document.body.appendChild(box);

        window.addEventListener('message', e => {
          if (e.origin !== '${frontendUrl}') return;
          if (e.data.type === 'RESIZE_WIDGET') box.style.height = e.data.height + 'px';
          if (e.data.type === 'CLOSE_WIDGET')  box.style.display = 'none';
          if (e.data.type === 'OPEN_WIDGET')   box.style.display = 'block';
        });
      })
      .catch(err => console.error('AI Chat Widget load failed:', err));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();`.trim();
}

export { router as widgetLoaderRoutes };
