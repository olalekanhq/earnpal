import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MousePointerClick, Gift, TrendingUp, Copy, Check, Twitter, MessageSquare, ExternalLink, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export function ReferralStatsDashboard() {
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

  const { data: referralsCount } = useQuery({
    queryKey: ["referrals-count", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return 0;
      const { count } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_id", profile.id);
      return count || 0;
    },
    enabled: !!profile?.id,
  });

  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/?ref=${profile?.referral_code || ''}` : '';

  const copyToClipboard = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const nextMilestone = 10;
  const count = referralsCount || 0;
  const progress = Math.min((count / nextMilestone) * 100, 100);

  return (
    <div className="space-y-6">
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
            <div className="p-2 bg-violet-50 w-fit rounded-lg text-violet-600">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Referrals</p>
              <p className="text-2xl font-black">{count}</p>
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
              <p className="text-2xl font-black">{count * 75}</p>
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
              <p className="text-2xl font-black">{profile?.referral_clicks ? Math.round((count / profile.referral_clicks) * 100) : 0}%</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-violet-600 text-white p-6 md:p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black">Your Referral Link</h2>
            <p className="text-violet-100 font-medium">Copy your link and share it on social media to earn rewards.</p>
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

      <Card className="border-none shadow-sm bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold">Milestone Progress</h3>
          <div className="bg-orange-50 px-2 py-1 rounded-lg">
            <span className="text-[10px] font-bold text-orange-600 uppercase">LVL 1</span>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Goal: Super Referrer</span>
              <span>{count} / {nextMilestone} Invites</span>
            </div>
            <Progress value={progress} className="h-2 bg-muted" />
          </div>

          <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100 flex items-start gap-3">
            <div className="bg-white p-2 rounded-xl shadow-sm text-violet-600 shrink-0">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-violet-900">Unlock Super Referrer</p>
              <p className="text-xs text-violet-700 font-medium mt-1">
                Invite {Math.max(0, nextMilestone - count)} more friends to unlock the badge and get a 200 point bonus!
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
