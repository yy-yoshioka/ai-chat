import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy - AI Chat</title>
        <meta name="description" content="Privacy Policy and Data Protection Information" />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow-sm rounded-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

              <div className="prose prose-lg max-w-none">
                <p className="text-gray-600 mb-6">
                  Last updated: {new Date().toLocaleDateString()}
                </p>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Data We Collect</h2>
                  <p className="mb-4">We collect the following types of data:</p>
                  <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>
                      <strong>Account Information:</strong> Email address, organization name,
                      password (hashed)
                    </li>
                    <li>
                      <strong>Usage Data:</strong> Chat messages, widget interactions, analytics
                      data
                    </li>
                    <li>
                      <strong>Technical Data:</strong> IP address, browser type, session information
                    </li>
                    <li>
                      <strong>Billing Data:</strong> Payment information (processed by Stripe)
                    </li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    2. How We Use Your Data
                  </h2>
                  <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>Provide and improve our AI chat service</li>
                    <li>Process payments and manage subscriptions</li>
                    <li>Send service notifications and updates</li>
                    <li>Analyze usage patterns to enhance user experience</li>
                    <li>Ensure security and prevent fraud</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Retention</h2>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                    <p className="text-blue-800">
                      <strong>Automatic Data Deletion:</strong> We automatically delete user data
                      according to our retention schedule.
                    </p>
                  </div>
                  <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>
                      <strong>Chat Messages:</strong> Deleted after 2 years of inactivity
                    </li>
                    <li>
                      <strong>Analytics Data:</strong> Aggregated after 1 year, raw data deleted
                      after 2 years
                    </li>
                    <li>
                      <strong>Account Data:</strong> Deleted 30 days after account closure
                    </li>
                    <li>
                      <strong>Billing Records:</strong> Retained for 7 years for tax compliance
                    </li>
                    <li>
                      <strong>Server Logs:</strong> Deleted after 90 days
                    </li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    4. Your Rights (GDPR)
                  </h2>
                  <p className="mb-4">Under GDPR, you have the following rights:</p>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Right to Access</h3>
                      <p className="text-sm text-gray-600">Request a copy of your personal data</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Right to Rectification</h3>
                      <p className="text-sm text-gray-600">Correct inaccurate personal data</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Right to Erasure</h3>
                      <p className="text-sm text-gray-600">Request deletion of your data</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Right to Portability</h3>
                      <p className="text-sm text-gray-600">Export your data in a readable format</p>
                    </div>
                  </div>
                </section>

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

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    7. Contact & Data Requests
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="mb-4">
                      <strong>Data Protection Officer:</strong> privacy@aiChat.com
                    </p>
                    <p className="mb-4">
                      For GDPR requests, email us with &quot;GDPR Request&quot; in the subject line.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Request My Data
                      </button>
                      <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
                        Delete My Account
                      </button>
                    </div>
                  </div>
                </section>

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
                  This privacy policy is available in multiple languages. If you have questions
                  about this policy or our data practices, please contact us at privacy@aiChat.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default PrivacyPolicy;
