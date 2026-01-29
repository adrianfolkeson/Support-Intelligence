import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function CheckoutCanceledPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Betalning avbruten
        </h1>

        <p className="text-gray-600 mb-8">
          Inga problem! Du kan när som helst komma tillbaka och starta din prenumeration.
        </p>

        <div className="space-y-4">
          <Link
            href="/pricing"
            className="block w-full py-3 text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Försök igen
          </Link>

          <Link
            href="/"
            className="block w-full py-3 text-center text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            Till startsidan
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Har du frågor? Kontakta oss på adrian.folkeson11@gmail.com
        </p>
      </div>
    </div>
  );
}
