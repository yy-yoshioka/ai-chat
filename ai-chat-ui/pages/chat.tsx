import AuthGuard from '@/components/AuthGuard';
import ChatContainer from '@/components/Chat/ChatContainer';

export default function ChatPage() {
  return (
    <AuthGuard>
      <ChatContainer />
    </AuthGuard>
  );
}
