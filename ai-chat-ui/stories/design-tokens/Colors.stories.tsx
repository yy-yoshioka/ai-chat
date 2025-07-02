import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design Tokens/Colors',
  parameters: {
    docs: {
      description: {
        component: 'Color palette used throughout the application',
      },
    },
  },
};

export default meta;

const ColorSwatch = ({
  name,
  value,
  description,
}: {
  name: string;
  value: string;
  description?: string;
}) => (
  <div className="flex items-center gap-4 p-4 border rounded-lg">
    <div className="w-16 h-16 rounded-lg border shadow-sm" style={{ backgroundColor: value }} />
    <div>
      <h3 className="font-semibold text-lg">{name}</h3>
      <p className="text-gray-600 font-mono text-sm">{value}</p>
      {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
    </div>
  </div>
);

export const Primary: StoryObj = {
  render: () => (
    <div className="grid gap-4">
      <ColorSwatch
        name="Primary"
        value="#007bff"
        description="Main brand color used for primary actions"
      />
      <ColorSwatch
        name="Primary Hover"
        value="#0056b3"
        description="Darker shade for hover states"
      />
      <ColorSwatch name="Primary Light" value="#b3d7ff" description="Light shade for backgrounds" />
    </div>
  ),
};

export const Semantic: StoryObj = {
  render: () => (
    <div className="grid gap-4">
      <ColorSwatch
        name="Success"
        value="#28a745"
        description="Used for success states and positive actions"
      />
      <ColorSwatch
        name="Warning"
        value="#ffc107"
        description="Used for warning states and cautionary actions"
      />
      <ColorSwatch
        name="Danger"
        value="#dc3545"
        description="Used for error states and destructive actions"
      />
      <ColorSwatch name="Info" value="#17a2b8" description="Used for informational content" />
    </div>
  ),
};

export const Grayscale: StoryObj = {
  render: () => (
    <div className="grid gap-4">
      <ColorSwatch name="Gray 900" value="#212529" description="Primary text color" />
      <ColorSwatch name="Gray 700" value="#495057" description="Secondary text color" />
      <ColorSwatch name="Gray 500" value="#6c757d" description="Muted text color" />
      <ColorSwatch name="Gray 300" value="#dee2e6" description="Border color" />
      <ColorSwatch name="Gray 100" value="#f8f9fa" description="Background color" />
      <ColorSwatch name="White" value="#ffffff" description="Primary background" />
    </div>
  ),
};
