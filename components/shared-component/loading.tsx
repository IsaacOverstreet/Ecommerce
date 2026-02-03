export function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl p-12 flex flex-col items-center shadow-xl min-w-[300px] min-h-[200px]">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
        <p className="mt-6 text-gray-700 text-lg font-medium">saving...</p>
      </div>
    </div>
  );
}
