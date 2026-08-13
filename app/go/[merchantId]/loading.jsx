export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="h-10 w-10 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mb-6" />
      <h1 className="text-lg font-semibold text-gray-800">Redirecting…</h1>
    </div>
  );
}