import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "cashier";

export async function fetchRole(userId: string): Promise<AppRole | null> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .order("role", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (data?.role as AppRole | undefined) ?? null;
}

export function homeForRole(role: AppRole | null): "/" | "/pos" {
  return role === "admin" ? "/" : "/pos";
}

export const ROLE_LABEL: Record<AppRole, string> = {
  admin: "مدير النظام",
  cashier: "كاشير",
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async (nextUser: User | null) => {
      if (!active) return;
      setUser(nextUser);
      setRole(nextUser ? await fetchRole(nextUser.id) : null);
      if (active) setLoading(false);
    };

    supabase.auth.getUser().then(({ data }) => load(data.user ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        load(session?.user ?? null);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, role, loading };
}
