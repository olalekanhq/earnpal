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
  Users2,
  ShieldAlert,
  ChevronDown
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { RedemptionsManager } from "./admin/RedemptionsManager";
import { RewardsManager } from "./admin/RewardsManager";
import { UsersManager } from "./admin/UsersManager";
import { TasksManager } from "./admin/TasksManager";

import { AnalyticsView } from "./admin/AnalyticsView";
import { ReferralsManager } from "./admin/ReferralsManager";
import { PlatformSettings } from "./admin/PlatformSettings";
import { FraudManager } from "./admin/FraudManager";
import { cn } from "@/lib/utils";
import { ListTodo, ShieldCheck, PieChart, TrendingDown, Settings } from "lucide-react";
import { subDays, startOfDay } from "date-fns";
import { useState, useEffect } from "react";

import { useAuth } from "@/hooks/use-auth";
import { Lock } from "lucide-react";

export function AdminPanel() {
  
  const { role, isAdmin } = useAuth();
  
  const { data: permissions } = useQuery({
    queryKey: ["rolePermissions", role],
    queryFn: async () => {
      if (role === "admin") return null;
      const { data } = await supabase
        .from("role_permissions")
        .select("tab_name")
        .eq("role", role)
        .eq("is_enabled", true);
      return data?.map(p => p.tab_name) || [];
    },
    enabled: !!role,
  });

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
        // Points Issued - Use a smaller selection
        supabase.from("points_transactions").select("amount").gte("created_at", thirtyDaysAgo.toISOString()),
        // Previous period
        supabase.from("points_transactions").select("amount").gte("created_at", sixtyDaysAgo.toISOString()).lt("created_at", thirtyDaysAgo.toISOString()),
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
      
      return {
        totalUsers,
        totalPoints: pointsIssued, 
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

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("earnpal_admin_last_tab") || "users";
    }
    return "users";
  });

  useEffect(() => {
    localStorage.setItem("earnpal_admin_last_tab", activeTab);
  }, [activeTab]);

  const tabs = [
    { value: "users", icon: Users, label: "Users", color: undefined },
    { value: "fraud", icon: ShieldAlert, label: "Fraud", color: "text-destructive" },
    { value: "tasks", icon: ListTodo, label: "Tasks", color: undefined },
    { value: "rewards", icon: ShoppingBag, label: "Rewards", color: undefined },
    { value: "redemptions", icon: Clock, label: "Redemptions", color: undefined },
    { value: "analytics", icon: PieChart, label: "Analytics", color: undefined },
    { value: "referrals", icon: Users2, label: "Referrals", color: undefined },
    { value: "settings", icon: isAdmin ? Settings : Lock, label: "Settings", color: !isAdmin ? "text-muted-foreground" : undefined }
  ];

  
  const filteredTabs = tabs.filter(tab => {
    if (isAdmin) return true;
    if (!permissions) return false;
    return permissions.includes(tab.value);
  });

  const activeTabData = filteredTabs.find(t => t.value === activeTab) || filteredTabs[0] || tabs[0];



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
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-border/40 pb-4">
          {/* Mobile Dropdown */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between border-border/40 bg-card/50 backdrop-blur-sm rounded-2xl h-12 px-4 group hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex items-center">
                    {(() => { const Icon = activeTabData?.icon || Users; return <Icon className={cn("h-4 w-4 mr-2", activeTabData?.color || "text-primary")} />; })()}
                    <span className="font-black uppercase text-[10px] tracking-widest">{(activeTabData?.label || "Panel")}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[calc(100vw-2rem)] bg-card/95 backdrop-blur-md border-border/40 rounded-2xl p-1.5 animate-in fade-in zoom-in-95 duration-200">
                {filteredTabs.map((tab) => (
                  <DropdownMenuItem
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={cn(
                      "rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all duration-200 mb-0.5 last:mb-0",
                      activeTab === tab.value 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                        : "hover:bg-primary/5 text-muted-foreground hover:text-primary"
                    )}
                  >
                    <tab.icon className={cn("h-4 w-4 mr-2", activeTab === tab.value ? "text-primary-foreground" : (tab.color || "text-primary"))} />
                    {tab.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden md:block">
            <TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
              {filteredTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300 border border-transparent",
                    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20",
                    "data-[state=inactive]:bg-card/50 data-[state=inactive]:backdrop-blur-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-primary/5 data-[state=inactive]:hover:text-primary data-[state=inactive]:border-border/40"
                  )}
                >
                  <tab.icon className={cn("h-4 w-4", activeTab === tab.value ? "text-primary-foreground" : (tab.color || "text-primary"))} />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        <TabsContent value="users" className="mt-0 border-none p-0 outline-none animate-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'users' && <UsersManager />}
        </TabsContent>

        <TabsContent value="fraud" className="mt-0 border-none p-0 outline-none animate-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'fraud' && <FraudManager />}
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-0 border-none p-0 outline-none animate-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'tasks' && <TasksManager />}
        </TabsContent>
        
        <TabsContent value="rewards" className="mt-0 border-none p-0 outline-none animate-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'rewards' && <RewardsManager />}
        </TabsContent>
        
        <TabsContent value="redemptions" className="mt-0 border-none p-0 outline-none animate-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'redemptions' && <RedemptionsManager />}
        </TabsContent>

        <TabsContent value="analytics" className="mt-0 border-none p-0 outline-none animate-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'analytics' && <AnalyticsView />}
        </TabsContent>

        <TabsContent value="referrals" className="mt-0 border-none p-0 outline-none animate-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'referrals' && <ReferralsManager />}
        </TabsContent>

        <TabsContent value="settings" className="mt-0 border-none p-0 outline-none animate-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'settings' && <PlatformSettings />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
