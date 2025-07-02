import type { Meta, StoryObj } from '@storybook/react';
import { AdminSidebar } from './AdminSidebar';

const meta: Meta<typeof AdminSidebar> = {
  title: 'Layout/AdminSidebar',
  component: AdminSidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Admin panel sidebar navigation component with user info and navigation links.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex h-screen bg-gray-100">
        <Story />
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Main Content Area</h2>
            <p className="text-gray-600">This is where the page content would go.</p>
          </div>
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleUser = {
  id: '1',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const Default: Story = {
  args: {
    orgId: 'org-123',
    pathname: '/admin/org-123/dashboard',
    user: sampleUser,
  },
};

export const WidgetsActive: Story = {
  args: {
    orgId: 'org-123',
    pathname: '/admin/org-123/widgets',
    user: sampleUser,
  },
};

export const ChatsActive: Story = {
  args: {
    orgId: 'org-123',
    pathname: '/admin/org-123/chats',
    user: sampleUser,
  },
};

export const SettingsActive: Story = {
  args: {
    orgId: 'org-123',
    pathname: '/admin/org-123/settings',
    user: sampleUser,
  },
};

export const WithoutUser: Story = {
  args: {
    orgId: 'org-123',
    pathname: '/admin/org-123/dashboard',
    user: null,
  },
};

export const LongUserName: Story = {
  args: {
    orgId: 'org-123',
    pathname: '/admin/org-123/dashboard',
    user: {
      ...sampleUser,
      name: 'Very Long Admin User Name That Might Overflow',
    },
  },
};

export const AllNavigationStates: Story = {
  render: () => {
    const [activeItem, setActiveItem] = React.useState('/admin/org-123/dashboard');

    return (
      <div className="flex h-screen bg-gray-100">
        <div
          onClick={(e) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');
            if (link && link.href) {
              e.preventDefault();
              const path = new URL(link.href).pathname;
              setActiveItem(path);
            }
          }}
        >
          <AdminSidebar orgId="org-123" pathname={activeItem} user={sampleUser} />
        </div>
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Current Path: {activeItem}</h2>
            <p className="text-gray-600">Click on sidebar items to see active states.</p>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive sidebar showing different active states',
      },
    },
  },
};

export const DifferentOrgIds: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 h-screen">
      <div className="bg-white shadow-lg">
        <AdminSidebar
          orgId="org-001"
          pathname="/admin/org-001/dashboard"
          user={{ ...sampleUser, name: 'Org 1 Admin' }}
        />
      </div>
      <div className="bg-white shadow-lg">
        <AdminSidebar
          orgId="org-002"
          pathname="/admin/org-002/widgets"
          user={{ ...sampleUser, name: 'Org 2 Admin' }}
        />
      </div>
      <div className="bg-white shadow-lg">
        <AdminSidebar
          orgId="org-003"
          pathname="/admin/org-003/settings"
          user={{ ...sampleUser, name: 'Org 3 Admin' }}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple sidebars for different organizations',
      },
    },
  },
};
