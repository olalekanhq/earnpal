import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Coins, 
  ShoppingBag, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Loader2
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { RedemptionsManager } from "./admin/RedemptionsManager";
import { RewardsManager } from "./admin/RewardsManager";
import { UsersManager } from "./admin/UsersManager";
import { cn } from "@/lib/utils";

export function AdminPanel() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const [usersRes, pointsRes, redemptionsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("points_transactions").select("amount"),
        supabase.from("redemptions").select("id", { count: "exact", head: true }),
      ]);

      const totalPoints = pointsRes.data?.reduce((acc, curr) => acc + (curr.amount > 0 ? curr.amount : 0), 0) || 0;
      const pointsSpent = Math.abs(pointsRes.data?.reduce((acc, curr) => acc + (curr.amount < 0 ? curr.amount : 0), 0) || 0);

      return {
        totalUsers: usersRes.count || 0,
        totalPoints,
        pointsSpent,
        totalRedemptions: redemptionsRes.count || 0,
        redemptionRate: usersRes.count ? ((redemptionsRes.count || 0) / usersRes.count).toFixed(2) : 0
      };
    },
  });

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers.toLocaleString(),
      icon: Users,
      trend: "+12%",
      trendUp: true,
      description: "Active platform members"
    },
    {
      title: "Points Issued",
      value: stats?.totalPoints.toLocaleString(),
      icon: Coins,
      trend: "+8%",
      trendUp: true,
      description: "Total rewards generated"
    },
    {
      title: "Points Redeemed",
      value: stats?.pointsSpent.toLocaleString(),
      icon: ShoppingBag,
      trend: "+5%",
      trendUp: true,
      description: "Value claimed by users"
    },
    {
      title: "Redemptions",
      value: stats?.totalRedemptions.toLocaleString(),
      icon: TrendingUp,
      trend: "-2%",
      trendUp: false,
      description: "Successful prize claims"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-primary/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="bg-primary/5 p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
                <stat.icon className="h-4 w-4 text-primary" strokeWidth={2.5} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black tracking-tighter">{stat.value}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "flex items-center text-[10px] font-black px-1.5 py-0.5 rounded-md",
                  stat.trendUp ? "text-green-600 bg-green-500/10" : "text-destructive bg-destructive/10"
                )}>
                  {stat.trendUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                  {stat.trend}
                </span>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <Tabs defaultValue="users" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-1">
          <TabsList className="bg-muted/50 p-1 rounded-2xl h-auto self-start">
            <TabsTrigger 
              value="users" 
              className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="rewards" 
              className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Rewards
            </TabsTrigger>
            <TabsTrigger 
              value="redemptions" 
              className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <Clock className="h-4 w-4 mr-2" />
              Redemptions
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users" className="mt-0 border-none p-0 outline-none animate-in slide-in-from-bottom-2 duration-300">
          <UsersManager />
        </TabsContent>
        
        <TabsContent value="rewards" className="mt-0 border-none p-0 outline-none animate-in slide-in-from-bottom-2 duration-300">
          <RewardsManager />
        </TabsContent>
        
        <TabsContent value="redemptions" className="mt-0 border-none p-0 outline-none animate-in slide-in-from-bottom-2 duration-300">
          <RedemptionsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
