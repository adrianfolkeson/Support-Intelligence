import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Product</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/pricing" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api-reference" className="text-sm text-neutral-600 hover:text-neutral-900">
                  API Reference
                </Link>
              </li>
            </ul>
          </div>

          {/* Integration */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Integration</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/integration-guide" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Zendesk Setup
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="text-sm text-neutral-600 hover:text-neutral-900">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Support</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/support" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Help Center
                </Link>
              </li>
              <li>
                <a href="mailto:info@auroraecom.se" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Resources</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/blog" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/churn-calculator" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Churn Calculator
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Compare
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Legal</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-200 pt-8">
          <p className="text-center text-sm text-neutral-500">
            &copy; 2026 Support Intelligence. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
