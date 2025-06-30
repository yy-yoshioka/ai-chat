interface KpiErrorStateProps {
  error: string;
  onRetry: () => void;
}

export default function KpiErrorState({ error, onRetry }: KpiErrorStateProps) {
  return (
    <div className="bg-white rounded-lg border border-red-200 p-6">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <p className="text-red-800 font-medium">{error}</p>
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          再試行
        </button>
      </div>
    </div>
  );
}
