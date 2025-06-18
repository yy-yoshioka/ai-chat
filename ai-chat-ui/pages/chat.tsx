import AuthGuard from '@/components/AuthGuard';
import ChatContainer from '@/components/Chat/ChatContainer';
import Layout from '../components/Layout';

export default function ChatPage() {
  return (
    <AuthGuard>
      <Layout>
        <ChatContainer />
      </Layout>
    </AuthGuard>
  );
}
