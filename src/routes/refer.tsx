import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Share2, Users, Gift, Copy, Check, Twitter, MessageSquare, Mail, Trophy, TrendingUp, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/refer")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/auth" });
  },
  component: ReferralPage,
});

function ReferralPage() {
  const [copied, setCopied] = useState(false);
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      return data;
    },
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data } = await supabase.from("leaderboard").select("*").limit(10);
      return data;
    },
  });

  const { data: referralCount } = useQuery({
    queryKey: ["referralCount"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("referred_by", user.id);
      return count || 0;
    },
  });

  const referralLink = `${window.location.origin}/auth?ref=${profile?.referral_code}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const nextMilestone = 10;
  const progress = ((referralCount || 0) / nextMilestone) * 100;

  return (
    <div className="min-h-screen bg-accent/5 pb-12">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">Refer & Earn</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
            Invite your friends to <span className="text-primary font-bold">Earn Pal</span> and earn <span className="text-foreground font-bold">50 points</span> for each person who signs up.
          </p>
        </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mx-auto mb-8">
          <TabsTrigger value="dashboard">My Dashboard</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 animate-in fade-in-50 duration-500">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Total Referrals</CardTitle>
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{referralCount || 0}</div>
                <p className="text-xs font-medium text-muted-foreground mt-1">Successful invites</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Points Earned</CardTitle>
                <div className="bg-green-500/10 p-2 rounded-lg">
                  <Gift className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{(referralCount || 0) * 50}</div>
                <p className="text-xs font-medium text-muted-foreground mt-1">From referrals</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Progress</CardTitle>
                <div className="bg-orange-500/10 p-2 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                  <span className="text-muted-foreground">{referralCount || 0} INVITES</span>
                  <span className="text-primary">{nextMilestone} TARGET</span>
                </div>
                <Progress value={progress} className="h-2 bg-accent" />
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-xl text-center">Your Unique Referral Link</CardTitle>
              <CardDescription className="text-center">Share this link with your friends to start earning.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Input 
                  readOnly 
                  value={referralLink} 
                  className="font-mono text-xs md:text-sm bg-background"
                />
                <Button onClick={copyToClipboard} size="icon" className="shrink-0">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex justify-center gap-4">
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 hover:text-blue-400 hover:border-blue-400">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 hover:text-green-500 hover:border-green-500">
                  <MessageSquare className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 hover:text-primary hover:border-primary">
                  <Mail className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 hover:text-primary hover:border-primary">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="max-w-2xl mx-auto mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 text-blue-800">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Referral Rewards Progress</p>
              <p>You need {nextMilestone - (referralCount || 0)} more referrals to unlock the "Super Referrer" badge and a 200 point bonus!</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="animate-in fade-in-50 duration-500">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Referrers
              </CardTitle>
              <CardDescription>The community's most active referrers this month.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard?.map((user, idx) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className="w-6 font-bold text-muted-foreground">#{idx + 1}</div>
                      <Avatar>
                        <AvatarImage src={user.avatar_url || ""} />
                        <AvatarFallback>{user.full_name?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.full_name || "Anonymous User"}</div>
                        <div className="text-xs text-muted-foreground">{user.points_balance} points</div>
                      </div>
                    </div>
                    {idx < 3 && (
                      <Trophy className={`h-5 w-5 ${
                        idx === 0 ? "text-yellow-500" : idx === 1 ? "text-slate-400" : "text-amber-600"
                      }`} />
                    )}
                  </div>
                ))}
                {!leaderboard?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    No data available yet. Be the first to top the charts!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
