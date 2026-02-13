import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="text-center px-4">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 shadow-lg">
            <span className="text-4xl font-bold text-slate-500">?</span>
          </div>
        </div>
        <h1 className="text-7xl font-bold text-slate-200">404</h1>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Page not found</h2>
        <p className="mt-2 text-slate-500">The page you're looking for doesn't exist or has been moved.</p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
