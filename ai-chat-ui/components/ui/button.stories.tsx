import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants and sizes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'Visual style variant of the button',
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Size of the button',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the button is disabled',
    },
    children: {
      control: { type: 'text' },
      description: 'Button content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'default',
    children: 'Default Button',
    onClick: action('clicked'),
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
    onClick: action('clicked'),
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
    onClick: action('clicked'),
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
    onClick: action('clicked'),
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
    onClick: action('clicked'),
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link Button',
    onClick: action('clicked'),
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
    onClick: action('clicked'),
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
    onClick: action('clicked'),
  },
};

export const Icon: Story = {
  args: {
    size: 'icon',
    children: '🚀',
    onClick: action('clicked'),
  },
};

export const Disabled: Story = {
  args: {
    variant: 'default',
    children: 'Disabled Button',
    disabled: true,
    onClick: action('clicked'),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <Button variant="default" onClick={action('default clicked')}>
          Default
        </Button>
        <Button variant="destructive" onClick={action('destructive clicked')}>
          Destructive
        </Button>
        <Button variant="outline" onClick={action('outline clicked')}>
          Outline
        </Button>
        <Button variant="secondary" onClick={action('secondary clicked')}>
          Secondary
        </Button>
        <Button variant="ghost" onClick={action('ghost clicked')}>
          Ghost
        </Button>
        <Button variant="link" onClick={action('link clicked')}>
          Link
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All button variants displayed together',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Button size="sm" onClick={action('small clicked')}>
        Small
      </Button>
      <Button size="default" onClick={action('default clicked')}>
        Default
      </Button>
      <Button size="lg" onClick={action('large clicked')}>
        Large
      </Button>
      <Button size="icon" onClick={action('icon clicked')}>
        🎯
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different button sizes available',
      },
    },
  },
};
