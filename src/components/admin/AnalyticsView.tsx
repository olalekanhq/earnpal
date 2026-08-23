import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, TrendingUp, UserPlus, CheckCircle, Gift, ListTodo, RefreshCw } from "lucide-react";
import { format, subDays } from "date-fns";

export function AnalyticsView() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["funnelAnalytics"],
    queryFn: async () => {
      const [referralRes, signupRes, bonusRes, globalStatsRes] = await Promise.all([
        supabase.from("analytics_events" as any).select("*", { count: "exact", head: true }).eq("event_name", "referral_code_validated"),
        supabase.from("analytics_events" as any).select("*", { count: "exact", head: true }).eq("event_name", "signup_complete"),
        supabase.from("analytics_events" as any).select("*", { count: "exact", head: true }).eq("event_name", "welcome_bonus_claimed"),
        supabase.from("global_referral_stats").select("*").maybeSingle(),
      ]);

      const globalStats = globalStatsRes.data || { total_referrals: 0, completed_referrals: 0 };

      const funnel = [
        { 
          name: "Referral Validated", 
          count: globalStats.total_referrals || referralRes.count || 0,
          icon: TrendingUp,
          color: "#8b5cf6" 
        },
        { 
          name: "Signup Complete", 
          count: signupRes.count || 0,
          icon: UserPlus,
          color: "#10b981" 
        },
        { 
          name: "Welcome Bonus Claimed", 
          count: globalStats.completed_referrals || bonusRes.count || 0,
          icon: Gift,
          color: "#f59e0b" 
        }
      ];

      return { funnel };
    }
  });

  const { data: economyData, isLoading: isLoadingEconomy } = useQuery({
    queryKey: ["economyAnalytics"],
    queryFn: async () => {
      const [dailyCompletionsRes, repeatableStatsRes] = await Promise.all([
        supabase.from("daily_task_completions" as any).select("*").order('completion_date', { ascending: true }).limit(30),
        supabase.from("repeatable_task_stats" as any).select("*").order('total_claims', { ascending: false }).limit(10)
      ]);

      return {
        dailyCompletions: dailyCompletionsRes.data || [],
        repeatableStats: repeatableStatsRes.data || []
      };
    }
  });

  if (isLoading || isLoadingEconomy) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Funnel Section */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        {analytics?.funnel.map((item) => (
          <Card key={item.name} className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-primary/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {item.name}
              </CardTitle>
              <item.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tighter">{item.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Tasks Chart */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm p-6">
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center gap-2 mb-1">
              <ListTodo className="h-4 w-4 text-primary" />
              <CardTitle className="text-xs font-black uppercase tracking-widest text-foreground">
                Tasks Completed Per Day
              </CardTitle>
            </div>
            <CardDescription className="text-[10px] font-bold uppercase tracking-tight">Last 30 days approved submissions</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={economyData?.dailyCompletions || []}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="completion_date" 
                  tickFormatter={(str) => format(new Date(str), 'MMM d')}
                  tick={{ fontSize: 9, fontWeight: 800, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 9, fontWeight: 800, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 800
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Repeatable Tasks Chart */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm p-6">
          <CardHeader className="px-0 pt-0">
             <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="h-4 w-4 text-primary" />
              <CardTitle className="text-xs font-black uppercase tracking-widest text-foreground">
                Repeatable Task Claim Rates
              </CardTitle>
            </div>
            <CardDescription className="text-[10px] font-bold uppercase tracking-tight">Avg claims per user (30d)</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={economyData?.repeatableStats || []} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fontSize: 9, fontWeight: 800 }} hide />
                <YAxis 
                  dataKey="title" 
                  type="category" 
                  tick={{ fontSize: 8, fontWeight: 800, fill: "var(--muted-foreground)" }}
                  width={100}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 800
                  }}
                />
                <Bar dataKey="claims_per_user" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20}>
                   {economyData?.repeatableStats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#10b981" : "#34d399"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel Bar */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-foreground">
            User Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.funnel || []} layout="vertical" margin={{ left: 40, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                scale="band" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 800, fill: "var(--muted-foreground)" }}
                width={150}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 800
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={40}>
                {analytics?.funnel.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}