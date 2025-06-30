import React, { FC } from 'react';
import DataCollectionSection from '@/app/_components/feature/privacy/DataCollectionSection';
import DataUsageSection from '@/app/_components/feature/privacy/DataUsageSection';
import DataRetentionSection from '@/app/_components/feature/privacy/DataRetentionSection';
import GdprRightsSection from '@/app/_components/feature/privacy/GdprRightsSection';
import ContactSection from '@/app/_components/feature/privacy/ContactSection';

const PrivacyPolicy: FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

            <DataCollectionSection />
            <DataUsageSection />
            <DataRetentionSection />
            <GdprRightsSection />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Data Processing Legal Basis
              </h2>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <strong>Contract:</strong> Processing necessary for service delivery
                </li>
                <li>
                  <strong>Legitimate Interest:</strong> Analytics and security improvements
                </li>
                <li>
                  <strong>Consent:</strong> Marketing communications (opt-in only)
                </li>
                <li>
                  <strong>Legal Obligation:</strong> Tax and accounting records
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. International Transfers
              </h2>
              <p className="mb-4">
                Your data may be processed in countries outside the EEA. We ensure adequate
                protection through:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Standard Contractual Clauses (SCCs)</li>
                <li>Adequacy decisions from the European Commission</li>
                <li>Certification schemes and codes of conduct</li>
              </ul>
            </section>

            <ContactSection />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Updates to This Policy
              </h2>
              <p className="mb-4">
                We may update this privacy policy from time to time. We will notify you of any
                changes by:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Email notification to registered users</li>
                <li>In-app notification</li>
                <li>Website banner for 30 days after changes</li>
              </ul>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-gray-500">
              This privacy policy is available in multiple languages. If you have questions about
              this policy or our data practices, please contact us at privacy@aiChat.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
