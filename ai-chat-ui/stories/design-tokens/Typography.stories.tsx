import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design Tokens/Typography',
  parameters: {
    docs: {
      description: {
        component: 'Typography scales and styles used in the application',
      },
    },
  },
};

export default meta;

const TypeSample = ({
  name,
  size,
  weight,
  sample = 'The quick brown fox jumps over the lazy dog',
}: {
  name: string;
  size: string;
  weight?: string;
  sample?: string;
}) => (
  <div className="border-b border-gray-200 pb-4 mb-4">
    <div className="flex items-baseline gap-4 mb-2">
      <h3 className="font-semibold text-gray-700">{name}</h3>
      <span className="text-sm text-gray-500 font-mono">
        {size}
        {weight && ` / ${weight}`}
      </span>
    </div>
    <p style={{ fontSize: size, fontWeight: weight }} className="text-gray-900">
      {sample}
    </p>
  </div>
);

export const TypeScale: StoryObj = {
  render: () => (
    <div className="space-y-2">
      <TypeSample name="Display Large" size="48px" weight="700" sample="Display Text" />
      <TypeSample name="Display" size="32px" weight="700" sample="Display Text" />
      <TypeSample name="Heading 1" size="24px" weight="600" sample="Heading Text" />
      <TypeSample name="Heading 2" size="20px" weight="600" sample="Heading Text" />
      <TypeSample name="Heading 3" size="18px" weight="500" sample="Heading Text" />
      <TypeSample name="Body Large" size="16px" weight="400" />
      <TypeSample name="Body" size="14px" weight="400" />
      <TypeSample name="Caption" size="12px" weight="400" />
    </div>
  ),
};

export const FontWeights: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <TypeSample name="Light" size="16px" weight="300" />
      <TypeSample name="Regular" size="16px" weight="400" />
      <TypeSample name="Medium" size="16px" weight="500" />
      <TypeSample name="Semibold" size="16px" weight="600" />
      <TypeSample name="Bold" size="16px" weight="700" />
    </div>
  ),
};

export const TextStyles: StoryObj = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-700 mb-3">Paragraph</h3>
        <p className="text-base leading-relaxed text-gray-900 max-w-prose">
          This is a paragraph with regular text styling. It demonstrates our standard line height
          and letter spacing for body text. The text is optimized for readability with appropriate
          spacing between lines and comfortable character width.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700 mb-3">Lead Paragraph</h3>
        <p className="text-lg leading-relaxed text-gray-700 max-w-prose">
          This is a lead paragraph with larger text size. It's typically used for introductory
          content or important callouts that need to stand out from regular body text.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700 mb-3">Small Text</h3>
        <p className="text-sm text-gray-600 max-w-prose">
          This is small text used for supporting information, captions, or less important content.
          It maintains readability while taking up less visual space.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700 mb-3">Code</h3>
        <p className="text-base text-gray-900">
          Inline code looks like{' '}
          <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono">
            const example = 'code'
          </code>{' '}
          within text.
        </p>
      </div>
    </div>
  ),
};

export const FontFamily: StoryObj = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-700 mb-3">Primary Font (Inter)</h3>
        <p className="text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
          ABCDEFGHIJKLMNOPQRSTUVWXYZ
          <br />
          abcdefghijklmnopqrstuvwxyz
          <br />
          0123456789 !@#$%^&*()
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700 mb-3">Monospace Font</h3>
        <p className="text-base font-mono">
          ABCDEFGHIJKLMNOPQRSTUVWXYZ
          <br />
          abcdefghijklmnopqrstuvwxyz
          <br />
          0123456789 !@#$%^&*()
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700 mb-3">System Font Stack</h3>
        <p
          className="text-base"
          style={{
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          ABCDEFGHIJKLMNOPQRSTUVWXYZ
          <br />
          abcdefghijklmnopqrstuvwxyz
          <br />
          0123456789 !@#$%^&*()
        </p>
      </div>
    </div>
  ),
};
