import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { fetchRole } from "@/hooks/use-auth";

const CASHIER_ALLOWED = ["/pos", "/products"];

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });

    const role = await fetchRole(data.user.id);
    if (role !== "admin" && !CASHIER_ALLOWED.includes(location.pathname)) {
      throw redirect({ to: "/pos" });
    }

    return { user: data.user, role };
  },
  component: () => <Outlet />,
});
