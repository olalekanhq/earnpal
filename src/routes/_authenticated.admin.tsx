import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdminPanel } from "@/components/AdminPanel";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ location }) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.pathname },
      });
    }

    // Double check with has_role RPC
    const { data: isAdmin, error: adminError } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: 'admin'
    });

    const { data: isModerator, error: modError } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: 'moderator'
    });

    if (adminError || modError || (!isAdmin && !isModerator)) {
      console.error("Access denied to admin panel for user:", user.id);
      throw redirect({ to: "/" });
    }
  },

  component: () => (
    <div className="min-h-screen bg-accent/5 pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">Admin Panel</h1>
          <p className="text-muted-foreground font-medium">Manage rewards, redemptions, and user activity.</p>
        </div>
        <AdminPanel />
      </div>
    </div>
  ),
});
