import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdminPanel } from "@/components/AdminPanel";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/auth" });
    
    const { data: isAdmin } = await supabase.rpc("has_role", { 
      _user_id: session.user.id, 
      _role: 'admin' 
    });
    
    if (!isAdmin) throw redirect({ to: "/" });
  },
  component: () => (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Administration</h1>
      <AdminPanel />
    </div>
  ),
});
