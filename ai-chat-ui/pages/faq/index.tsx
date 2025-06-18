import FAQList from '@/components/FAQ/FAQList';
import Layout from '../../components/Layout';

export default function FAQPage() {
  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-gray-600">
              Find answers to common questions about our AI Chat platform
            </p>
          </div>
          <FAQList />
        </div>
      </div>
    </Layout>
  );
}
