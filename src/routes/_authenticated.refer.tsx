import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Users, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ReferralStatsDashboard } from "@/components/ReferralStatsDashboard";

export const Route = createFileRoute("/_authenticated/refer")({
  head: () => ({
    title: "Refer Friends | Earn Passive Income | Earn Pal",
    meta: [
      { name: "description", content: "Invite your friends to Join Earn Pal and build a passive income stream. Earn 75 points for every referral while your friends get a 50-point head start!" },
      { property: "og:title", content: "Referral Program | Earn Pal Bonuses" },
      { property: "og:description", content: "Share your unique referral link and earn points for every friend who joins. The fastest way to grow your balance." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://earnpal.lovable.app/logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReferralPage,
});

function ReferralPage() {
  
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
    queryKey: ["referrals", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data: referralsData, error: referralsError } = await supabase
        .from("referrals")
        .select("referee_id")
        .eq("referrer_id", profile.id)
        .order('created_at', { ascending: false });
      
      if (referralsError) {
        console.error("Error fetching referrals:", referralsError);
        return [];
      }

      if (!referralsData || referralsData.length === 0) return [];

      const refereeIds = referralsData.map(r => r.referee_id);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, username, email, created_at, avatar_url, phone_number, twitter_handle, telegram_handle, facebook_handle, instagram_handle")
        .in("id", refereeIds);

      if (profilesError) {
        console.error("Error fetching referred profiles:", profilesError);
        return [];
      }

      return profilesData || [];
    },
    enabled: !!profile?.id,
  });

  

  return (
    <div className="pb-12 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Referral Program</h1>
          <p className="text-muted-foreground font-medium">Invite friends and earn 75 points for every referral. Your friend gets 50 points immediately!</p>
        </div>
      </header>

      <ReferralStatsDashboard />

      <div className="grid gap-6 md:grid-cols-12">
        {/* Signups & Leaderboard */}
        <div className="md:col-span-8 space-y-6">

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
                      {referrals.map((ref: any) => {
                        const isComplete = ref.full_name && ref.username && ref.phone_number && (ref.twitter_handle || ref.telegram_handle || ref.facebook_handle || ref.instagram_handle);
                        
                        return (
                          <div key={ref.id} className="p-4 hover:bg-accent/5 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border">
                                  <AvatarImage src={ref.avatar_url || ""} />
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                    {(ref.full_name?.[0] || ref.username?.[0] || "?").toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-foreground leading-none">{ref.full_name || ref.username || "New User"}</p>
                                    {!isComplete && (
                                      <Badge variant="outline" className="text-[8px] font-black uppercase bg-amber-50 text-amber-600 border-amber-200 py-0 h-4">
                                        Verification Pending
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-tight">Joined {new Date(ref.created_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className={cn(
                                "px-2 py-1 rounded-lg",
                                isComplete ? "bg-green-50" : "bg-amber-50"
                              )}>
                                <span className={cn(
                                  "text-[10px] font-bold uppercase",
                                   isComplete ? "text-green-600" : "text-amber-600"
                                 )}>
                                  {isComplete ? "+75 Pts" : "Pending Task"}
                                </span>
                              </div>
                            </div>
                            
                            <div className="mt-2 bg-muted/30 rounded-xl p-3 border border-border/50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status Checklist</span>
                                <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                  {isComplete ? "Ready for Bonus" : "In Progress"}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-2">
                                  <div className={cn("w-2 h-2 rounded-full", ref.full_name && ref.username ? "bg-green-500" : "bg-muted")} />
                                  <span className="text-[9px] font-medium">Basic Profile</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className={cn("w-2 h-2 rounded-full", ref.phone_number ? "bg-green-500" : "bg-muted")} />
                                  <span className="text-[9px] font-medium">Phone Verified</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className={cn("w-2 h-2 rounded-full", (ref.twitter_handle || ref.telegram_handle) ? "bg-green-500" : "bg-muted")} />
                                  <span className="text-[9px] font-medium">Social Linked</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className={cn("w-2 h-2 rounded-full", isComplete ? "bg-green-500" : "bg-muted")} />
                                  <span className="text-[9px] font-medium">First Task Ready</span>
                                </div>
                              </div>
                              {!isComplete && (
                                <p className="text-[9px] text-muted-foreground italic mt-2 font-medium">
                                  Bonus granted once user completes profile & first task.
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
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

        {/* Info Column */}
        <div className="md:col-span-4 space-y-6">
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
                <p className="text-xs text-muted-foreground font-medium">You receive 75 points once your friend completes their first task, and your friend gets 50 points immediately upon registration.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}