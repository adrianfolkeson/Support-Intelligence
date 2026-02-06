import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutCanceledPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <XCircle className="mx-auto h-16 w-16 text-gray-400" />
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Payment Canceled</h1>
        <p className="mt-4 text-gray-600">
          No worries - you can try again when you&apos;re ready.
        </p>
        <div className="mt-8">
          <Link href="/pricing">
            <Button>Return to Pricing</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
