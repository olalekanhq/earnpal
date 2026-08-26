import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdminPanel } from "@/components/AdminPanel";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/admin")({
  loader: async ({ location }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.pathname },
      });
    }

    return { userId: user.id };
  },

  component: AdminRouteComponent,
});

function AdminRouteComponent() {
  const { userId } = Route.useLoaderData();

  const { data: roles, isLoading } = useQuery({
    queryKey: ["admin-role-check", userId],
    queryFn: async () => {
      const [{ data: isAdmin }, { data: isModerator }] = await Promise.all([
        supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
        supabase.rpc("has_role", { _user_id: userId, _role: "moderator" }),
      ]);
      return { isAdmin, isModerator };
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent/5">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const isAuthorized = roles?.isAdmin || roles?.isModerator;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-accent/5">
        <AccessDenied />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-10">
        <div>
          <h1 className="text-balance text-3xl font-black tracking-tight text-foreground uppercase sm:text-4xl">
            Admin Panel
          </h1>
          <p className="text-muted-foreground font-medium">
            Manage rewards, redemptions, and user activity.
          </p>
        </div>
        <AdminPanel />
      </div>
    </div>
  );
}
