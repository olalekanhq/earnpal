import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Share2, Users, Gift, Copy, Check, Twitter, MessageSquare, Mail, Trophy, TrendingUp, Info, MousePointerClick, ArrowRight, ExternalLink, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated/refer")({
  head: () => ({
    title: "Refer Friends | Earn Pal",
    meta: [
      { name: "description", content: "Invite your friends to Earn Pal and earn bonus points for every verified signup." },
      { property: "og:title", content: "Referral Program | Earn Pal" },
      { property: "og:description", content: "Share your unique link and watch your points balance grow." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `https://earnpal.lovable.app/api/public/og?title=Refer Friends&description=Earn 50 points for every signup.` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.pathname },
      });
    }
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
        .select("id, full_name, username, email, created_at, avatar_url")
        .eq("referred_by", user.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const referralCount = referrals?.length || 0;
  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/?ref=${profile?.referral_code}` : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const nextMilestone = 10;
  const progress = Math.min((referralCount / nextMilestone) * 100, 100);

  return (
    <div className="pb-12 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Referral Program</h1>
          <p className="text-muted-foreground font-medium">Invite friends and earn 50 points for every signup.</p>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column: Stats & Link */}
        <div className="md:col-span-8 space-y-6">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="border-none shadow-sm bg-card p-4">
              <div className="flex flex-col h-full justify-between gap-2">
                <div className="p-2 bg-blue-50 w-fit rounded-lg text-blue-600">
                  <MousePointerClick className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Link Clicks</p>
                  <p className="text-2xl font-black">{profile?.referral_clicks || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="border-none shadow-sm bg-card p-4">
              <div className="flex flex-col h-full justify-between gap-2">
                <div className="p-2 bg-primary/10 w-fit rounded-lg text-primary">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Referrals</p>
                  <p className="text-2xl font-black">{referralCount}</p>
                </div>
              </div>
            </Card>
            <Card className="border-none shadow-sm bg-card p-4">
              <div className="flex flex-col h-full justify-between gap-2">
                <div className="p-2 bg-green-50 w-fit rounded-lg text-green-600">
                  <Gift className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Points Earned</p>
                  <p className="text-2xl font-black">{referralCount * 50}</p>
                </div>
              </div>
            </Card>
            <Card className="border-none shadow-sm bg-card p-4">
              <div className="flex flex-col h-full justify-between gap-2">
                <div className="p-2 bg-orange-50 w-fit rounded-lg text-orange-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Conv. Rate</p>
                  <p className="text-2xl font-black">{profile?.referral_clicks ? Math.round((referralCount / profile.referral_clicks) * 100) : 0}%</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="border-none shadow-sm bg-primary text-primary-foreground p-6 md:p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="relative z-10 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-black">Your Referral Link</h2>
                <p className="text-primary-foreground/80 font-medium">Copy your link and share it on social media to earn rewards.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Input 
                    readOnly 
                    value={referralLink} 
                    className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl pr-12 focus-visible:ring-white/30"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={copyToClipboard}
                    className="absolute right-1 top-1 text-white hover:bg-white/10 h-10 w-10"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-12 w-12 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl">
                    <Twitter className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-12 w-12 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="signups" className="w-full">
            <TabsList className="bg-card/50 border border-border/50 p-1 rounded-xl h-11 w-full max-w-[300px]">
              <TabsTrigger value="signups" className="rounded-lg font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm">Signups</TabsTrigger>
              <TabsTrigger value="leaderboard" className="rounded-lg font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm">Leaderboard</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signups" className="mt-4 space-y-4">
              <Card className="border-none shadow-sm bg-card overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold">Recent Signups</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {referrals?.length ? (
                    <div className="divide-y divide-border/50">
                      {referrals.map((ref) => (
                        <div key={ref.id} className="flex items-center justify-between p-4 hover:bg-accent/5 transition-colors">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border">
                              <AvatarImage src={ref.avatar_url || ""} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                {(ref.full_name?.[0] || ref.username?.[0] || "?").toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-bold text-foreground leading-none">{ref.full_name || ref.username || "New User"}</p>
                              <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-tight">Joined {new Date(ref.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="bg-green-50 px-2 py-1 rounded-lg">
                            <span className="text-[10px] font-bold text-green-600 uppercase">+50 Pts</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 opacity-20">
                        <Users className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">No signups yet. Start sharing!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard" className="mt-4">
              <Card className="border-none shadow-sm bg-card overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Top Referrers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {leaderboard?.map((user, idx) => (
                      <div key={user.id} className="flex items-center justify-between p-4 hover:bg-accent/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                            idx === 0 ? "bg-yellow-100 text-yellow-700" : 
                            idx === 1 ? "bg-slate-100 text-slate-700" : 
                            idx === 2 ? "bg-amber-100 text-amber-700" : "text-muted-foreground"
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border">
                              <AvatarImage src={user.avatar_url || ""} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                {(user.full_name?.[0] || user.username?.[0] || "?").toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-bold text-foreground leading-none">{user.full_name || user.username || "Anonymous"}</p>
                              <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase">Top Referrer</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">{(user.points_balance || 0).toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">Points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Milestones & Info */}
        <div className="md:col-span-4 space-y-6">
          <Card className="border-none shadow-sm bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold">Next Milestone</h3>
              <div className="bg-orange-50 px-2 py-1 rounded-lg">
                <span className="text-[10px] font-bold text-orange-600 uppercase">LVL 1</span>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Progress</span>
                  <span>{referralCount} / {nextMilestone} Invites</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="bg-accent/30 rounded-2xl p-4 border border-border/50 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-xl shadow-sm text-primary">
                    <Shield className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-bold leading-tight">Super Referrer</p>
                </div>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  Invite {nextMilestone - referralCount} more friends to unlock the <span className="text-foreground font-bold italic">Super Referrer</span> badge and get a 200 point bonus!
                </p>
              </div>

              <Button className="w-full rounded-xl font-bold gap-2" variant="outline">
                Rewards Details
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          <Card className="border-none shadow-sm bg-card p-6 space-y-4">
            <h3 className="font-black text-sm uppercase tracking-widest">How it works</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-primary">1</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">Share your unique link with friends via social media or email.</p>
              </div>
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-primary">2</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">Your friends click the link and sign up for an Earn Pal account.</p>
              </div>
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-primary">3</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">You instantly receive 50 points once their registration is verified.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}