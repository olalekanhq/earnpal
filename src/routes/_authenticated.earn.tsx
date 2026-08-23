import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Coins, CheckCircle2, Star, Zap, Twitter, Youtube, MessageSquare, Clock, ShieldCheck, Loader2, Play, CheckCircle, XCircle } from "lucide-react";
import VastAdModal from "@/components/VastAdModal";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/earn")({
  head: () => ({
    title: "Earn Points | Tasks, Ads & Surveys | Earn Pal",
    meta: [
      { name: "description", content: "Discover multiple ways to earn points on Earn Pal. Complete social media tasks, watch video ads, and participate in surveys to boost your balance today." },
      { property: "og:title", content: "Earn Points | Tasks & Rewards | Earn Pal" },
      { property: "og:description", content: "Unlock daily earning opportunities. Complete simple tasks and watch your points grow in real-time." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://earnpal.lovable.app/logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EarnPage,
});

function EarnPage() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeStatus, setActiveStatus] = useState<"available" | "in_progress" | "completed" | "rejected">("available");
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [taskUiStates, setTaskUiStates] = useState<Record<string, 'idle' | 'verifying' | 'awaiting_confirmation' | 'submitting'>>({});
  const [activeVastTask, setActiveVastTask] = useState<any | null>(null);

  const { data: tasks, isLoading, refetch: refetchTasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: tasksData } = await supabase
        .from("tasks" as any)
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      const { data: submissions } = await supabase.from("task_submissions" as any).select("task_id, status, admin_note, created_at").eq("user_id", user.id);
      const { data: videoProgress } = await supabase.from("video_ad_progress").select("task_id, watch_count").eq("user_id", user.id);
      
      const submissionsMap = new Map((submissions as any)?.map((s: any) => [s.task_id, { status: s.status, admin_note: s.admin_note, created_at: s.created_at }]));
      const progressMap = new Map((videoProgress as any)?.map((p: any) => [p.task_id, p.watch_count]));
      
      return (tasksData as any)
        ?.map((task: any) => {
          const submission = submissionsMap.get(task.id) as { status: string; admin_note: string; created_at: string } | undefined;
          return {
            ...task,
            status: submission?.status || null,
            admin_note: submission?.admin_note || null,
            submission_date: submission?.created_at || null,
            watch_count: progressMap.get(task.id) || 0
          };
        }) || [];
    },
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

  const { data: socialCheck } = useQuery({
    queryKey: ["social-verification"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { complete: false, missing: [] as string[] };

      const { data: profile } = await supabase
        .from("profiles")
        .select("twitter_handle, telegram_handle, instagram_handle, facebook_handle")
        .eq("id", user.id)
        .single();

      const { data: settings } = await (supabase.from("app_settings" as any) as any)
        .select("value")
        .eq("key", "welcome_bonus_required_socials")
        .single();

      const required = (settings?.value as string[]) || [];
      const missing = required.filter((social: string) => {
        const val = (profile as any)?.[`${social}_handle`];
        return !val || !String(val).trim();
      });

      return { complete: missing.length === 0, missing };
    },
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const socialLocked = socialCheck ? !socialCheck.complete : false;


  const categories = [
    { name: "All", icon: Star },
    { name: "Social", icon: MessageSquare },
    { name: "Surveys", icon: Zap },
    { name: "Videos", icon: Youtube },
  ];

  const filteredTasks = (tasks as any[])?.filter((t: any) => {
    const isVerifiedToday = t.status === "verified" && t.submission_date && new Date(t.submission_date).getUTCDate() === new Date().getUTCDate();
    const isCompletedNonRepeatable = t.status === "verified" && !t.is_repeatable;
    const isPending = t.status === "pending";
    const isRejected = t.status === "rejected";
    
    let matchesStatus = false;
    if (activeStatus === "completed") {
      matchesStatus = t.status === "verified";
    } else if (activeStatus === "in_progress") {
      matchesStatus = isPending;
    } else if (activeStatus === "rejected") {
      matchesStatus = isRejected;
    } else {
      // Available: not pending, not completed today, and (repeatable or never completed)
      matchesStatus = !isPending && !isVerifiedToday && !isCompletedNonRepeatable;
    }

    const matchesCategory = activeStatus !== "available" || activeCategory === "All" || t.category === activeCategory;
    return matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-8 w-full">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Earn Points
          </h1>
          <p className="text-muted-foreground font-medium">
            Complete tasks to earn points and level up your account.
          </p>
        </div>
      </header>

      {socialLocked && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-foreground">Complete your social profile to unlock tasks</p>
            <p className="text-xs text-muted-foreground mt-1">Add your required social handles in your profile to start earning points.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg font-bold h-8 px-3 shrink-0"
            onClick={() => window.location.href = "/profile"}
          >
            Go to Profile
          </Button>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div className="flex p-1 bg-card rounded-2xl shadow-sm w-fit border border-primary/5">
            <button
              onClick={() => setActiveStatus("available")}
              className={cn(
                "px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap",
                activeStatus === "available" 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Available
            </button>
            <button
              onClick={() => setActiveStatus("in_progress")}
              className={cn(
                "px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap",
                activeStatus === "in_progress" 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              In Progress
            </button>
            <button
              onClick={() => setActiveStatus("completed")}
              className={cn(
                "px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap",
                activeStatus === "completed" 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveStatus("rejected")}
              className={cn(
                "px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap",
                activeStatus === "rejected" 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Rejected
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {activeStatus === "available" && categories.map((cat) => (
              <Button 
                key={cat.name} 
                variant={activeCategory === cat.name ? 'default' : 'ghost'} 
                className={cn(
                  "rounded-xl font-bold h-10 px-4 shrink-0 transition-all",
                  activeCategory === cat.name ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:bg-muted"
                )}
                onClick={() => setActiveCategory(cat.name)}
              >
                <cat.icon className={cn("mr-2 h-4 w-4", activeCategory === cat.name ? "text-primary" : "text-muted-foreground")} />
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-7xl mx-auto px-1">
          {filteredTasks?.length ? (filteredTasks as any[]).map((task: any) => (
            <Card key={task.id} className="group border-none shadow-sm bg-card overflow-hidden flex flex-col transition-all hover:shadow-md w-[94%] mx-auto md:w-full">
              <div className="h-1 w-full bg-primary/10 group-hover:bg-primary transition-colors" />
              <CardHeader className="p-5 sm:p-4 pb-2 sm:pb-4">
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                  <Badge variant="secondary" className="bg-primary/5 text-primary border-none rounded-lg px-1.5 sm:px-2.5 py-0.5 font-bold uppercase text-[10px]">
                    {task.category}
                  </Badge>
                  <div className="flex items-center gap-0.5 sm:gap-1 bg-green-500/10 px-1.5 sm:px-2 py-0.5 rounded-lg">
                    <Coins className="h-2.5 w-2.5 sm:h-3 sm:h-3 text-green-600" />
                    <span className="text-green-600 font-bold text-[10px] sm:text-xs">{task.points}</span>
                  </div>
                </div>
                <CardTitle className="text-[15px] sm:text-lg font-black group-hover:text-primary transition-colors line-clamp-1 leading-tight">{task.title}</CardTitle>
                <CardDescription className="text-[11px] sm:text-sm font-medium line-clamp-2 mt-0.5 sm:mt-1">{task.description}</CardDescription>
                
                {task.status === 'rejected' && task.admin_note && (
                  <div className="mt-3 p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                    <p className="text-[10px] font-black uppercase text-destructive tracking-widest mb-1">Rejection Reason:</p>
                    <p className="text-[11px] font-medium text-destructive/80 leading-tight">{task.admin_note}</p>
                  </div>
                )}
                {task.category === 'Videos' && task.video_ad_count > 0 && task.status !== 'verified' && (
                  <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2">
                    <div className="flex justify-between text-[8px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest text-muted-foreground">
                      <span>Progress</span>
                      <span>{task.watch_count || 0}/{task.video_ad_count}</span>
                    </div>
                    <div className="w-full bg-primary/10 h-1 sm:h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, ((task.watch_count || 0) / task.video_ad_count) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[8px] sm:text-[10px] text-muted-foreground italic font-medium hidden xs:block">Earn {task.points} pts after {task.video_ad_count} watches.</p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="mt-auto pt-0 pb-3 sm:pb-6 px-3 sm:px-6">
                <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-6 text-[9px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:h-3" />
                    <span>~5m</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <ShieldCheck className="h-2.5 w-2.5 sm:h-3 sm:h-3" />
                    <span>Ver.</span>
                  </div>
                </div>
                <Button
                  className="w-full rounded-xl font-bold h-10 sm:h-11 text-xs sm:text-sm shadow-sm group-hover:shadow-md transition-all px-2"
                  title={socialLocked ? "Complete your social profile to unlock tasks" : undefined}
                  disabled={socialLocked || dailyLimitReached || task.status === 'pending' || completingTaskId === task.id || taskUiStates[task.id] === 'submitting'}
                  onClick={async () => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    // Fetch profile to check social completion
                    const { data: profile } = await supabase
                      .from("profiles")
                      .select("twitter_handle, telegram_handle, instagram_handle, facebook_handle")
                      .eq("id", user.id)
                      .single();

                    // Fetch required socials from app_settings
                    const { data: settings } = await (supabase.from("app_settings" as any) as any)
                      .select("value")
                      .eq("key", "welcome_bonus_required_socials")
                      .single();
                    
                    const required = (settings?.value as string[]) || [];
                    const missing = required.filter(social => {
                      const handleKey = `${social}_handle`;
                      return !(profile as any)?.[handleKey];
                    });

                    if (missing.length > 0) {
                      toast.error(`Please complete your ${missing.join(", ")} handles in your profile before performing tasks.`, {
                        action: {
                          label: "Go to Profile",
                          onClick: () => window.location.href = "/profile"
                        }
                      });
                      return;
                    }

                    // Special handling for video tasks
                    if (task.category === 'Videos' && task.video_ad_count > 0) {
                      // Start a server-issued watch session before any ad plays
                      const { data: sessionData, error: sessionError } = await (supabase.rpc as any)('start_video_watch_session', {
                        _user_id: user.id,
                        _task_id: task.id
                      });

                      if (sessionError) {
                        toast.error(sessionError.message);
                        return;
                      }
                      if (!(sessionData as any)?.success) {
                        toast.error((sessionData as any)?.message || 'Unable to start ad session.');
                        return;
                      }

                      const sessionId = (sessionData as any).session_id as string;
                      const minWatchSeconds = ((sessionData as any).min_watch_seconds as number) ?? 10;

                      const recordWatch = async () => {
                        const { data, error } = await (supabase.rpc as any)('record_video_watch', {
                          _user_id: user.id,
                          _task_id: task.id,
                          _session_id: sessionId
                        });

                        if (error) {
                          console.error('Error recording watch:', error);
                          toast.error(error.message);
                        } else if (data && !(data as any).success) {
                          toast.error((data as any).message);
                        } else {
                          const res = data as any;
                          if (res.completed) {
                            toast.success(res.message);
                            queryClient.invalidateQueries({ queryKey: ["profile"] });
                            queryClient.invalidateQueries({ queryKey: ["daily-task-stats"] });
                          } else {
                            toast.success(res.message);
                          }
                          refetchTasks();
                        }
                      };

                      if (task.vast_tag_url) {
                        const event = new CustomEvent('play-interstitial-ad', {
                          detail: {
                            vastUrl: task.vast_tag_url,
                            onComplete: recordWatch
                          }
                        });
                        window.dispatchEvent(event);
                        return;
                      }

                      setCompletingTaskId(task.id);
                      toast.info(`Ad playing… please keep this tab open for ${minWatchSeconds} seconds.`);
                      await new Promise(resolve => setTimeout(resolve, minWatchSeconds * 1000));
                      await recordWatch();
                      setCompletingTaskId(null);
                      return;
                    }

                    const currentUiState = taskUiStates[task.id] || 'idle';
                    
                    if (currentUiState === 'idle') {
                      const taskAny = task as any;
                      if (taskAny.link_url) {
                        window.open(taskAny.link_url, '_blank');
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
                      setCompletingTaskId(task.id);
                      
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
                        refetchTasks();
                        queryClient.invalidateQueries({ queryKey: ["profile"] });
                        queryClient.invalidateQueries({ queryKey: ["daily-task-stats"] });
                        setTaskUiStates(prev => ({ ...prev, [task.id]: 'idle' }));
                      }
                      setCompletingTaskId(null);
                    }
                  }}
                >
                  {task.status === 'verified' ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Completed
                    </>
                  ) : task.status === 'pending' ? (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Verifying...
                    </>
                  ) : (task.category === 'Videos' && task.video_ad_count > 0) ? (
                    completingTaskId === task.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      `Watch Ad (${task.watch_count || 0}/${task.video_ad_count})`
                    )
                  ) : (taskUiStates[task.id] === 'verifying') ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (taskUiStates[task.id] === 'awaiting_confirmation') ? (
                    "Confirm Completion"
                  ) : (taskUiStates[task.id] === 'submitting' || completingTaskId === task.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : task.status === 'rejected' ? (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Try Again
                    </>
                  ) : (
                    dailyLimitReached ? "Daily Limit Reached" : "Start Earning"
                  )}
                </Button>
              </CardContent>
            </Card>
          )) : !isLoading && (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="bg-card w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-sm text-primary/20">
                <Coins className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-foreground">No tasks available</p>
                <p className="text-sm text-muted-foreground font-medium">Check back later for new earning opportunities.</p>
              </div>
            </div>
          )}
          
          {isLoading && Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-none shadow-sm bg-card h-[280px] animate-pulse">
              <div className="h-1.5 w-full bg-muted/50" />
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-muted rounded" />
                  <div className="h-4 w-12 bg-muted rounded" />
                </div>
                <div className="h-6 w-3/4 bg-muted rounded" />
                <div className="h-16 w-full bg-muted rounded" />
                <div className="h-10 w-full bg-muted rounded mt-auto" />
              </div>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}
