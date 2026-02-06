"use client";

import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile } from "@clerk/nextjs";

export default function AccountPage() {
  const router = useRouter();

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => router.push("/settings")}
          className="mb-6 text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to settings
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account</h1>
          <p className="mt-2 text-gray-600">
            Manage your profile and account settings
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserProfile
              appearance={{
                elements: {
                  card: "shadow-none",
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white normal-case",
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
