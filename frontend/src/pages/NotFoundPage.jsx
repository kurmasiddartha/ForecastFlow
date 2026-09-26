import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500 mb-4">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
      <p className="text-sm text-slate-600 max-w-md mb-6">
        The requested route does not exist or has not yet been introduced in this development phase.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 transition-colors"
      >
        <Home className="h-4 w-4" />
        Return to Overview
      </Link>
    </div>
  );
}
