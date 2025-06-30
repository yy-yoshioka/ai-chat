export default function DataCollectionSection() {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Data We Collect</h2>
      <p className="mb-4">We collect the following types of data:</p>
      <ul className="list-disc pl-6 mb-4 space-y-2">
        <li>
          <strong>Account Information:</strong> Email address, organization name, password (hashed)
        </li>
        <li>
          <strong>Usage Data:</strong> Chat messages, widget interactions, analytics data
        </li>
        <li>
          <strong>Technical Data:</strong> IP address, browser type, session information
        </li>
        <li>
          <strong>Billing Data:</strong> Payment information (processed by Stripe)
        </li>
      </ul>
    </section>
  );
}
