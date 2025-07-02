import { addons } from '@storybook/addons';
import { themes } from '@storybook/theming';

addons.setConfig({
  theme: {
    ...themes.light,
    brandTitle: 'AI Chat UI Components',
    brandUrl: 'https://ai-chat.com',
    brandImage: '/logo.svg',
    colorPrimary: '#007bff',
    colorSecondary: '#6c757d',
  },
});
