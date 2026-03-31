"use client";

import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { ToastProvider, useToast } from "@/components/ui/toast";

export const dynamic = 'force-dynamic';

function AccountContent() {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push("/sign-in");
    } catch (error) {
      showToast("Failed to sign out", "error");
    } finally {
      setLoading(false);
    }
  };

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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{user?.email || "No email"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">User ID</label>
                <p className="mt-1 text-sm text-gray-500 font-mono">{user?.id || "No ID"}</p>
              </div>
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  disabled={loading}
                >
                  {loading ? "Signing out..." : "Sign Out"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <ToastProvider>
      <AccountContent />
    </ToastProvider>
  );
}
