import { useState } from 'react';

interface EmailReply {
  id: string;
  from: string;
  subject: string;
  originalMessage: string;
  generatedReply: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

const EmailRepliesPage = () => {
  const [emails] = useState<EmailReply[]>([
    {
      id: '1',
      from: 'customer@example.com',
      subject: '料金プランについて',
      originalMessage: 'プロプランの詳細を教えてください',
      generatedReply: 'プロプランは月額99ドルで、以下の機能が含まれます...',
      confidence: 87,
      status: 'pending',
      timestamp: new Date().toISOString(),
    },
  ]);

  const approveReply = (id: string) => {
    console.log('Approved:', id);
  };

  const rejectReply = (id: string) => {
    console.log('Rejected:', id);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Generative Email Replies</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-blue-600">{emails.length}</div>
          <div className="text-sm text-gray-600">待機中メール</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-green-600">85%</div>
          <div className="text-sm text-gray-600">承認率</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-purple-600">2.3分</div>
          <div className="text-sm text-gray-600">平均応答時間</div>
        </div>
      </div>

      <div className="space-y-4">
        {emails.map((email) => (
          <div key={email.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">{email.subject}</h3>
                <p className="text-sm text-gray-600">From: {email.from}</p>
                <p className="text-xs text-gray-500">
                  {new Date(email.timestamp).toLocaleString()}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  email.confidence > 80
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                信頼度: {email.confidence}%
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">元のメッセージ</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">{email.originalMessage}</div>
              </div>

              <div>
                <h4 className="font-medium mb-2">生成された返信</h4>
                <div className="bg-blue-50 p-3 rounded text-sm">{email.generatedReply}</div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => rejectReply(email.id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                却下
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                編集
              </button>
              <button
                onClick={() => approveReply(email.id)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                承認・送信
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmailRepliesPage;
