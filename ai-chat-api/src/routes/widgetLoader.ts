import { Router, Request, Response } from 'express';

const router = Router();

// Serve the widget loader JavaScript
router.get(
  '/:widgetKey(.v:version)?.js',
  async (req: Request, res: Response) => {
    try {
      const { widgetKey, version } = req.params;

      // Extract just the widget key (remove .v1 or similar version suffix)
      const cleanWidgetKey = widgetKey.replace(/\.v\d+$/, '');

      // Generate the widget loader script
      const loaderScript = generateLoaderScript(
        cleanWidgetKey,
        version || 'v1'
      );

      // Set appropriate headers for caching
      res.set({
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year cache
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      });

      res.send(loaderScript);
    } catch (error) {
      console.error('Widget loader error:', error);
      res.status(500).send('// Error loading widget');
    }
  }
);

function generateLoaderScript(widgetKey: string, version: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  // Minified widget loader script
  return `
(function() {
  'use strict';
  
  // Prevent multiple widgets from loading
  if (window.aiChatWidgetLoaded) return;
  window.aiChatWidgetLoaded = true;
  
  const WIDGET_KEY = '${widgetKey}';
  const API_URL = '${apiUrl}';
  const WIDGET_URL = '${frontendUrl}/chat-widget';
  
  // Create widget container
  function createWidget() {
    // Check if widget config is valid
    fetch(API_URL + '/api/widgets/' + WIDGET_KEY)
      .then(res => res.json())
      .then(config => {
        if (!config.isActive) {
          console.warn('AI Chat Widget is inactive');
          return;
        }
        
        // Create iframe container
        const container = document.createElement('div');
        container.id = 'ai-chat-widget-container';
        container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;width:350px;height:500px;';
        
        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.src = WIDGET_URL + '?widgetKey=' + WIDGET_KEY;
        iframe.style.cssText = 'width:100%;height:100%;border:none;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.15);';
        iframe.title = 'AI Chat Widget';
        
        container.appendChild(iframe);
        document.body.appendChild(container);
        
        // Handle iframe messages
        window.addEventListener('message', function(event) {
          if (event.origin !== '${frontendUrl}') return;
          
          if (event.data.type === 'RESIZE_WIDGET') {
            container.style.height = event.data.height + 'px';
          } else if (event.data.type === 'CLOSE_WIDGET') {
            container.style.display = 'none';
          } else if (event.data.type === 'OPEN_WIDGET') {
            container.style.display = 'block';
          }
        });
      })
      .catch(err => {
        console.error('Failed to load AI Chat Widget:', err);
      });
  }
  
  // Load widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();`.trim();
}

export { router as widgetLoaderRoutes };
