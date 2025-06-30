export default function ContactSection() {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact & Data Requests</h2>
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
  );
}
