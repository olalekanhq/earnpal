import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Coins, Gift, Share2, TrendingUp, TrendingDown, Clock, ChevronRight, Award, Zap, Star, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { subDays, startOfDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    title: "Member Dashboard | My Earnings & Progress | Noble Gain",
    meta: [
      { name: "description", content: "Manage your rewards, track your daily streaks, and watch your points balance grow on your Noble Gain dashboard. Your hub for all earning activities." },
      { property: "og:title", content: "Member Dashboard | Noble Gain" },
      { property: "og:description", content: "See your latest earnings, claim daily bonuses, and track your progress toward your next big reward." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://noblegain.lovable.app/logo.png" },
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

  const { data: dailyStats } = useQuery({
    queryKey: ["daily-task-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { daily_count: 0 };
      
      const { data, error } = await supabase
        .from("user_daily_task_counts" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) console.error('Error fetching daily stats:', error);
      return (data as any) || { daily_count: 0 };
    }
  });

  const dailyLimitReached = (dailyStats?.daily_count || 0) >= 10;

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
      queryClient.invalidateQueries({ queryKey: ["daily-task-stats"] });
      toast.success(result.message || `Daily bonus claimed! +${result.points} points`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to claim reward.");
    }
  });

  // Welcome bonus claim logic removed as it is now automatic on registration
  const claimWelcomeBonus = {
    isPending: false,
    isSuccess: false,
    mutate: () => {
      toast.info("Your welcome bonus is automatically credited upon registration!");
    }
  };



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

  const firstName = profile?.username
    ? profile.username.charAt(0).toUpperCase() + profile.username.slice(1)
    : profile?.full_name?.split(" ")[0] || "User";

  return (
    <div className="w-full space-y-10">
      {/* ---------- Hero ---------- */}
      <section className="ink-glow relative overflow-hidden rounded-3xl ink-panel">
        <div className="ink-dots absolute inset-0 opacity-40 pointer-events-none" />
        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-end sm:justify-between">
            <div className="min-w-0 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                Member Dashboard
              </p>
              <h1 className="truncate text-2xl font-black tracking-tight text-foreground sm:text-4xl">
                Welcome back, {firstName}
              </h1>
              <p className="text-sm font-medium text-muted-foreground">
                Here's what's happening with your rewards today.
              </p>
            </div>
            <Badge
              variant="outline"
              className="shrink-0 gap-1.5 rounded-full border-primary/25 bg-primary/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary"
            >
              <Sparkles className="h-3 w-3" />
              {streak?.current_streak || 0} day streak
            </Badge>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {/* Balance */}
            <div className="relative overflow-hidden rounded-2xl border border-hairline bg-card/70 p-6 backdrop-blur-sm lg:col-span-2">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                    Total balance
                  </p>
                  <span className="rounded-full border border-hairline p-2 text-primary">
                    <Coins className="h-4 w-4" />
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl">
                      {profile?.points_balance?.toLocaleString() || 0}
                    </span>
                    <span className="pb-1.5 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                      pts
                    </span>
                  </div>
                  <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                    {balanceTrend?.isPositive ? (
                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                    )}
                    {balanceTrend?.isPositive ? "+" : "-"}
                    {balanceTrend?.percentage || 0}% from last week
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button className="h-11 rounded-xl px-6 font-bold" asChild>
                    <Link to="/earn" search={{ tab: "tasks" }}>Start Earning</Link>
                  </Button>
                  <Button variant="outline" className="h-11 rounded-xl border-hairline px-6 font-bold" asChild>
                    <Link to="/redeem">Redeem</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Daily streak */}
            <div className="flex flex-col justify-between gap-6 rounded-2xl border border-hairline bg-card/70 p-6 backdrop-blur-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                    Daily streak
                  </p>
                  <span className="rounded-full border border-hairline p-2 text-primary">
                    <Clock className="h-4 w-4" />
                  </span>
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tight text-foreground">
                    {streak?.current_streak || 0} <span className="text-base font-bold text-muted-foreground">days</span>
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                    Claim daily to earn bonus points
                  </p>
                </div>
                <Progress value={Math.min(((streak?.current_streak || 0) % 7) * (100 / 7), 100)} className="h-1.5" />
              </div>
              <Button
                className={cn(
                  "h-12 w-full rounded-xl font-bold transition-all",
                  isClaimedToday && "bg-muted text-muted-foreground shadow-none hover:bg-muted cursor-default"
                )}
                disabled={isClaimedToday || claimDailyStreak.isPending}
                onClick={() => claimDailyStreak.mutate()}
              >
                {claimDailyStreak.isPending
                  ? "Claiming..."
                  : isClaimedToday
                    ? "Claimed today"
                    : "Claim Daily Reward"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Featured tasks ---------- */}
      {featuredTasks && featuredTasks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-black tracking-tight text-foreground sm:text-xl">
              <Star className="h-4 w-4 fill-primary text-primary" />
              Featured tasks
            </h2>
            <Link
              to="/earn"
              search={{ tab: "tasks" }}
              className="text-[10px] font-black uppercase tracking-[0.18em] text-primary transition-colors hover:text-primary/80"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {featuredTasks.map((task: any) => {
              const submission = task.task_submissions?.[0];
              const isCompleted = submission?.status === "verified" || submission?.status === "pending";

              return (
                <div
                  key={task.id}
                  className="group relative overflow-hidden rounded-2xl border border-hairline bg-card p-5 transition-all hover:border-primary/30 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-xl border border-hairline bg-primary/5 p-2 text-primary transition-transform group-hover:scale-110">
                      <Zap className="h-4 w-4" />
                    </span>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {(task as any).is_repeatable && (
                        <Badge variant="outline" className="rounded-full border-hairline text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                          Daily
                        </Badge>
                      )}
                      <Badge className="rounded-full bg-primary/10 text-[10px] font-black text-primary hover:bg-primary/10">
                        +{task.points} PTS
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-5 space-y-1">
                    <h3 className="line-clamp-1 text-[15px] font-black tracking-tight text-foreground sm:text-base">
                      {task.title}
                    </h3>
                    <p className="line-clamp-2 text-xs font-medium text-muted-foreground">
                      {task.description}
                    </p>
                  </div>

                  <Button
                    variant={isCompleted || dailyLimitReached ? "outline" : "default"}
                    className={cn(
                      "mt-5 h-11 w-full rounded-xl text-xs font-bold sm:text-sm",
                      (isCompleted || dailyLimitReached) && "border-hairline text-muted-foreground"
                    )}
                    onClick={async () => {
                      if (isCompleted || dailyLimitReached) return;

                      const taskAny = task as any;
                      if (taskAny.link_url) {
                        window.open(taskAny.link_url, "_blank");
                      }

                      toast.info("Task opened! Complete it and confirm on the Earn page to receive points.");
                    }}
                    disabled={(isCompleted && submission?.status === "verified") || (!isCompleted && dailyLimitReached)}
                  >
                    {isCompleted ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        {submission?.status === "pending" ? "Verifying..." : "Task completed"}
                      </span>
                    ) : dailyLimitReached ? (
                      <span className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Limit reached
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        Start
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>

                  {task.is_featured && !isCompleted && (
                    <div className="absolute right-0 top-0 rounded-bl-xl bg-primary px-2 py-0.5 text-[9px] font-black uppercase tracking-tight text-primary-foreground">
                      Priority
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------- Activity + Earn more ---------- */}
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black tracking-tight text-foreground sm:text-xl">Recent activity</h2>
            <Link
              to="/transactions"
              className="text-[10px] font-black uppercase tracking-[0.18em] text-primary transition-colors hover:text-primary/80"
            >
              View all
            </Link>
          </div>
          <Card className="overflow-hidden rounded-2xl border border-hairline bg-card shadow-none">
            <CardContent className="p-0">
              <div className="divide-y divide-border/60">
                {recentTransactions?.length ? recentTransactions.map((tx: any) => (
                  <div
                    key={tx.id}
                    className="group flex cursor-pointer items-center justify-between gap-3 p-4 transition-colors hover:bg-accent/40"
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
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="shrink-0 rounded-xl border border-hairline p-2.5 text-primary transition-transform group-hover:scale-110">
                        {tx.status === 'pending' ? <Clock className="h-4 w-4" /> :
                         tx.type === 'earn' ? <TrendingUp className="h-4 w-4" /> : <Gift className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">
                          {tx.description}
                          {tx.status === 'pending' && (
                            <span className="ml-2 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-black uppercase text-accent-foreground">
                              Pending
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "shrink-0 text-sm font-black tabular-nums",
                        tx.status === 'pending' ? 'text-muted-foreground' :
                        tx.type === 'earn' ? 'text-primary' : 'text-destructive'
                      )}
                    >
                      {tx.status === 'pending' ? "" : tx.type === 'earn' ? '+' : '-'}{tx.amount}
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center gap-2 py-14 text-center">
                    <Award className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">No recent activity yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-4">
          <h2 className="text-lg font-black tracking-tight text-foreground sm:text-xl">Earn more</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
            <div className="flex flex-col justify-center gap-1 rounded-2xl border border-hairline bg-card p-5">
              <p className="text-[10px] font-black uppercase leading-tight tracking-[0.18em] text-muted-foreground">
                Lifetime referrals
              </p>
              <p className="text-3xl font-black tracking-tight text-foreground">{referralCount}</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-hairline bg-primary/5 p-5">
              <Share2 className="pointer-events-none absolute -bottom-3 -right-3 h-16 w-16 rotate-12 text-primary/10" />
              <div className="relative z-10 space-y-3">
                <span className="block w-fit rounded-xl bg-primary p-2 text-primary-foreground">
                  <Share2 className="h-4 w-4" />
                </span>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black leading-tight text-foreground">Invite friends</h3>
                  <p className="text-[10px] font-medium leading-tight text-muted-foreground">
                    Earn 50 pts per referral.
                  </p>
                </div>
                <Button size="sm" className="h-9 w-full rounded-xl text-[10px] font-black uppercase tracking-[0.16em]" asChild>
                  <Link to="/refer">Invite</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
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
