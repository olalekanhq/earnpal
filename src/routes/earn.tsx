import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Coins, CheckCircle2, Star, Zap, Twitter, Youtube, MessageSquare, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const Route = createFileRoute("/earn")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const { data: { session: retrySession } } = await supabase.auth.getSession();
      if (!retrySession) throw redirect({ to: "/auth", search: { redirect: window.location.pathname } });
    }
  },
  component: EarnPage,
});

function EarnPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*").eq("is_active", true);
      return data || [];
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
    : tasks?.filter(t => t.category === activeCategory);

  return (
    <div className="pb-12 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground">Earn Points</h1>
          <p className="text-muted-foreground font-medium">Complete simple tasks to earn points and level up.</p>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
        {categories.map((cat) => (
          <Button 
            key={cat.name} 
            variant={activeCategory === cat.name ? 'default' : 'outline'} 
            className={cn(
              "rounded-xl font-bold h-10 px-6 shrink-0 transition-all",
              activeCategory === cat.name ? "shadow-md shadow-primary/20" : "bg-white border-none shadow-sm"
            )}
            onClick={() => setActiveCategory(cat.name)}
          >
            <cat.icon className={cn("mr-2 h-4 w-4", activeCategory === cat.name ? "text-primary-foreground" : "text-primary")} />
            {cat.name}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTasks?.length ? filteredTasks.map((task) => (
          <Card key={task.id} className="group border-none shadow-sm bg-white overflow-hidden flex flex-col transition-all hover:shadow-md">
            <div className="h-1.5 w-full bg-primary/10 group-hover:bg-primary transition-colors" />
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start mb-3">
                <Badge variant="secondary" className="bg-primary/5 text-primary border-none rounded-lg px-2.5 py-0.5 font-bold uppercase text-[10px]">
                  {task.category}
                </Badge>
                <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-lg">
                  <Coins className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-bold text-xs">{task.points}</span>
                </div>
              </div>
              <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{task.title}</CardTitle>
              <CardDescription className="text-sm font-medium line-clamp-2 mt-1">{task.description}</CardDescription>
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
              <Button className="w-full rounded-xl font-bold h-11 shadow-sm group-hover:shadow-md transition-all">
                Start Earning
              </Button>
            </CardContent>
          </Card>
        )) : !isLoading && (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="bg-white w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-sm text-primary/20">
              <Coins className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-foreground">No tasks available</p>
              <p className="text-sm text-muted-foreground font-medium">Check back later for new earning opportunities.</p>
            </div>
          </div>
        )}
        
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-none shadow-sm bg-white h-[280px] animate-pulse">
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
  );
}