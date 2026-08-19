import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdminPanel } from "@/components/AdminPanel";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    let { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const { data: { session: retrySession } } = await supabase.auth.getSession();
      session = retrySession;
    }
    
    if (!session) throw redirect({ to: "/auth", search: { redirect: window.location.pathname } });
    
    const { data: isAdmin } = await supabase.rpc("has_role", { 
      _user_id: session.user.id, 
      _role: 'admin' 
    });
    
    if (!isAdmin) throw redirect({ to: "/" });
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
