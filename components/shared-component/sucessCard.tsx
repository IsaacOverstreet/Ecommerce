export default function SuccessCard({
  message,
  onClose,
}: {
  message?: string;
  onClose?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-3xl p-16 flex flex-col items-center shadow-2xl min-w-[420px] min-h-[320px]">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Text */}
        <h2 className="mt-8 text-2xl font-semibold text-gray-900">Response</h2>

        <p className="mt-4 text-gray-600 text-lg text-center max-w-sm">
          {message}
        </p>

        {/* Action */}
        {onClose && (
          <button
            onClick={onClose}
            className="mt-10 px-8 py-3 rounded-xl bg-green-600 text-white text-lg font-medium hover:bg-green-700 active:scale-95 transition"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
