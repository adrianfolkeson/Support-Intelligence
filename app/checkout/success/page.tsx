"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      router.push(`/welcome?session_id=${sessionId}`);
    } else {
      router.push("/pricing");
    }
  }, [sessionId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Setting up your account...</p>
      </div>
    </div>
  );
}
