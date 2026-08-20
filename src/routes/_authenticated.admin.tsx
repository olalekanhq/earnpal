import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdminPanel } from "@/components/AdminPanel";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { z } from "zod";

const adminSearchSchema = z.object({
  tab: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/admin")({
  validateSearch: (search) => adminSearchSchema.parse(search),
  beforeLoad: async ({ location }) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.pathname },
      });
    }

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!isAdmin) {
      throw redirect({ to: "/" });
    }
  },

  component: () => {
    const { tab } = Route.useSearch();
    const navigate = Route.useNavigate();

    return (
      <div className="flex min-h-screen bg-accent/5">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">Admin Panel</h1>
              <p className="text-muted-foreground font-medium">Manage rewards, redemptions, and user activity.</p>
            </div>
            <AdminPanel 
              activeTab={tab} 
              onTabChange={(newTab) => navigate({ search: { tab: newTab } })} 
            />
          </div>
        </main>
      </div>
    );
  },
});
