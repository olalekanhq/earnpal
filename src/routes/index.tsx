import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Coins, Gift, Share2, TrendingUp, Clock, ChevronRight, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    title: "Dashboard | Paid Point",
    meta: [
      { name: "description", content: "Manage your points and complete tasks on Paid Point." },
      { property: "og:title", content: "Dashboard | Paid Point" },
    ],
  }),
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({
        to: "/auth",
      });
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
      
      // Call RPC or handle logic to update streak
      const { error } = await supabase.from('points_transactions').insert({
        user_id: user.id,
        amount: 20,
        type: 'earn',
        description: 'Daily login bonus'
      });
      if (error) throw error;
      
      // Update streak activity
      await supabase.from('user_streaks').upsert({
        user_id: user.id,
        last_activity_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["streak"] });
      queryClient.invalidateQueries({ queryKey: ["recentTransactions"] });
      toast.success("Daily bonus claimed! +20 points");
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.full_name || 'User'}!</h1>
          <p className="text-muted-foreground">You've earned {profile?.points_balance || 0} points so far.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
          <Coins className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg text-primary">{profile?.points_balance || 0}</span>
          <span className="text-primary/70 text-sm font-medium">Points</span>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <TrendingUp className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.points_balance || 0}</div>
            <p className="text-xs opacity-70">Points earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referrals</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralCount}</div>
            <p className="text-xs text-muted-foreground">Successful invites</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streak?.current_streak || 0} Days</div>
            <p className="text-xs text-muted-foreground">Keep the streak alive!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span>Level 1</span>
              <span>{(profile?.points_balance || 0) % 1000} / 1000</span>
            </div>
            <Progress value={((profile?.points_balance || 0) % 1000) / 10} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest points earning and redemptions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions?.length ? recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${tx.type === 'earn' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {tx.type === 'earn' ? <TrendingUp className="h-4 w-4" /> : <Gift className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className={`font-bold ${tx.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity found.
                </div>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link to="/earn">View all activity <ChevronRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Tasks</CardTitle>
            <CardDescription>Complete these to earn points fast.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Share2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Follow on Twitter</p>
                  <p className="text-xs text-muted-foreground">+50 Points</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div 
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer group"
              onClick={() => !claimDailyStreak.isPending && claimDailyStreak.mutate()}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-200">
                  <Gift className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Daily Reward</p>
                  <p className="text-xs text-muted-foreground">+20 Points</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" disabled={claimDailyStreak.isPending}>
                {claimDailyStreak.isPending ? "Claiming..." : "Claim"}
              </Button>
            </div>
            <Button className="w-full" asChild>
              <Link to="/earn">See More Tasks</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}