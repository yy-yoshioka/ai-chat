export default function DataRetentionSection() {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Retention</h2>
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
        <p className="text-blue-800">
          <strong>Automatic Data Deletion:</strong> We automatically delete user data according to
          our retention schedule.
        </p>
      </div>
      <ul className="list-disc pl-6 mb-4 space-y-2">
        <li>
          <strong>Chat Messages:</strong> Deleted after 2 years of inactivity
        </li>
        <li>
          <strong>Analytics Data:</strong> Aggregated after 1 year, raw data deleted after 2 years
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
  );
}
