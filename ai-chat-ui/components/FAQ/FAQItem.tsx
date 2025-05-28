export interface FAQItemProps {
  id: string;
  question: string;
  answer: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function FAQItem({ id, question, answer, onEdit, onDelete }: FAQItemProps) {
  return (
    <div className="border rounded p-4 mb-2">
      <h3 className="font-semibold">{question}</h3>
      <p className="mt-2 text-sm text-gray-700">{answer}</p>
      {(onEdit || onDelete) && (
        <div className="mt-2 flex gap-2">
          {onEdit && (
            <button
              className="px-2 py-1 text-sm bg-blue-500 text-white rounded"
              onClick={() => onEdit(id)}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              className="px-2 py-1 text-sm bg-red-500 text-white rounded"
              onClick={() => onDelete(id)}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
