interface FeatureCardProps {
  icon: React.ReactNode;
  color: string;
  title: string;
  description: string;
  comparison: string;
}

export function FeatureCard({ icon, color, title, description, comparison }: FeatureCardProps) {
  return (
    <div className="text-center p-8 rounded-2xl bg-white border hover:shadow-lg transition-shadow duration-300">
      <div
        className={`w-16 h-16 bg-${color}-600 rounded-2xl flex items-center justify-center mx-auto mb-6`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="text-sm text-blue-600 font-medium">{comparison}</div>
    </div>
  );
}
