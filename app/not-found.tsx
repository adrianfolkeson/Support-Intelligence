import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Large 404 number */}
        <div className="relative mb-8">
          <h1 className="text-[150px] md:text-[200px] font-bold text-neutral-200 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-neutral-900 flex items-center justify-center shadow-2xl">
              <Search className="w-16 h-16 md:w-20 md:h-20 text-white" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3">
          Page not found
        </h2>
        <p className="text-lg text-neutral-600 mb-8 max-w-md mx-auto">
          We couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-900 border border-neutral-300 rounded-lg font-medium hover:bg-neutral-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Helpful links */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <p className="text-sm text-neutral-500 mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/dashboard" className="text-sm text-neutral-700 hover:text-neutral-900 underline">
              Dashboard
            </Link>
            <span className="text-neutral-300">•</span>
            <Link href="/tickets" className="text-sm text-neutral-700 hover:text-neutral-900 underline">
              Tickets
            </Link>
            <span className="text-neutral-300">•</span>
            <Link href="/settings" className="text-sm text-neutral-700 hover:text-neutral-900 underline">
              Settings
            </Link>
            <span className="text-neutral-300">•</span>
            <Link href="/pricing" className="text-sm text-neutral-700 hover:text-neutral-900 underline">
              Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
