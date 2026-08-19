import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Coins, Gift, Share2, TrendingUp, Clock, ChevronRight, Award, Zap, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    title: "Dashboard | Earn Pal",
    meta: [
      { name: "description", content: "Manage your points and complete tasks on Earn Pal." },
      { property: "og:title", content: "Dashboard | Earn Pal" },
    ],
  }),
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const { data: { session: retrySession } } = await supabase.auth.getSession();
      if (!retrySession) {
        throw redirect({
          to: "/auth",
          search: { redirect: window.location.pathname },
        });
      }
    }
  },
  component: Dashboard,
});

function Dashboard() {
  const queryClient = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      return data;
    },
  });

  const { data: streak } = useQuery({
    queryKey: ["streak"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("user_streaks").select("*").eq("user_id", user.id).single();
      return data;
    },
  });

  const { data: referralCount } = useQuery({
    queryKey: ["referralCount"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("referred_by", user.id);
      return count || 0;
    },
  });

  const claimDailyStreak = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.rpc('claim_daily_reward', { _user_id: user.id });
      if (error) throw new Error(error.message || "An unexpected error occurred.");
      const result = data as any;
      if (!result.success) throw new Error(result.message || "Failed to claim reward");
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["streak"] });
      queryClient.invalidateQueries({ queryKey: ["recentTransactions"] });
      toast.success(result.message || `Daily bonus claimed! +${result.points} points`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to claim reward.");
    }
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ["recentTransactions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("points_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      return data;
    },
  });

  const isClaimedToday = streak?.last_activity_at && new Date(streak.last_activity_at).toDateString() === new Date().toDateString();

  return (
    <div className="pb-12 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back, {profile?.username || profile?.full_name?.split(' ')[0] || 'User'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your rewards today.
        </p>
      </header>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Main Balance Card - Inspired by Reference */}
        <Card className="lg:col-span-2 overflow-hidden border-none bg-primary text-primary-foreground shadow-lg shadow-primary/20 relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-70">Total Balance</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div className="space-y-1">
              <div className="text-5xl font-bold tracking-tighter">
                {profile?.points_balance?.toLocaleString() || 0} <span className="text-xl opacity-60 ml-1">PTS</span>
              </div>
              <p className="text-sm font-medium opacity-80 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                +12% from last week
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="rounded-xl font-bold px-6 h-11 bg-white text-primary hover:bg-white/90 border-none shadow-sm" asChild>
                <Link to="/earn">Start Earning</Link>
              </Button>
              <Button variant="outline" className="rounded-xl font-bold px-6 h-11 bg-white/10 border-white/20 hover:bg-white/20 text-white" asChild>
                <Link to="/redeem">Redeem</Link>
              </Button>
            </div>
          </CardContent>
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-10 pointer-events-none">
            <Coins className="h-40 w-40 rotate-12" />
          </div>
        </Card>

        {/* Daily Streak Card */}
        <Card className="border-none shadow-sm flex flex-col relative overflow-hidden bg-white group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Daily Streak</CardTitle>
              <div className="bg-orange-50 p-2 rounded-xl text-orange-600 group-hover:scale-110 transition-transform">
                <Clock className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 flex-1 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tight">{streak?.current_streak || 0} Days</div>
              <p className="text-[11px] text-muted-foreground font-medium">Claim daily to earn bonus points</p>
            </div>
            <div className="mt-6">
              <Button 
                className={cn(
                  "w-full rounded-xl font-bold h-12 transition-all",
                  isClaimedToday ? "bg-muted text-muted-foreground border-none shadow-none cursor-default" : "shadow-md shadow-primary/10"
                )}
                disabled={isClaimedToday || claimDailyStreak.isPending}
                onClick={() => claimDailyStreak.mutate()}
              >
                {claimDailyStreak.isPending ? "Claiming..." : isClaimedToday ? "✓ Claimed Today" : "Claim Daily Reward"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Recent Activity */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold tracking-tight">Recent Activity</h2>
            <Link to="/earn" className="text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-widest">View all</Link>
          </div>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {recentTransactions?.length ? recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 group hover:bg-accent/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2.5 rounded-xl transition-transform group-hover:scale-110",
                        tx.type === 'earn' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      )}>
                        {tx.type === 'earn' ? <TrendingUp className="h-4 w-4" /> : <Gift className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{tx.description}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "text-sm font-black",
                      tx.type === 'earn' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm font-medium">No recent activity yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats & Promo */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-xl font-bold px-2">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-none shadow-sm bg-white p-4 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Referrals</p>
              <p className="text-2xl font-bold">{referralCount}</p>
            </Card>
            <Card className="border-none shadow-sm bg-white p-4 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rank</p>
              <p className="text-2xl font-bold">#{Math.floor(Math.random() * 100) + 1}</p>
            </Card>
          </div>

          <Card className="border-none shadow-sm bg-violet-50 border border-violet-100 p-6 space-y-4 overflow-hidden relative">
            <div className="relative z-10 space-y-4">
              <div className="bg-violet-600 w-fit p-2 rounded-xl text-white">
                <Share2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-violet-900 leading-tight">Invite your friends</h3>
                <p className="text-sm text-violet-700/80 font-medium">Earn 10% lifetime points from all your referrals.</p>
              </div>
              <Button className="w-full bg-violet-600 hover:bg-violet-700 rounded-xl font-bold" asChild>
                <Link to="/refer">Get Referral Link</Link>
              </Button>
            </div>
            <Share2 className="absolute -right-4 -bottom-4 h-24 w-24 text-violet-600/5 rotate-12" />
          </Card>
        </div>
      </div>
    </div>
  );
}

// Utility function (duplicated since it's used in components but defined in utils)
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}