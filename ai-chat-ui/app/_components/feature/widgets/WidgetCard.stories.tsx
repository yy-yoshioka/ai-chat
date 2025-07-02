import type { Meta, StoryObj } from '@storybook/nextjs';
import { action } from '@storybook/addon-actions';
import { WidgetCard } from './WidgetCard';

const meta: Meta<typeof WidgetCard> = {
  title: 'Features/Widgets/WidgetCard',
  component: WidgetCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A card component for displaying widget information with management actions.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleWidget = {
  id: 'widget-1',
  name: 'Customer Support Widget',
  embedKey: 'wdg_abc123xyz',
  isActive: true,
  theme: {
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    backgroundColor: '#ffffff',
    textColor: '#212529',
    position: 'bottom-right' as const,
    borderRadius: 8,
    fontFamily: 'Inter, sans-serif',
  },
  script: '<script src="https://widget.ai-chat.com/widget.js" data-key="wdg_abc123xyz"></script>',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const Active: Story = {
  args: {
    widget: sampleWidget,
    orgId: 'org-123',
    onToggleActive: action('toggle-active'),
    onDelete: action('delete'),
    onCopyEmbedCode: action('copy-embed-code'),
  },
};

export const Inactive: Story = {
  args: {
    widget: {
      ...sampleWidget,
      isActive: false,
    },
    orgId: 'org-123',
    onToggleActive: action('toggle-active'),
    onDelete: action('delete'),
    onCopyEmbedCode: action('copy-embed-code'),
  },
};

export const CustomTheme: Story = {
  args: {
    widget: {
      ...sampleWidget,
      name: 'Sales Chat Widget',
      embedKey: 'wdg_sales789',
      theme: {
        ...sampleWidget.theme,
        primaryColor: '#28a745',
        position: 'bottom-left' as const,
        borderRadius: 16,
      },
    },
    orgId: 'org-123',
    onToggleActive: action('toggle-active'),
    onDelete: action('delete'),
    onCopyEmbedCode: action('copy-embed-code'),
  },
};

export const LongEmbedCode: Story = {
  args: {
    widget: {
      ...sampleWidget,
      script: `<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://widget.ai-chat.com/widget.js';
    script.setAttribute('data-key', 'wdg_abc123xyz');
    script.setAttribute('data-position', 'bottom-right');
    script.setAttribute('data-theme', 'light');
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`,
    },
    orgId: 'org-123',
    onToggleActive: action('toggle-active'),
    onDelete: action('delete'),
    onCopyEmbedCode: action('copy-embed-code'),
  },
};

export const MultipleWidgets: Story = {
  render: () => (
    <div className="space-y-4">
      <WidgetCard
        widget={sampleWidget}
        orgId="org-123"
        onToggleActive={action('toggle-active-1')}
        onDelete={action('delete-1')}
        onCopyEmbedCode={action('copy-embed-code-1')}
      />
      <WidgetCard
        widget={{
          ...sampleWidget,
          id: 'widget-2',
          name: 'Help Center Widget',
          embedKey: 'wdg_help456',
          isActive: false,
          theme: {
            ...sampleWidget.theme,
            primaryColor: '#dc3545',
            position: 'top-right' as const,
          },
        }}
        orgId="org-123"
        onToggleActive={action('toggle-active-2')}
        onDelete={action('delete-2')}
        onCopyEmbedCode={action('copy-embed-code-2')}
      />
      <WidgetCard
        widget={{
          ...sampleWidget,
          id: 'widget-3',
          name: 'FAQ Bot',
          embedKey: 'wdg_faq789',
          theme: {
            ...sampleWidget.theme,
            primaryColor: '#ffc107',
            borderRadius: 24,
          },
        }}
        orgId="org-123"
        onToggleActive={action('toggle-active-3')}
        onDelete={action('delete-3')}
        onCopyEmbedCode={action('copy-embed-code-3')}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple widget cards displayed in a list',
      },
    },
  },
};

export const InteractiveExample: Story = {
  render: function Render() {
    const [widget, setWidget] = React.useState(sampleWidget);

    const handleToggleActive = () => {
      setWidget((prev) => ({ ...prev, isActive: !prev.isActive }));
      action('toggle-active')(widget.id);
    };

    const handleCopyEmbedCode = () => {
      navigator.clipboard.writeText(widget.script);
      action('copy-embed-code')(widget);
      alert('埋め込みコードをコピーしました！');
    };

    return (
      <WidgetCard
        widget={widget}
        orgId="org-123"
        onToggleActive={handleToggleActive}
        onDelete={action('delete')}
        onCopyEmbedCode={handleCopyEmbedCode}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive widget card with working toggle and copy functionality',
      },
    },
  },
};
