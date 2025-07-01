export function CustomerSuccessSection() {
  const stories = [
    {
      company: 'EC企業 A社',
      industry: 'Eコマース',
      metrics: '売上 +187%, CS効率 +340%',
      quote: '深夜の問い合わせにも即座に対応できるようになり、機会損失が大幅に減少しました。',
      avatar: '🛒',
    },
    {
      company: 'SaaS企業 B社',
      industry: 'ソフトウェア',
      metrics: 'CV率 +250%, CS工数 -70%',
      quote: '技術的な質問にも正確に答えてくれるので、顧客満足度が格段に向上しました。',
      avatar: '💻',
    },
    {
      company: '医療法人 C社',
      industry: 'ヘルスケア',
      metrics: '患者満足度 +95%, 問い合わせ処理時間 -80%',
      quote: '24時間対応が可能になり、患者様に安心感を提供できています。',
      avatar: '🏥',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">お客様の成功事例</h2>
          <p className="text-xl text-gray-600">実際にAI Chatを導入した企業の成果をご覧ください</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-2xl p-8 border hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-4xl mb-4 text-center">{story.avatar}</div>
              <div className="text-center mb-6">
                <h3 className="font-bold text-gray-900 text-lg">{story.company}</h3>
                <p className="text-gray-500 text-sm">{story.industry}</p>
                <p className="text-blue-600 font-semibold mt-2">{story.metrics}</p>
              </div>
              <blockquote className="text-gray-600 italic text-center">
                {`"${story.quote}"`}
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
