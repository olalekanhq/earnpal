import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Coins, CheckCircle2, Star, Zap, Twitter, Youtube, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/earn")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/auth" });
  },
  component: EarnPage,
});

function EarnPage() {
  const { data: tasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*").eq("is_active", true);
      return data;
    },
  });

  const categories = [
    { name: "All", icon: Star },
    { name: "Social", icon: MessageSquare },
    { name: "Surveys", icon: Zap },
    { name: "Videos", icon: Youtube },
  ];

  return (
    <div className="min-h-screen bg-accent/5 pb-12">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">Earn Points</h1>
          <p className="text-muted-foreground font-medium">Complete simple tasks to earn points and level up.</p>
        </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <Button key={cat.name} variant={cat.name === 'All' ? 'default' : 'outline'} className="rounded-full">
            <cat.icon className="mr-2 h-4 w-4" />
            {cat.name}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tasks?.length ? tasks.map((task) => (
          <Card key={task.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary">{task.category}</Badge>
                <div className="flex items-center text-primary font-bold">
                  <Coins className="h-4 w-4 mr-1" />
                  {task.points}
                </div>
              </div>
              <CardTitle className="text-xl">{task.title}</CardTitle>
              <CardDescription>{task.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-6">
              <Button className="w-full">
                Start Task
              </Button>
            </CardContent>
          </Card>
        )) : (
          <>
            <Card className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary">Social</Badge>
                  <div className="flex items-center text-primary font-bold">
                    <Coins className="h-4 w-4 mr-1" />
                    50
                  </div>
                </div>
                <CardTitle className="text-xl">Follow on Twitter</CardTitle>
                <CardDescription>Follow our official account to stay updated.</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-6">
                <Button className="w-full">
                  <Twitter className="mr-2 h-4 w-4" />
                  Follow
                </Button>
              </CardContent>
            </Card>
            <Card className="flex flex-col border-dashed bg-muted/20">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary">Daily</Badge>
                  <div className="flex items-center text-primary font-bold">
                    <Coins className="h-4 w-4 mr-1" />
                    20
                  </div>
                </div>
                <CardTitle className="text-xl text-muted-foreground">Daily Check-in</CardTitle>
                <CardDescription>Claim your daily bonus.</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-6">
                <Button variant="outline" className="w-full" disabled>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Claimed
                </Button>
              </CardContent>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary">Video</Badge>
                  <div className="flex items-center text-primary font-bold">
                    <Coins className="h-4 w-4 mr-1" />
                    100
                  </div>
                </div>
                <CardTitle className="text-xl">Watch Tutorial</CardTitle>
                <CardDescription>Learn how to maximize your earnings.</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-6">
                <Button className="w-full">
                  <Youtube className="mr-2 h-4 w-4" />
                  Watch
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      </div>
    </div>
  );
}