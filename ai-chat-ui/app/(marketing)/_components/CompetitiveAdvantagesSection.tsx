import { FeatureCard } from './CompetitiveAdvantagesSection/FeatureCard';
import { ComparisonTable } from './CompetitiveAdvantagesSection/ComparisonTable';
import { features, comparisonData } from './CompetitiveAdvantagesSection/data';

export function CompetitiveAdvantagesSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            なぜ AI Chat が選ばれるのか
          </h2>
          <p className="text-xl text-gray-600">他社との圧倒的な違いを体感してください</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

        <ComparisonTable data={comparisonData} />
      </div>
    </section>
  );
}
