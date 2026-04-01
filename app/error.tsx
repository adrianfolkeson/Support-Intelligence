"use client";

import { AlertCircle, RefreshCw, Home, Mail } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Error icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>

          {/* Error message */}
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">
            Something went wrong
          </h1>
          <p className="text-lg text-neutral-600 mb-6 max-w-md mx-auto">
            We encountered an unexpected error while processing your request. Don't worry, our team has been notified.
          </p>

          {/* Error details (in development) */}
          {process.env.NODE_ENV === "development" && error.message && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700 font-mono text-left break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-900 border border-neutral-300 rounded-lg font-medium hover:bg-neutral-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Home className="w-5 h-5" />
              Go to Dashboard
            </Link>
          </div>

          {/* Support contact */}
          <div className="pt-6 border-t border-neutral-200">
            <p className="text-sm text-neutral-600 mb-3">
              Still having trouble? We're here to help.
            </p>
            <a
              href="mailto:support@support-intel.com"
              className="inline-flex items-center gap-2 text-sm text-neutral-900 font-medium hover:text-neutral-700 underline"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </a>
          </div>
        </div>

        {/* Reassurance message */}
        <p className="text-center text-sm text-neutral-500 mt-6">
          Error ID: {error.digest || new Date().toISOString()}
        </p>
      </div>
    </div>
  );
}
