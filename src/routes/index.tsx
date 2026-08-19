import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Coins, Gift, Share2, TrendingUp, Clock, ChevronRight, Award, Zap, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
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

  const { data: popularRewards } = useQuery({
    queryKey: ["popularRewards"],
    queryFn: async () => {
      const { data } = await supabase
        .from("rewards")
        .select("*")
        .eq("is_active", true)
        .limit(3);
      return data;
    },
  });

  const { data: recommendedTasks } = useQuery({
    queryKey: ["recommendedTasks"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("is_active", true)
        .limit(3);
      return data;
    },
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data } = await supabase.from("leaderboard").select("*").limit(10);
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-accent/5 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl uppercase">
              Welcome, <span className="text-primary">{profile?.full_name?.split(' ')[0] || 'User'}</span>
            </h1>
            <p className="mt-2 text-lg text-muted-foreground font-medium">
              You've accumulated <span className="text-foreground font-black underline decoration-primary underline-offset-4">{profile?.points_balance?.toLocaleString() || 0}</span> points.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
             <div className="flex items-center gap-3 bg-card px-6 py-3 rounded-2xl shadow-sm border border-border">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Coins className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground leading-none mb-1">Current Balance</p>
                <p className="text-2xl font-black text-foreground leading-none">{profile?.points_balance?.toLocaleString() || 0} <span className="text-xs font-bold text-primary align-top ml-1">PTS</span></p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none shadow-md overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-80">Earnings Growth</CardTitle>
              <TrendingUp className="h-5 w-5 opacity-70" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{profile?.points_balance?.toLocaleString() || 0}</div>
              <p className="text-xs font-medium mt-1 opacity-70">+12% from last week</p>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Active Referrals</CardTitle>
              <Share2 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{referralCount}</div>
              <p className="text-xs font-medium mt-1 text-muted-foreground">Friends earning for you</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Daily Streak</CardTitle>
              <Clock className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{streak?.current_streak || 0} Days</div>
              <p className="text-xs font-medium mt-1 text-muted-foreground">Don't break the chain!</p>
            </CardContent>
            {streak && streak.current_streak > 0 && (
               <div className="absolute -right-2 -bottom-2 opacity-5">
                 <Clock className="h-24 w-24" />
               </div>
            )}
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Next Reward</CardTitle>
              <Award className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-end">
                <div className="text-3xl font-black">Level {Math.floor((profile?.points_balance || 0) / 1000) + 1}</div>
                <span className="text-xs font-bold text-muted-foreground">{(profile?.points_balance || 0) % 1000} / 1000</span>
              </div>
              <Progress value={((profile?.points_balance || 0) % 1000) / 10} className="h-2 bg-secondary" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-8">
            <Card className="border-none shadow-md">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-6">
                <div>
                  <CardTitle className="text-xl font-bold uppercase tracking-tight">Recent Activity</CardTitle>
                  <CardDescription>Your history of earnings and redemptions</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                  <Link to="/earn">View History</Link>
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {recentTransactions?.length ? recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${tx.type === 'earn' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {tx.type === 'earn' ? <TrendingUp className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{tx.description}</p>
                          <p className="text-sm text-muted-foreground">{new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className={`text-lg font-black ${tx.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                       <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                         <Clock className="h-8 w-8 text-muted-foreground" />
                       </div>
                       <p className="text-muted-foreground font-medium">No recent activity to show yet.</p>
                       <Button variant="link" asChild className="mt-2">
                         <Link to="/earn">Start earning now</Link>
                       </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-tight">Hot Rewards</h2>
                <Button variant="ghost" size="sm" asChild className="text-primary font-bold">
                  <Link to="/redeem">See All <ChevronRight className="h-4 w-4 ml-1" /></Link>
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {popularRewards?.length ? popularRewards.map((reward) => (
                  <Card key={reward.id} className="border-none shadow-sm overflow-hidden group">
                    <div className="aspect-video relative bg-muted">
                      {reward.image_url ? (
                        <img src={reward.image_url} alt={reward.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                          <Gift className="h-8 w-8" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-black text-primary border border-primary/20">
                          {reward.cost_points} PTS
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <p className="font-bold text-sm truncate">{reward.title}</p>
                      <Button variant="secondary" size="sm" className="w-full mt-2 h-8 text-[10px] font-bold" asChild>
                        <Link to="/redeem">REDEEM</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )) : (
                  [1, 2, 3].map((i) => (
                    <Card key={i} className="border-none shadow-sm overflow-hidden bg-muted/20 p-4 flex flex-col items-center justify-center min-h-[140px] text-center">
                      <Gift className="h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Coming Soon</p>
                    </Card>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase tracking-tight">Community Leaders</h2>
              <Card className="border-none shadow-md divide-y divide-border/50">
                {leaderboard?.slice(0, 3).map((user, idx) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-card">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                        idx === 0 ? "bg-yellow-100 text-yellow-700" : 
                        idx === 1 ? "bg-slate-100 text-slate-700" : 
                        "bg-orange-100 text-orange-700"
                      }`}>
                        #{idx + 1}
                      </div>
                      <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                        <AvatarImage src={user.avatar_url || ""} />
                        <AvatarFallback className="font-bold text-xs">{user.full_name?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-sm">{user.full_name || "Anonymous"}</p>
                        <p className="text-xs text-muted-foreground font-medium">{user.points_balance?.toLocaleString()} points</p>
                      </div>
                    </div>
                    {idx === 0 && <TrendingUp className="h-4 w-4 text-green-500" />}
                  </div>
                ))}
              </Card>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-md bg-card">
              <CardHeader className="border-b border-border/50 pb-6">
                <CardTitle className="text-xl font-bold">Quick Tasks</CardTitle>
                <CardDescription>Instant ways to boost your balance</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="p-4 rounded-2xl border-2 border-transparent bg-accent/50 hover:bg-accent hover:border-primary/20 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                        <Share2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">Social Boost</p>
                        <p className="text-xs font-bold text-primary uppercase">+50 Points</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div 
                  className="p-4 rounded-2xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer group"
                  onClick={() => !claimDailyStreak.isPending && claimDailyStreak.mutate()}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary text-primary-foreground rounded-xl group-hover:rotate-12 transition-transform">
                        <Gift className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">Daily Reward</p>
                        <p className="text-xs font-bold text-primary uppercase">Claim +20 PTS</p>
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" className="font-bold" disabled={claimDailyStreak.isPending}>
                      {claimDailyStreak.isPending ? "..." : "Claim"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Recommended for you</p>
                  {recommendedTasks?.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 hover:border-primary/30 transition-colors group cursor-pointer" asChild>
                      <Link to="/earn">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-accent rounded-lg group-hover:bg-primary/10 transition-colors">
                            <Zap className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs font-bold truncate max-w-[120px]">{task.title}</p>
                            <p className="text-[10px] text-primary font-black">+{task.points} PTS</p>
                          </div>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      </Link>
                    </div>
                  ))}
                </div>

                <Button className="w-full py-6 text-md font-black shadow-lg shadow-primary/20" asChild>
                  <Link to="/earn">EXPLORE ALL TASKS</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-gradient-to-br from-indigo-600 to-violet-700 text-white overflow-hidden relative">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Invite & Earn</CardTitle>
                <CardDescription className="text-indigo-100">Get 10% of what your friends earn forever!</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Button variant="secondary" className="w-full font-bold" asChild>
                  <Link to="/refer">Get Referral Link</Link>
                </Button>
              </CardContent>
              <Share2 className="absolute -right-4 -bottom-4 h-24 w-24 text-white/10 rotate-12" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}