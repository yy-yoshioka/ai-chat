import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A badge component for displaying status, labels, or counts.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'Visual style variant of the badge',
    },
    children: {
      control: { type: 'text' },
      description: 'Badge content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All badge variants displayed together',
      },
    },
  },
};

export const StatusBadges: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Badge variant="default">Active</Badge>
      <Badge variant="secondary">Pending</Badge>
      <Badge variant="destructive">Expired</Badge>
      <Badge variant="outline">Draft</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges used for status indicators',
      },
    },
  },
};

export const CountBadges: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Badge>12</Badge>
      <Badge variant="secondary">99+</Badge>
      <Badge variant="destructive">!</Badge>
      <Badge variant="outline">NEW</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges used for counts and notifications',
      },
    },
  },
};

export const InlineUsage: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <p className="text-sm">
        This feature is <Badge variant="default">Premium</Badge> only
      </p>
      <p className="text-sm">
        Status: <Badge variant="secondary">In Progress</Badge> - Expected completion in 2 days
      </p>
      <p className="text-sm">
        <Badge variant="destructive">Critical</Badge> Security update required
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges used inline with text',
      },
    },
  },
};

export const SizesExample: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Badge className="text-xs px-2 py-0.5">Extra Small</Badge>
      <Badge>Default Size</Badge>
      <Badge className="text-sm px-3 py-1">Large</Badge>
      <Badge className="text-base px-4 py-1.5">Extra Large</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different badge sizes using custom classes',
      },
    },
  },
};
