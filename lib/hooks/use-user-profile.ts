"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface UserProfile {
  id: string;
  email: string | null;
  user_metadata: {
    name?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export function useUserProfile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (mounted) {
          if (error) {
            setError(error);
          } else if (user) {
            setUser({
              id: user.id,
              email: user.email ?? null,
              user_metadata: user.user_metadata,
            });
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  return { user, loading, error };
}
