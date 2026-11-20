export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
      <p className="text-sm text-gray-500 mb-4">The requested page does not exist.</p>
      <a
        href="/"
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg transition"
      >
        Return to Stock Portal
      </a>
    </div>
  );
}
