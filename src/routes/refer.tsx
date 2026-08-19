import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Share2, Users, Gift, Copy, Check, Twitter, MessageSquare, Mail, Trophy, TrendingUp, Info, MousePointerClick } from "lucide-react";
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

  const { data: referrals } = useQuery({
    queryKey: ["referrals"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at, points_balance")
        .eq("referred_by", user.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const referralCount = referrals?.length || 0;
  const referralLink = `${window.location.origin}/auth?ref=${profile?.referral_code}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const nextMilestone = 10;
  const progress = (referralCount / nextMilestone) * 100;

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
        <TabsList className="grid w-full grid-cols-3 max-w-[600px] mx-auto mb-8">
          <TabsTrigger value="dashboard" className="font-bold">Dashboard</TabsTrigger>
          <TabsTrigger value="status" className="font-bold">My Referrals</TabsTrigger>
          <TabsTrigger value="leaderboard" className="font-bold">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 animate-in fade-in-50 duration-500">
          <div className="grid gap-6 md:grid-cols-4">
             <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Link Clicks</CardTitle>
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <MousePointerClick className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{profile?.referral_clicks || 0}</div>
                <p className="text-xs font-medium text-muted-foreground mt-1">Total visitors</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Signups</CardTitle>
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{referralCount}</div>
                <p className="text-xs font-medium text-muted-foreground mt-1">Conversion rate: {profile?.referral_clicks ? Math.round((referralCount / profile.referral_clicks) * 100) : 0}%</p>
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
                <div className="text-3xl font-black">{referralCount * 50}</div>
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
                  <span className="text-muted-foreground">{referralCount} INVITES</span>
                  <span className="text-primary">{nextMilestone} TARGET</span>
                </div>
                <Progress value={progress} className="h-2 bg-accent" />
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-xl text-center font-black uppercase">Your Unique Referral Link</CardTitle>
              <CardDescription className="text-center font-medium">Share this link with your friends to start earning.</CardDescription>
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
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 hover:text-blue-400 hover:border-blue-400 transition-colors">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 hover:text-green-500 hover:border-green-500 transition-colors">
                  <MessageSquare className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 hover:text-primary hover:border-primary transition-colors">
                  <Mail className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 hover:text-primary hover:border-primary transition-colors">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="max-w-2xl mx-auto mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 text-blue-800">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Referral Rewards Progress</p>
              <p>You need {Math.max(0, nextMilestone - referralCount)} more referrals to unlock the "Super Referrer" badge and a 200 point bonus!</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="status" className="animate-in fade-in-50 duration-500">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-black uppercase">Referral Signups</CardTitle>
              <CardDescription>Real-time status of people you've invited</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {referrals?.length ? referrals.map((ref) => (
                  <div key={ref.id} className="flex items-center justify-between p-4 rounded-xl bg-accent/30 border border-border/50">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {ref.full_name?.[0] || ref.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-foreground">{ref.full_name || "New User"}</p>
                        <p className="text-xs text-muted-foreground">Joined {new Date(ref.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-primary uppercase">+50 PTS</div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">SUCCESSFUL</div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12">
                     <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                     <p className="text-muted-foreground font-medium italic">No signups yet. Keep sharing!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="animate-in fade-in-50 duration-500">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-black uppercase">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Referrers
              </CardTitle>
              <CardDescription>The community's most active referrers this month.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard?.map((user, idx) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-6 font-black text-muted-foreground">#{idx + 1}</div>
                      <Avatar className="border-2 border-background">
                        <AvatarImage src={user.avatar_url || ""} />
                        <AvatarFallback className="font-bold">{user.full_name?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold">{user.full_name || "Anonymous User"}</div>
                        <div className="text-xs text-muted-foreground font-medium">{user.points_balance?.toLocaleString()} points</div>
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
