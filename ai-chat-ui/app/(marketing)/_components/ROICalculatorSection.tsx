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
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-red-600 mb-2">従来ツール</div>
              <div className="text-lg text-gray-600 mb-4">月額 $2,000〜</div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 複雑な設定</li>
                <li>• 高額な月額費用</li>
                <li>• 専門スタッフ必要</li>
                <li>• 導入に数ヶ月</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-6 shadow-lg transform scale-105">
              <div className="text-3xl font-bold mb-2">AI Chat</div>
              <div className="text-lg mb-4">月額 $199〜</div>
              <ul className="text-sm space-y-2">
                <li>• 5分で設置完了</li>
                <li>• 90%コスト削減</li>
                <li>• 技術者不要</li>
                <li>• 即日運用開始</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-green-600 mb-2">年間節約額</div>
              <div className="text-lg text-gray-600 mb-4">$21,612</div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 人件費削減</li>
                <li>• ツール費削減</li>
                <li>• 効率向上</li>
                <li>• 機会損失防止</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
