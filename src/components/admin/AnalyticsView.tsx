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
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, UserPlus, CheckCircle, Gift } from "lucide-react";

export function AnalyticsView() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["funnelAnalytics"],
    queryFn: async () => {
      // Use aggregate counts directly instead of fetching all records
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

      return { funnel, totalEvents: (referralRes.count || 0) + (signupRes.count || 0) + (bonusRes.count || 0) };
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">
                Total events tracked
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/40 bg-card/50 backdrop-blur-sm p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">
            Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0 h-[300px]">
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
