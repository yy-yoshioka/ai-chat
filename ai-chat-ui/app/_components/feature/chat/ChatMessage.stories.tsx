import type { Meta, StoryObj } from '@storybook/react';
import ChatMessage from './ChatMessage';

const meta: Meta<typeof ChatMessage> = {
  title: 'Features/Chat/ChatMessage',
  component: ChatMessage,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A chat message component that displays user and assistant messages with avatars and timestamps.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    role: {
      control: { type: 'select' },
      options: ['user', 'assistant'],
      description: 'The role of the message sender',
    },
    content: {
      control: { type: 'text' },
      description: 'The message content',
    },
    timestamp: {
      control: { type: 'date' },
      description: 'The message timestamp',
    },
    user: {
      description: 'User information (for user messages)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleUser = {
  id: '1',
  email: 'john.doe@example.com',
  name: 'John Doe',
  profileImage: null,
  role: 'user' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const sampleUserWithImage = {
  ...sampleUser,
  profileImage: 'https://via.placeholder.com/150',
};

export const UserMessage: Story = {
  args: {
    role: 'user',
    content: 'How do I reset my password?',
    timestamp: new Date(),
    user: sampleUser,
  },
};

export const AssistantMessage: Story = {
  args: {
    role: 'assistant',
    content:
      'To reset your password, go to the login page and click on "Forgot Password". Enter your email address and we\'ll send you instructions to reset your password.',
    timestamp: new Date(),
  },
};

export const UserMessageWithImage: Story = {
  args: {
    role: 'user',
    content: 'Can you help me with the integration?',
    timestamp: new Date(),
    user: sampleUserWithImage,
  },
};

export const LongMessage: Story = {
  args: {
    role: 'assistant',
    content: `To reset your password, please follow these detailed steps:

1. Go to the login page by clicking on the "Sign In" button in the top right corner of our website
2. Click on the "Forgot Password?" link below the password field
3. Enter the email address associated with your account
4. Check your email inbox for a password reset link (it might take a few minutes)
5. Click on the reset link in the email
6. Create a new strong password that includes:
   - At least 8 characters
   - A mix of uppercase and lowercase letters
   - At least one number
   - At least one special character
7. Confirm your new password
8. Log in with your new credentials

If you don't receive the email within 10 minutes, please check your spam folder or contact our support team for assistance.`,
    timestamp: new Date(),
  },
};

export const MessageWithCode: Story = {
  args: {
    role: 'assistant',
    content: `You can integrate our widget using this code:

\`\`\`html
<script src="https://widget.ai-chat.com/widget.js"></script>
<script>
  AIChatWidget.init({
    widgetKey: 'your-widget-key',
    theme: 'light'
  })
</script>
\`\`\`

Make sure to replace \`your-widget-key\` with your actual widget key from the dashboard.`,
    timestamp: new Date(),
  },
};

export const ConversationFlow: Story = {
  render: () => (
    <div className="space-y-4">
      <ChatMessage
        role="user"
        content="Hello, I need help with my account"
        timestamp={new Date(Date.now() - 5 * 60 * 1000)}
        user={sampleUser}
      />
      <ChatMessage
        role="assistant"
        content="Hello! I'd be happy to help you with your account. What specific issue are you experiencing?"
        timestamp={new Date(Date.now() - 4 * 60 * 1000)}
      />
      <ChatMessage
        role="user"
        content="I can't seem to access my billing information"
        timestamp={new Date(Date.now() - 3 * 60 * 1000)}
        user={sampleUser}
      />
      <ChatMessage
        role="assistant"
        content="I understand you're having trouble accessing your billing information. Let me help you with that. Can you tell me if you're seeing any error messages when you try to access the billing section?"
        timestamp={new Date(Date.now() - 2 * 60 * 1000)}
      />
      <ChatMessage
        role="user"
        content="Yes, it says 'Access Denied' when I click on the billing tab"
        timestamp={new Date(Date.now() - 1 * 60 * 1000)}
        user={sampleUser}
      />
      <ChatMessage
        role="assistant"
        content="The 'Access Denied' error typically means your account permissions need to be updated. I'll help you resolve this. Please contact your organization administrator to grant you billing access permissions, or if you are the administrator, you can update the permissions in Settings > Team Members."
        timestamp={new Date()}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A full conversation flow between user and assistant',
      },
    },
  },
};

export const MessageWithoutTimestamp: Story = {
  args: {
    role: 'user',
    content: 'This message has no timestamp',
    user: sampleUser,
  },
};

export const DifferentUserInitials: Story = {
  render: () => (
    <div className="space-y-4">
      <ChatMessage
        role="user"
        content="Single name user"
        timestamp={new Date()}
        user={{ ...sampleUser, name: 'Alice' }}
      />
      <ChatMessage
        role="user"
        content="Two name user"
        timestamp={new Date()}
        user={{ ...sampleUser, name: 'Bob Smith' }}
      />
      <ChatMessage
        role="user"
        content="Three name user"
        timestamp={new Date()}
        user={{ ...sampleUser, name: 'Carlos Juan Martinez' }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different user names showing initial generation logic',
      },
    },
  },
};
