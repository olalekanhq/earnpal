import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Coins, CheckCircle2, Star, Zap, Twitter, Youtube, MessageSquare, Clock, ShieldCheck, Loader2, Play } from "lucide-react";
import VastAdModal from "@/components/VastAdModal";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/earn")({
  head: () => ({
    meta: [
      { title: "Earn Points | Earn Pal" },
      { name: "description", content: "Complete tasks, watch ads, and participate in surveys to earn points on Earn Pal." },
      { property: "og:title", content: "Earn Points | Earn Pal" },
      { property: "og:description", content: "Unlock new ways to earn points every day." },
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
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [taskUiStates, setTaskUiStates] = useState<Record<string, 'idle' | 'verifying' | 'awaiting_confirmation' | 'submitting'>>({});
  const [activeVastTask, setActiveVastTask] = useState<any | null>(null);

  const { data: tasks, isLoading, refetch: refetchTasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: tasksData } = await supabase.from("tasks" as any).select("*").eq("is_active", true);
      const { data: submissions } = await supabase.from("task_submissions" as any).select("task_id, status").eq("user_id", user.id);
      const { data: videoProgress } = await supabase.from("video_ad_progress").select("task_id, watch_count").eq("user_id", user.id);
      
      const submissionsMap = new Map((submissions as any)?.map((s: any) => [s.task_id, s.status]));
      const progressMap = new Map((videoProgress as any)?.map((p: any) => [p.task_id, p.watch_count]));
      
      return (tasksData as any)?.map((task: any) => ({
        ...task,
        status: submissionsMap.get(task.id) || null,
        watch_count: progressMap.get(task.id) || 0
      })) || [];
    },
  });

  const categories = [
    { name: "All", icon: Star },
    { name: "Social", icon: MessageSquare },
    { name: "Surveys", icon: Zap },
    { name: "Videos", icon: Youtube },
  ];

  const filteredTasks = activeCategory === "All" 
    ? tasks 
    : (tasks as any[])?.filter((t: any) => t.category === activeCategory);

  return (
    <div className="pb-12 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Earn Points
          </h1>
          <p className="text-muted-foreground font-medium">
            Complete simple tasks to earn points and level up.
          </p>
        </div>
      </header>

      <div className="space-y-8">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
          {categories.map((cat) => (
            <Button 
              key={cat.name} 
              variant={activeCategory === cat.name ? 'default' : 'outline'} 
              className={cn(
                "rounded-xl font-bold h-10 px-6 shrink-0 transition-all",
                activeCategory === cat.name ? "shadow-md shadow-primary/20" : "bg-card border-none shadow-sm"
              )}
              onClick={() => setActiveCategory(cat.name)}
            >
              <cat.icon className={cn("mr-2 h-4 w-4", activeCategory === cat.name ? "text-primary-foreground" : "text-primary")} />
              {cat.name}
            </Button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks?.length ? (filteredTasks as any[]).map((task: any) => (
            <Card key={task.id} className="group border-none shadow-sm bg-card overflow-hidden flex flex-col transition-all hover:shadow-md">
              <div className="h-1.5 w-full bg-primary/10 group-hover:bg-primary transition-colors" />
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="secondary" className="bg-primary/5 text-primary border-none rounded-lg px-2.5 py-0.5 font-bold uppercase text-[10px]">
                    {task.category}
                  </Badge>
                  <div className="flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-lg">
                    <Coins className="h-3 w-3 text-green-600" />
                    <span className="text-green-600 font-bold text-xs">{task.points}</span>
                  </div>
                </div>
                <CardTitle className="text-lg font-black group-hover:text-primary transition-colors">{task.title}</CardTitle>
                <CardDescription className="text-sm font-medium line-clamp-2 mt-1">{task.description}</CardDescription>
                {task.category === 'Videos' && task.video_ad_count > 0 && task.status !== 'verified' && (
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <span>Progress</span>
                      <span>{task.watch_count || 0} / {task.video_ad_count} Ads</span>
                    </div>
                    <div className="w-full bg-primary/10 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, ((task.watch_count || 0) / task.video_ad_count) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground italic font-medium">Earn {task.points} points after {task.video_ad_count} watches.</p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="mt-auto pt-0 pb-6 px-6">
                <div className="flex items-center gap-4 mb-6 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    <span>~5 mins</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Verified</span>
                  </div>
                </div>
                <Button 
                  className="w-full rounded-xl font-bold h-11 shadow-sm group-hover:shadow-md transition-all"
                  disabled={task.status === 'verified' || task.status === 'pending' || completingTaskId === task.id || taskUiStates[task.id] === 'submitting'}
                  onClick={async () => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    // Special handling for video tasks
                    if (task.category === 'Videos' && task.video_ad_count > 0) {
                      if (task.vast_tag_url) {
                        const event = new CustomEvent('play-interstitial-ad', {
                          detail: {
                            vastUrl: task.vast_tag_url,
                            onComplete: async () => {
                              const { data: { user } } = await supabase.auth.getUser();
                              if (!user) return;

                              const { data, error } = await (supabase.rpc as any)('record_video_watch', {
                                _user_id: user.id,
                                _task_id: task.id
                              });

                              if (error) {
                                console.error('Error recording watch:', error);
                                toast.error(error.message);
                              } else {
                                const res = data as any;
                                console.log('Watch recorded:', res);
                                if (res.completed) {
                                  toast.success(res.message);
                                  queryClient.invalidateQueries({ queryKey: ["profile"] });
                                } else {
                                  toast.success(res.message);
                                }
                                refetchTasks();
                              }
                            }
                          }
                        });
                        window.dispatchEvent(event);
                        return;
                      }

                      setCompletingTaskId(task.id);
                      
                      const { data, error } = await (supabase.rpc as any)('record_video_watch', {
                        _user_id: user.id,
                        _task_id: task.id
                      });

                      if (error) {
                        toast.error(error.message);
                      } else if (data && !(data as any).success) {
                        toast.error((data as any).message);
                      } else {
                        const res = data as any;
                        if (res.completed) {
                          toast.success(res.message);
                          queryClient.invalidateQueries({ queryKey: ["profile"] });
                        } else {
                          toast.success(res.message);
                        }
                        refetchTasks();
                      }
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
                  ) : (
                    "Start Earning"
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
