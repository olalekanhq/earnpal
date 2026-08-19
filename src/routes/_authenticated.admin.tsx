import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdminPanel } from "@/components/AdminPanel";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ location, context }) => {
    const session = (context as any).session;
    
    if (!session) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.pathname },
      });
    }
    
    const { data: isAdmin } = await supabase.rpc("has_role", { 
      _user_id: session.user.id, 
      _role: 'admin' 
    });
    
    if (!isAdmin) {
      throw redirect({ to: "/" });
    }
  },
  component: () => (
    <div className="min-h-screen bg-accent/5 pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">Administration</h1>
          <p className="text-muted-foreground font-medium">Manage rewards, redemptions, and user activity.</p>
        </div>
        <AdminPanel />
      </div>
    </div>
  ),
});
