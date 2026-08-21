import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Coins, Gift, Share2, TrendingUp, TrendingDown, Clock, ChevronRight, Award, Zap, Star, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { subDays, startOfDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WelcomeBonusModal } from "@/components/WelcomeBonusModal";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    title: "Member Dashboard | My Earnings & Progress | Earn Pal",
    meta: [
      { name: "description", content: "Manage your rewards, track your daily streaks, and watch your points balance grow on your Earn Pal dashboard. Your hub for all earning activities." },
      { property: "og:title", content: "Member Dashboard | Earn Pal" },
      { property: "og:description", content: "See your latest earnings, claim daily bonuses, and track your progress toward your next big reward." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://earnpal.lovable.app/logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
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


  const { data: featuredTasks } = useQuery({
    queryKey: ["featured-tasks"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data: tasks, error } = await supabase
        .from("tasks")
        .select(`
          *,
          task_submissions(status)
        `)
        .eq("is_active", true)
        .eq("is_featured", true)
        .limit(2);
      
      if (error) throw error;
      return tasks;
    }
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("points_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return data;
    },
  });

  const { data: balanceTrend } = useQuery({
    queryKey: ["balanceTrend"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { percentage: 0, isPositive: true };

      const now = new Date();
      const sevenDaysAgo = subDays(startOfDay(now), 7);
      const fourteenDaysAgo = subDays(startOfDay(now), 14);

      // Current week earnings
      const { data: currentWeekData } = await supabase
        .from("points_transactions")
        .select("amount")
        .eq("user_id", user.id)
        .eq("type", "earn")
        .gte("created_at", sevenDaysAgo.toISOString());

      // Previous week earnings
      const { data: previousWeekData } = await supabase
        .from("points_transactions")
        .select("amount")
        .eq("user_id", user.id)
        .eq("type", "earn")
        .gte("created_at", fourteenDaysAgo.toISOString())
        .lt("created_at", sevenDaysAgo.toISOString());

      const currentTotal = currentWeekData?.reduce((acc, tx) => acc + tx.amount, 0) || 0;
      const previousTotal = previousWeekData?.reduce((acc, tx) => acc + tx.amount, 0) || 0;

      if (previousTotal === 0) {
        return { percentage: currentTotal > 0 ? 100 : 0, isPositive: true };
      }

      const diff = currentTotal - previousTotal;
      const percentage = Math.round((Math.abs(diff) / previousTotal) * 100);
      
      return {
        percentage,
        isPositive: diff >= 0
      };
    },
  });

  const isClaimedToday = streak?.last_activity_at && new Date(streak.last_activity_at).toDateString() === new Date().toDateString();

  return (
    <div className="pb-12 px-4 md:px-10 max-w-7xl mx-auto space-y-8">
      <WelcomeBonusModal />
      
      
      {profile && profile.referred_by && !profile.has_claimed_welcome_bonus && (
        <Card className="border-none bg-amber-50 border border-amber-200 overflow-hidden relative">
          <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-amber-900 leading-tight">Bonus Pending</p>
                <p className="text-xs text-amber-700 font-medium">Complete your social handles in profile to claim your 50 points bonus!</p>
              </div>
            </div>
            <Button 
              size="sm" 
              className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold whitespace-nowrap"
              asChild
            >
              <Link to="/profile">Complete Profile</Link>
            </Button>
          </CardContent>
          <div className="absolute top-0 right-0 p-1">
            <Badge variant="outline" className="text-[8px] border-amber-300 text-amber-700 bg-amber-100/50 uppercase font-black">Referee Action Required</Badge>
          </div>
        </Card>
      )}
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Welcome back, {profile?.username ? (profile.username.charAt(0).toUpperCase() + profile.username.slice(1)) : profile?.full_name?.split(' ')[0] || 'User'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your rewards today.
        </p>
      </header>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* Main Balance Card - Inspired by Reference */}
        <Card className="lg:col-span-2 overflow-hidden border-none bg-primary text-primary-foreground shadow-lg shadow-primary/20 relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest opacity-70">Total Balance</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div className="space-y-1">
              <div className="text-5xl font-black tracking-tighter">
                {profile?.points_balance?.toLocaleString() || 0} <span className="text-xl opacity-60 ml-1">PTS</span>
              </div>
              <p className="text-sm font-medium opacity-80 flex items-center gap-1">
                {balanceTrend?.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-white" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-white/70" />
                )}
                {balanceTrend?.isPositive ? '+' : '-'}{balanceTrend?.percentage || 0}% from last week
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="rounded-xl font-bold px-6 h-11 bg-white text-primary hover:bg-white/90 border-none shadow-sm" asChild>
                <Link to="/earn" search={{ tab: 'tasks' }}>Start Earning</Link>
              </Button>
              <Button variant="outline" className="rounded-xl font-bold px-6 h-11 bg-white/10 border-white/20 hover:bg-white/20 text-white" asChild>
                <Link to="/redeem">Redeem</Link>
              </Button>
            </div>
          </CardContent>
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-10 pointer-events-none scale-150">
            <img src="/logo.png" alt="" className="h-40 w-40 object-contain rotate-12" />
          </div>
        </Card>

        {/* Daily Streak Card */}
        <Card className="border-none shadow-sm flex flex-col relative overflow-hidden bg-card group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Daily Streak</CardTitle>
              <div className="bg-orange-50 p-2 rounded-xl text-orange-600 group-hover:scale-110 transition-transform">
                <Clock className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 flex-1 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="text-3xl font-black tracking-tight">{streak?.current_streak || 0} Days</div>
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

      {featuredTasks && featuredTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              Featured Tasks
            </h2>
          </div>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {featuredTasks.map((task: any) => {
              const submission = task.task_submissions?.[0];
              const isCompleted = submission?.status === 'verified' || submission?.status === 'pending';
              
              return (
                <Card key={task.id} className="border-none shadow-sm overflow-hidden bg-card group relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="bg-primary/5 p-2 rounded-xl text-primary group-hover:scale-110 transition-transform">
                        <Zap className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="font-bold text-primary border-primary/20 bg-primary/5">
                        +{task.points} PTS
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="space-y-1 mb-6">
                      <CardTitle className="text-lg font-black tracking-tight">{task.title}</CardTitle>
                      <CardDescription className="text-xs font-medium line-clamp-2">{task.description}</CardDescription>
                    </div>
                    <Button 
                      className={cn(
                        "w-full rounded-xl font-bold h-11 transition-all",
                        isCompleted ? "bg-green-500/10 text-green-600 border-none shadow-none hover:bg-green-500/20" : "shadow-md shadow-primary/10"
                      )}
                      onClick={async () => {
                        if (isCompleted) return;
                        
                        const taskAny = task as any;
                        if (taskAny.link_url) {
                          window.open(taskAny.link_url, '_blank');
                        }
                        
                        // Navigate to earn page to complete task or show feedback
                        // Since we want the user to carry it out, we'll open the link and then they can verify on the earn page
                        // Or we could implement the verification logic here too.
                        // Let's keep it simple: open link and toast instruction.
                        toast.info("Task opened! Complete it and confirm on the Earn page to receive points.");
                      }}
                      disabled={isCompleted && submission?.status === 'verified'}
                    >
                      {isCompleted ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          {submission?.status === 'pending' ? 'Verifying...' : 'Task Completed'}
                        </div>
                      ) : (
                        <>
                          Start Task
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                  {task.is_featured && !isCompleted && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-tighter">
                        High Priority
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Recent Activity */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-black tracking-tight text-foreground">Recent Activity</h2>
            <Link to="/transactions" className="text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-widest transition-colors">View all</Link>
          </div>
          <Card className="border-none shadow-sm bg-card">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {recentTransactions?.length ? recentTransactions.map((tx: any) => (
                  <div 
                    key={tx.id} 
                    className="flex items-center justify-between p-4 group hover:bg-accent/5 transition-colors cursor-pointer"
                    onClick={() => {
                      toast.info(
                        <div className="space-y-2">
                          <p className="font-bold text-sm">Transaction Details</p>
                          <div className="text-xs space-y-1 font-medium">
                            <p><span className="text-muted-foreground uppercase text-[10px] font-black mr-2">Description:</span> {tx.description}</p>
                            <p><span className="text-muted-foreground uppercase text-[10px] font-black mr-2">Amount:</span> {tx.amount > 0 ? '+' : ''}{tx.amount} PTS</p>
                            <p><span className="text-muted-foreground uppercase text-[10px] font-black mr-2">Type:</span> {tx.type}</p>
                            <p><span className="text-muted-foreground uppercase text-[10px] font-black mr-2">Date:</span> {new Date(tx.created_at).toLocaleString()}</p>
                          </div>
                        </div>,
                        { duration: 5000 }
                      );
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2.5 rounded-xl transition-transform group-hover:scale-110",
                        tx.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                        tx.type === 'earn' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      )}>
                        {tx.status === 'pending' ? <Clock className="h-4 w-4" /> :
                         tx.type === 'earn' ? <TrendingUp className="h-4 w-4" /> : <Gift className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                          {tx.description}
                          {tx.status === 'pending' && <span className="ml-2 text-[8px] font-black uppercase text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">Pending</span>}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "text-sm font-black",
                      tx.status === 'pending' ? 'text-amber-600' :
                      tx.type === 'earn' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {tx.status === 'pending' ? "" : tx.type === 'earn' ? '+' : '-'}{tx.amount}
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
          <h2 className="text-xl font-black px-1 tracking-tight text-foreground">Earn More</h2>
          <div className="grid grid-cols-1 gap-4">
            <Card className="border-none shadow-sm bg-card p-4 space-y-1 group">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Lifetime Referrals</p>
              <p className="text-2xl font-black group-hover:text-primary transition-colors">{referralCount}</p>
            </Card>
          </div>

          <Card className="border-none shadow-sm bg-primary/5 border border-primary/10 p-6 space-y-4 overflow-hidden relative group">
            <div className="relative z-10 space-y-4">
              <div className="bg-primary w-fit p-2 rounded-xl text-primary-foreground shadow-md shadow-primary/20 group-hover:scale-110 transition-transform">
                <Share2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-lg text-foreground leading-tight">Invite your friends</h3>
                <p className="text-xs text-muted-foreground font-medium">Earn 50 points for every verified referral signup.</p>
              </div>
              <Button className="w-full rounded-xl font-bold shadow-sm" asChild>
                <Link to="/refer">Get Referral Link</Link>
              </Button>
            </div>
            <Share2 className="absolute -right-4 -bottom-4 h-24 w-24 text-primary/5 rotate-12" />
          </Card>
        </div>
      </div>
    </div>
  );
}

function RecentReferrersList() {
  const { data: referredUsers } = useQuery({
    queryKey: ["recentReferralsList"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("profiles")
        .select("full_name, username")
        .eq("referred_by", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  if (!referredUsers || referredUsers.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 py-1">
      {referredUsers.map((ref: any, i: number) => (
        <Badge key={i} variant="secondary" className="rounded-lg font-bold px-3 py-1 bg-primary/5 text-primary border-primary/10">
          {ref.full_name || ref.username}
        </Badge>
      ))}
      {(referredUsers.length >= 5) && (
        <Link to="/refer" className="text-[10px] font-black uppercase text-primary hover:underline flex items-center ml-2">
          View All
        </Link>
      )}
    </div>
  );
}

// Utility function (duplicated since it's used in components but defined in utils)
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}