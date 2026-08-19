import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Zap,
  Activity,
  History,
  Loader2
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function UserActivityFeed() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["user-activity"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_activity_logs" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'task_submitted':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'task_verified':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'reward_claimed':
        return <Zap className="h-4 w-4 text-primary" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Activity Feed
        </h2>
      </div>

      <Card className="border-none shadow-sm bg-card overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {activities?.length ? (
              activities.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 group hover:bg-accent/5 transition-colors">
                  <div className={cn(
                    "p-2.5 rounded-xl transition-transform group-hover:scale-110 shrink-0",
                    activity.type === 'task_verified' ? 'bg-green-50' : 
                    activity.type === 'task_submitted' ? 'bg-orange-50' : 'bg-primary/5'
                  )}>
                    {getIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-sm text-foreground truncate">{activity.title}</p>
                      <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap uppercase">
                        {format(new Date(activity.created_at), "MMM d, HH:mm")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{activity.description}</p>
                    {activity.points_earned > 0 && (
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                          <TrendingUp className="h-2.5 w-2.5" />
                          +{activity.points_earned} Points
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm font-medium">No activity recorded yet.</p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Complete tasks to see your progress here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
