import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Keeps the user's point balance fresh in real time.
 * Listens to their own profile row and points transactions so the balance
 * refreshes instantly across tabs and right after any confirmation.
 */
export function useRealtimeBalance() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["recentTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["balanceTrend"] });
    };

    const setup = async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId || cancelled) return;

      channel = supabase
        .channel(`balance-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${userId}`,
          },
          invalidate
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "points_transactions",
            filter: `user_id=eq.${userId}`,
          },
          invalidate
        )
        .subscribe();
    };

    setup();

    // Refresh when the tab regains focus, as a safety net.
    const onVisible = () => {
      if (document.visibilityState === "visible") invalidate();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      if (channel) supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
