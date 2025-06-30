import Link from 'next/link';

interface NextStepItem {
  number: string;
  title: string;
  description: string;
  link: string;
  linkText: string;
}

const nextSteps: NextStepItem[] = [
  {
    number: '1',
    title: 'ウィジェットを設置',
    description: 'あなたのWebサイトにAIチャットウィジェットを設置しましょう。',
    link: '/admin/org-selector',
    linkText: 'ウィジェット設置ガイド →',
  },
  {
    number: '2',
    title: 'FAQを作成',
    description: 'よくある質問を追加して、AIの回答精度を向上させましょう。',
    link: '/admin/org-selector',
    linkText: 'FAQ管理 →',
  },
  {
    number: '3',
    title: '設定をカスタマイズ',
    description: 'チャットの応答や外観を御社のブランドに合わせて調整できます。',
    link: '/admin/org-selector',
    linkText: '設定管理 →',
  },
];

export default function NextSteps() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">次のステップ</h2>

      <div className="space-y-4">
        {nextSteps.map((step) => (
          <div key={step.number} className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-blue-600 font-semibold text-sm">{step.number}</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
              <Link
                href={step.link}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {step.linkText}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
