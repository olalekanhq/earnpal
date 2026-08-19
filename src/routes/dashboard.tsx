import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Coins, Gift, Share2, TrendingUp, Clock, ChevronRight, Award, 
  LayoutDashboard, CreditCard, BookOpen, Store, Image as ImageIcon, 
  FileText, Smartphone, Database, Zap, HelpCircle, Wallet, ShoppingBag
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    title: "Dashboard | Earn Pal",
    meta: [
      { name: "description", content: "Manage your points and complete tasks on Earn Pal." },
      { property: "og:title", content: "Dashboard | Earn Pal" },
    ],
  }),
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({
        to: "/auth",
      });
    }
  },
  component: Dashboard,
});

const QUICK_ACTIONS = [
  { name: "Fund Wallet", icon: Wallet, color: "bg-purple-100 text-purple-600", href: "#" },
  { name: "Courses", icon: BookOpen, color: "bg-indigo-100 text-indigo-600", href: "#" },
  { name: "Marketplace", icon: ShoppingBag, color: "bg-sky-100 text-sky-600", href: "/earn" },
  { name: "Store", icon: Store, color: "bg-blue-100 text-blue-600", href: "#" },
  { name: "Gallery", icon: ImageIcon, color: "bg-emerald-100 text-emerald-600", href: "#" },
  { name: "Invoices", icon: FileText, color: "bg-teal-100 text-teal-600", href: "#" },
  { name: "Airtime", icon: Smartphone, color: "bg-violet-100 text-violet-600", href: "#" },
  { name: "Data", icon: Database, color: "bg-cyan-100 text-cyan-600", href: "#" },
  { name: "Electricity", icon: Zap, color: "bg-orange-100 text-orange-600", href: "#" },
];

function Dashboard() {
  const queryClient = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      return data;
    },
  });

  const { data: streak } = useQuery({
    queryKey: ["streak"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("user_streaks").select("*").eq("user_id", user.id).single();
      return data;
    },
  });

  const claimDailyStreak = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase.from('points_transactions').insert({
        user_id: user.id,
        amount: 20,
        type: 'earn',
        description: 'Daily login bonus'
      });
      if (error) throw error;
      
      await supabase.from('user_streaks').upsert({
        user_id: user.id,
        last_activity_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["streak"] });
      toast.success("Daily bonus claimed! +20 points");
    }
  });

  return (
    <div className="min-h-screen bg-grid pb-24 md:pb-12">
      <div className="max-w-4xl mx-auto px-4 pt-12 space-y-12">
        {/* Header Section */}
        <header className="text-left space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-muted p-2 rounded-xl text-muted-foreground flex items-center gap-2 text-xs font-bold border">
              <Clock className="h-3 w-3" />
              {format(new Date(), "MMM dd, yyyy")}
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {profile?.full_name?.split(' ')[0] || profile?.username || 'User'} 
              <span className="text-2xl">👋</span>
            </h1>
            <p className="text-muted-foreground font-medium">
              Here's what's happening with your account today.
            </p>
          </div>
        </header>

        {/* Balance Card Section */}
        <section className="relative">
          <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden border border-border/50">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                  <div className="bg-primary p-1 rounded-md">
                    <Wallet className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-xs font-black text-primary/80 uppercase tracking-wider flex items-center gap-1">
                    Combined Balance
                    <ChevronRight className="h-3 w-3 rotate-90" />
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-5xl font-black text-foreground flex items-baseline gap-1">
                  <span className="text-3xl">₦</span>
                  {profile?.points_balance?.toLocaleString() || "0.00"}
                </div>
              </div>
            </CardContent>
            {/* Background Decoration */}
            <div className="absolute right-0 top-0 h-full w-1/3 opacity-[0.03] pointer-events-none">
              <Wallet className="h-48 w-48 -mr-12 -mt-8 rotate-12" />
            </div>
          </Card>
        </section>

        {/* Quick Actions Grid */}
        <section className="space-y-8">
          <div className="flex items-center gap-2 px-1">
            <div className="bg-primary h-5 w-1 rounded-full" />
            <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Quick Actions</h2>
          </div>

          <div className="grid grid-cols-3 gap-y-10 sm:grid-cols-4 md:grid-cols-5">
            {QUICK_ACTIONS.map((action) => (
              <Link 
                key={action.name} 
                to={action.href}
                className="flex flex-col items-center gap-3 group transition-transform active:scale-95"
              >
                <div className={`p-4 rounded-2xl ${action.color} shadow-sm group-hover:scale-110 transition-all`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold text-foreground text-center line-clamp-1">{action.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Help Bubble - Matching the Spectrey floating help */}
        <div className="fixed bottom-24 right-6 md:bottom-12 md:right-12 z-40">
          <Button className="rounded-full shadow-2xl shadow-primary/40 px-6 py-6 h-auto font-bold flex gap-2 group">
             Need help? 👋
             <div className="bg-white/20 p-1.5 rounded-full group-hover:rotate-12 transition-transform">
               <HelpCircle className="h-4 w-4" />
             </div>
          </Button>
        </div>

        {/* Daily Streak Integration */}
        <section className="pt-8">
          <Card 
            className="border-none shadow-md bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 cursor-pointer"
            onClick={() => !claimDailyStreak.isPending && claimDailyStreak.mutate()}
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary p-3 rounded-2xl text-white">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-foreground">{streak?.current_streak || 0} Day Streak</h3>
                  <p className="text-xs font-bold text-primary uppercase">Claim Daily Reward +20 PTS</p>
                </div>
              </div>
              <Button size="sm" variant="secondary" className="font-black" disabled={claimDailyStreak.isPending}>
                {claimDailyStreak.isPending ? "..." : "CLAIM"}
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
