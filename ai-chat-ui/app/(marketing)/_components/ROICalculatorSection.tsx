interface CalculatorCardProps {
  title: string;
  titleClass: string;
  price: string;
  items: string[];
  cardClass?: string;
  textClass?: string;
}

function CalculatorCard({
  title,
  titleClass,
  price,
  items,
  cardClass = 'bg-white rounded-xl p-6 shadow-sm',
  textClass = 'text-gray-600',
}: CalculatorCardProps) {
  return (
    <div className={cardClass}>
      <div className={`text-3xl font-bold mb-2 ${titleClass}`}>{title}</div>
      <div className={`text-lg mb-4 ${textClass}`}>{price}</div>
      <ul className={`text-sm space-y-2 ${textClass}`}>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function ROICalculatorSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            あなたの会社ではどれくらい節約できる？
          </h2>
          <p className="text-xl text-gray-600">
            従来のカスタマーサポートツールと比較して、コスト削減効果を確認してみましょう
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <CalculatorCard
              title="従来ツール"
              titleClass="text-red-600"
              price="月額 $2,000〜"
              items={['• 複雑な設定', '• 高額な月額費用', '• 専門スタッフ必要', '• 導入に数ヶ月']}
            />

            <CalculatorCard
              title="AI Chat"
              titleClass=""
              price="月額 $199〜"
              items={['• 5分で設置完了', '• 90%コスト削減', '• 技術者不要', '• 即日運用開始']}
              cardClass="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-6 shadow-lg transform scale-105"
              textClass="text-white"
            />

            <CalculatorCard
              title="年間節約額"
              titleClass="text-green-600"
              price="$21,612"
              items={['• 人件費削減', '• ツール費削減', '• 効率向上', '• 機会損失防止']}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
