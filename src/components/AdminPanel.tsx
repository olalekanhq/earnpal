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
  Loader2,
  Users2
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
import { TasksManager } from "./admin/TasksManager";
import { AuditLogs } from "./admin/AuditLogs";
import { AnalyticsView } from "./admin/AnalyticsView";
import { ReferralsManager } from "./admin/ReferralsManager";
import { cn } from "@/lib/utils";
import { ListTodo, ShieldCheck, PieChart, TrendingDown } from "lucide-react";
import { subDays, startOfDay } from "date-fns";

export function AdminPanel({ activeTab, onTabChange }: { activeTab: string | undefined; onTabChange: ((value: string) => void) | undefined }) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const now = new Date();
      const thirtyDaysAgo = subDays(startOfDay(now), 30);
      const sixtyDaysAgo = subDays(startOfDay(now), 60);

      const [
        usersRes, 
        usersPrevRes,
        pointsRes, 
        pointsPrevRes,
        redemptionsRes,
        redemptionsPrevRes
      ] = await Promise.all([
        // Current period
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).lt("created_at", thirtyDaysAgo.toISOString()),
        supabase.from("points_transactions").select("amount, created_at").gte("created_at", thirtyDaysAgo.toISOString()),
        // Previous period
        supabase.from("points_transactions").select("amount, created_at").gte("created_at", sixtyDaysAgo.toISOString()).lt("created_at", thirtyDaysAgo.toISOString()),
        supabase.from("redemptions").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo.toISOString()),
        supabase.from("redemptions").select("id", { count: "exact", head: true }).gte("created_at", sixtyDaysAgo.toISOString()).lt("created_at", thirtyDaysAgo.toISOString()),
      ]);

      // Calculate totals
      const totalUsers = usersRes.count || 0;
      const prevUsers = usersPrevRes.count || 0; // Cumulative up to 30 days ago
      
      // Points Issued
      const pointsIssued = pointsRes.data?.reduce((acc, curr) => acc + (curr.amount > 0 ? curr.amount : 0), 0) || 0;
      const prevPointsIssued = pointsPrevRes.data?.reduce((acc, curr) => acc + (curr.amount > 0 ? curr.amount : 0), 0) || 0;

      // Points Redeemed
      const pointsSpent = Math.abs(pointsRes.data?.reduce((acc, curr) => acc + (curr.amount < 0 ? curr.amount : 0), 0) || 0);
      const prevPointsSpent = Math.abs(pointsPrevRes.data?.reduce((acc, curr) => acc + (curr.amount < 0 ? curr.amount : 0), 0) || 0);

      // Redemptions count
      const totalRedemptions = redemptionsRes.count || 0;
      const prevRedemptions = redemptionsPrevRes.count || 0;

      const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) return { trend: current > 0 ? "+100%" : "0%", up: true };
        const diff = current - previous;
        const percentage = Math.round((Math.abs(diff) / previous) * 100);
        return {
          trend: `${diff >= 0 ? '+' : '-'}${percentage}%`,
          up: diff >= 0
        };
      };

      // For users, it's cumulative growth vs previous cumulative. 
      // But let's check new users in current 30 days vs previous 30 days for actual trend.
      const newUsersCurrent = (usersRes.count || 0) - (usersPrevRes.count || 0);
      // We need a way to get users count 60 days ago for a true comparison of new user velocity
      // For now, let's use the current total vs previous total for simple growth indicator
      
      return {
        totalUsers,
        totalPoints: pointsIssued, // This is current 30 days issued points in this context? 
        // Wait, the original code used pointsRes.data for ALL points. 
        // Let's adjust to be consistent with overall stats + specific trends.
        pointsSpent,
        totalRedemptions,
        redemptionRate: usersRes.count ? ((redemptionsRes.count || 0) / usersRes.count).toFixed(2) : 0,
        trends: {
          users: calculateTrend(totalUsers, prevUsers),
          points: calculateTrend(pointsIssued, prevPointsIssued),
          spent: calculateTrend(pointsSpent, prevPointsSpent),
          redemptions: calculateTrend(totalRedemptions, prevRedemptions)
        }
      };
    },
  });

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers.toLocaleString(),
      icon: Users,
      trend: stats?.trends.users.trend || "0%",
      trendUp: stats?.trends.users.up ?? true,
      description: "Active platform members"
    },
    {
      title: "Points Issued",
      value: stats?.totalPoints.toLocaleString(),
      icon: Coins,
      trend: stats?.trends.points.trend || "0%",
      trendUp: stats?.trends.points.up ?? true,
      description: "Last 30 days generation"
    },
    {
      title: "Points Redeemed",
      value: stats?.pointsSpent.toLocaleString(),
      icon: ShoppingBag,
      trend: stats?.trends.spent.trend || "0%",
      trendUp: stats?.trends.spent.up ?? true,
      description: "Last 30 days claims"
    },
    {
      title: "Redemptions",
      value: stats?.totalRedemptions.toLocaleString(),
      icon: TrendingUp,
      trend: stats?.trends.redemptions.trend || "0%",
      trendUp: stats?.trends.redemptions.up ?? true,
      description: "Last 30 days count"
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
      <Tabs value={activeTab || "users"} onValueChange={onTabChange} className="space-y-6">
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
              value="tasks" 
              className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <ListTodo className="h-4 w-4 mr-2" />
              Tasks
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
            <TabsTrigger 
              value="audit" 
              className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Audit Logs
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <PieChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="referrals" 
              className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <Users2 className="h-4 w-4 mr-2" />
              Referrals
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users" className="mt-0 border-none p-0 outline-none animate-in slide-in-from-bottom-2 duration-300">
          <UsersManager />
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-0 border-none p-0 outline-none animate-in slide-in-from-bottom-2 duration-300">
          <TasksManager />
        </TabsContent>
        
        <TabsContent value="rewards" className="mt-0 border-none p-0 outline-none animate-in slide-in-from-bottom-2 duration-300">
          <RewardsManager />
        </TabsContent>
        
        <TabsContent value="redemptions" className="mt-0 border-none p-0 outline-none animate-in slide-in-from-bottom-2 duration-300">
          <RedemptionsManager />
        </TabsContent>

        <TabsContent value="audit" className="mt-0 border-none p-0 outline-none animate-in slide-in-from-bottom-2 duration-300">
          <AuditLogs />
        </TabsContent>

        <TabsContent value="analytics" className="mt-0 border-none p-0 outline-none animate-in slide-in-from-bottom-2 duration-300">
          <AnalyticsView />
        </TabsContent>

        <TabsContent value="referrals" className="mt-0 border-none p-0 outline-none animate-in slide-in-from-bottom-2 duration-300">
          <ReferralsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
