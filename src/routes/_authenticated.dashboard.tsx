import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Coins, Gift, Share2, TrendingUp, Clock, ChevronRight, Award, Zap, Star, CheckCircle2, ShieldCheck, ListTodo, Info, Loader2, ArrowRight, History } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import { UserActivityFeed } from "@/components/UserActivityFeed";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    title: "My Dashboard | Earn Pal — Reward Your Time",
    meta: [
      { name: "description", content: "Track your rewards, daily streaks, and points balance on your Earn Pal dashboard." },
      { property: "og:title", content: "My Dashboard | Earn Pal" },
      { property: "og:description", content: "Check your progress and redeem points for amazing prizes." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `https://earnpal.lovable.app/api/public/og?title=Dashboard&description=Track your rewards and streaks.` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskUiStates, setTaskUiStates] = useState<Record<string, 'idle' | 'verifying' | 'awaiting_confirmation' | 'submitting'>>({});
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
      const { data } = await supabase
        .from("points_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      return data;
    },
  });

  const isClaimedToday = streak?.last_activity_at && new Date(streak.last_activity_at).toDateString() === new Date().toDateString();

  const handleTaskAction = async (task: any) => {
    const currentUiState = taskUiStates[task.id] || 'idle';
    
    if (currentUiState === 'idle') {
      if (task.link_url) {
        window.open(task.link_url, '_blank');
      }
      
      setTaskUiStates(prev => ({ ...prev, [task.id]: 'verifying' }));
      
      // Wait for 5 seconds before allowing confirmation
      setTimeout(() => {
        setTaskUiStates(prev => ({ ...prev, [task.id]: 'awaiting_confirmation' }));
      }, 5000);
      return;
    }

    if (currentUiState === 'awaiting_confirmation') {
      setTaskUiStates(prev => ({ ...prev, [task.id]: 'submitting' }));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await (supabase.rpc as any)('submit_task', {
        _user_id: user.id,
        _task_id: task.id
      });

      if (error) {
        toast.error(error.message);
        setTaskUiStates(prev => ({ ...prev, [task.id]: 'awaiting_confirmation' }));
      } else if (data && !(data as any).success) {
        toast.error((data as any).message);
        setTaskUiStates(prev => ({ ...prev, [task.id]: 'awaiting_confirmation' }));
      } else {
        toast.success((data as any)?.message || "Task submitted!");
        queryClient.invalidateQueries({ queryKey: ["featured-tasks"] });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        setTaskUiStates(prev => ({ ...prev, [task.id]: 'idle' }));
        setIsTaskModalOpen(false);
      }
    }
  };

  return (
    <div className="pt-6 pb-12 px-4 md:px-10 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Welcome back, {profile?.username ? (profile.username.charAt(0).toUpperCase() + profile.username.slice(1)) : profile?.full_name?.split(' ')[0] || 'User'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your rewards today.
        </p>
      </header>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
                      onClick={() => {
                        setSelectedTask(task);
                        setIsTaskModalOpen(true);
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
                          View Task
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
        {/* Activity Feed */}
        <div className="lg:col-span-8">
          <UserActivityFeed />
        </div>

        {/* Quick Stats & Promo */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-xl font-black px-1 tracking-tight text-foreground">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-none shadow-sm bg-card p-4 space-y-1 group">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Referrals</p>
              <p className="text-2xl font-black group-hover:text-primary transition-colors">{referralCount}</p>
            </Card>
            <Card className="border-none shadow-sm bg-card p-4 space-y-1 group">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rank</p>
              <p className="text-2xl font-black group-hover:text-primary transition-colors">#{Math.floor(Math.random() * 100) + 1}</p>
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

      {/* Task Details Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="rounded-2xl max-w-md border-none shadow-2xl">
          {selectedTask && (
            <>
              <DialogHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-primary/5 text-primary border-none rounded-lg px-2.5 py-0.5 font-bold uppercase text-[10px]">
                    {selectedTask.category}
                  </Badge>
                  <div className="flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-xl">
                    <Coins className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-green-600 font-black text-sm">+{selectedTask.points} PTS</span>
                  </div>
                </div>
                <DialogTitle className="text-2xl font-black tracking-tight leading-tight">
                  {selectedTask.title}
                </DialogTitle>
                <DialogDescription className="text-sm font-medium leading-relaxed">
                  {selectedTask.description}
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-6">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <ListTodo className="h-3 w-3" />
                    How to complete
                  </h4>
                  <div className="grid gap-3">
                    <div className="flex gap-3 items-start p-3 rounded-xl bg-accent/50 border border-border/50">
                      <div className="bg-primary text-primary-foreground text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">1</div>
                      <p className="text-xs font-medium">Click the link below to visit the external task page.</p>
                    </div>
                    <div className="flex gap-3 items-start p-3 rounded-xl bg-accent/50 border border-border/50">
                      <div className="bg-primary text-primary-foreground text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">2</div>
                      <p className="text-xs font-medium">Carry out the required action (e.g. follow, subscribe, survey).</p>
                    </div>
                    <div className="flex gap-3 items-start p-3 rounded-xl bg-accent/50 border border-border/50">
                      <div className="bg-primary text-primary-foreground text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">3</div>
                      <p className="text-xs font-medium">Return here and click "Confirm Completion" to claim your points.</p>
                    </div>
                  </div>
                </div>

                {selectedTask.verification_required && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700">
                    <Info className="h-4 w-4 shrink-0" />
                    <p className="text-[11px] font-bold">This task requires manual verification. Points may take up to 24h to appear.</p>
                  </div>
                )}
              </div>

              <DialogFooter className="flex-col sm:flex-col gap-2">
                <Button 
                  className={cn(
                    "w-full rounded-xl font-black h-12 uppercase tracking-widest text-xs",
                    (selectedTask.task_submissions?.[0]?.status === 'verified' || selectedTask.task_submissions?.[0]?.status === 'pending') 
                      ? "bg-green-500/10 text-green-600 border-none hover:bg-green-500/20" 
                      : "shadow-lg shadow-primary/20"
                  )}
                  onClick={() => handleTaskAction(selectedTask)}
                  disabled={
                    selectedTask.task_submissions?.[0]?.status === 'verified' || 
                    taskUiStates[selectedTask.id] === 'submitting'
                  }
                >
                  {selectedTask.task_submissions?.[0]?.status === 'verified' ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Task Completed
                    </>
                  ) : selectedTask.task_submissions?.[0]?.status === 'pending' ? (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Verifying...
                    </>
                  ) : taskUiStates[selectedTask.id] === 'verifying' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : taskUiStates[selectedTask.id] === 'awaiting_confirmation' ? (
                    "Confirm Completion"
                  ) : (
                    <>
                      Start Task
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full rounded-xl font-bold h-10 text-muted-foreground"
                  onClick={() => setIsTaskModalOpen(false)}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Utility function (duplicated since it's used in components but defined in utils)
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}