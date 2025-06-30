interface Right {
  title: string;
  description: string;
}

const rights: Right[] = [
  {
    title: 'Right to Access',
    description: 'Request a copy of your personal data',
  },
  {
    title: 'Right to Rectification',
    description: 'Correct inaccurate personal data',
  },
  {
    title: 'Right to Erasure',
    description: 'Request deletion of your data',
  },
  {
    title: 'Right to Portability',
    description: 'Export your data in a readable format',
  },
];

export default function GdprRightsSection() {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Your Rights (GDPR)</h2>
      <p className="mb-4">Under GDPR, you have the following rights:</p>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {rights.map((right) => (
          <div key={right.title} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">{right.title}</h3>
            <p className="text-sm text-gray-600">{right.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
