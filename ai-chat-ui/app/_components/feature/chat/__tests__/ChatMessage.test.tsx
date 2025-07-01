import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatMessage from '../ChatMessage';
import { User } from '@/app/_domains/auth';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className, onError }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} onError={onError} />
  ),
}));

describe('ChatMessage', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    profileImage: 'https://example.com/avatar.jpg',
    roles: ['user'],
    organizationId: 'org-123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  it('renders user message correctly', () => {
    render(
      <ChatMessage
        role="user"
        content="Hello, I need help"
        timestamp={new Date('2024-01-01T10:30:00')}
        user={mockUser}
      />
    );

    expect(screen.getByText('Hello, I need help')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('10:30')).toBeInTheDocument();
  });

  it('renders assistant message correctly', () => {
    render(
      <ChatMessage
        role="assistant"
        content="I can help you with that"
        timestamp={new Date('2024-01-01T10:31:00')}
      />
    );

    expect(screen.getByText('I can help you with that')).toBeInTheDocument();
    expect(screen.getByText('10:31')).toBeInTheDocument();
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
  });

  it('renders user avatar with profile image', () => {
    render(
      <ChatMessage
        role="user"
        content="Test message"
        user={mockUser}
      />
    );

    const avatar = screen.getByAltText('Test User');
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(avatar).toHaveClass('w-8', 'h-8', 'rounded-full', 'object-cover');
  });

  it('renders user initials when no profile image', () => {
    const userWithoutImage = { ...mockUser, profileImage: undefined };
    
    render(
      <ChatMessage
        role="user"
        content="Test message"
        user={userWithoutImage}
      />
    );

    expect(screen.getByText('TU')).toBeInTheDocument();
  });

  it('renders single initial for single name', () => {
    const userWithSingleName = { ...mockUser, name: 'John', profileImage: undefined };
    
    render(
      <ChatMessage
        role="user"
        content="Test message"
        user={userWithSingleName}
      />
    );

    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders default initial when no user name', () => {
    const userWithoutName = { ...mockUser, name: undefined, profileImage: undefined };
    
    render(
      <ChatMessage
        role="user"
        content="Test message"
        user={userWithoutName}
      />
    );

    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('renders assistant avatar with icon', () => {
    render(
      <ChatMessage
        role="assistant"
        content="Test message"
      />
    );

    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toHaveClass('w-5', 'h-5', 'text-gray-600');
  });

  it('applies correct styling for user messages', () => {
    render(
      <ChatMessage
        role="user"
        content="User message"
        user={mockUser}
      />
    );

    const messageContainer = screen.getByText('User message').parentElement;
    expect(messageContainer).toHaveClass('bg-blue-600', 'text-white', 'rounded-br-md');
  });

  it('applies correct styling for assistant messages', () => {
    render(
      <ChatMessage
        role="assistant"
        content="Assistant message"
      />
    );

    const messageContainer = screen.getByText('Assistant message').parentElement;
    expect(messageContainer).toHaveClass('bg-gray-100', 'text-gray-900', 'rounded-bl-md');
  });

  it('handles multiline content', () => {
    const multilineContent = 'Line 1\nLine 2\nLine 3';
    
    render(
      <ChatMessage
        role="user"
        content={multilineContent}
        user={mockUser}
      />
    );

    const contentElement = screen.getByText('Line 1 Line 2 Line 3');
    expect(contentElement).toHaveClass('whitespace-pre-wrap', 'break-words');
  });

  it('renders without timestamp', () => {
    render(
      <ChatMessage
        role="user"
        content="No timestamp"
        user={mockUser}
      />
    );

    expect(screen.getByText('No timestamp')).toBeInTheDocument();
    expect(screen.queryByText(/\d{2}:\d{2}/)).not.toBeInTheDocument();
  });

  it('handles Japanese time format', () => {
    const timestamp = new Date('2024-01-01T15:45:00');
    
    render(
      <ChatMessage
        role="user"
        content="Test"
        timestamp={timestamp}
        user={mockUser}
      />
    );

    // The time should be formatted in Japanese locale
    expect(screen.getByText('15:45')).toBeInTheDocument();
  });

  it('applies fade-in animation', () => {
    const { container } = render(
      <ChatMessage
        role="user"
        content="Animated message"
        user={mockUser}
      />
    );

    const messageDiv = container.firstChild;
    expect(messageDiv).toHaveClass('animate-fade-in');
  });

  it('handles missing user prop for user messages', () => {
    render(
      <ChatMessage
        role="user"
        content="No user provided"
      />
    );

    expect(screen.getByText('No user provided')).toBeInTheDocument();
    expect(screen.getByText('U')).toBeInTheDocument(); // Default initial
  });

  it('correctly reverses layout for user messages', () => {
    const { container } = render(
      <ChatMessage
        role="user"
        content="User message"
        user={mockUser}
      />
    );

    const messageDiv = container.firstChild;
    expect(messageDiv).toHaveClass('flex-row-reverse');
  });

  it('does not reverse layout for assistant messages', () => {
    const { container } = render(
      <ChatMessage
        role="assistant"
        content="Assistant message"
      />
    );

    const messageDiv = container.firstChild;
    expect(messageDiv).not.toHaveClass('flex-row-reverse');
  });
});