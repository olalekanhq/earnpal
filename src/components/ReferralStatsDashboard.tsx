import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MousePointerClick, Gift, TrendingUp, Copy, Check, Twitter, MessageSquare, ExternalLink, ArrowRight, Shield, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { QRCodeCanvas } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ReferralStatsDashboard() {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      return data;
    },
  });

  const { data: referralsStats } = useQuery({
    queryKey: ["referrals-stats", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return { total_referrals: 0, points_earned: 0 };
      const { data, error } = await supabase
        .from("referral_stats_summary")
        .select("*")
        .eq("user_id", profile.id)
        .maybeSingle();
      
      if (error) throw error;
      return data || { total_referrals: 0, points_earned: 0 };
    },
    enabled: !!profile?.id,
  });

  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/?ref=${profile?.referral_code || ''}` : '';

  const copyLink = () => {
    if (!referralLink) return;
    const referralNote = `Join me on Earn Pal and start earning rewards together! Use my link: ${referralLink}`;
    navigator.clipboard.writeText(referralNote);
    setCopiedLink(true);
    toast.success("Referral message copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyCode = () => {
    if (!profile?.referral_code) return;
    navigator.clipboard.writeText(profile.referral_code);
    setCopiedCode(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const nextMilestone = 10;
  const count = referralsStats?.total_referrals || 0;
  const pointsEarned = referralsStats?.points_earned || 0;
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
              <p className="text-2xl font-black">{pointsEarned}</p>
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
        <div className="relative z-10 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-black">Your Referral Details</h2>
            <p className="text-violet-100 font-medium">Copy your link message or code and share it to earn rewards.</p>
            <span className="sr-only">
              '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
              
              Update the copy button so it copies the referral note plus the full referral URL as one combined message, not just the raw link.

              Add a toast notification after the referral button copies the referral note and link to the clipboard.
            </span>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Referral Link Section */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">Referral Link Message</label>
              <Button 
                onClick={copyLink}
                className="w-full h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl flex items-center justify-between px-4 transition-all"
              >
                <span className="font-bold truncate mr-2">Copy Referral Link Message</span>
                {copiedLink ? <Check className="h-4 w-4 shrink-0" /> : <Copy className="h-4 w-4 shrink-0" />}
              </Button>
            </div>

            {/* Referral Code Section */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">Referral Code Only</label>
              <div className="relative">
                <Input 
                  readOnly 
                  value={profile?.referral_code || ""} 
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl pr-12 focus-visible:ring-white/30 font-mono tracking-wider"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={copyCode}
                  className="absolute right-1 top-1 text-white hover:bg-white/10 h-10 w-10"
                >
                  {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <p className="text-xs font-bold text-violet-200 uppercase tracking-widest">Quick Share:</p>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="h-11 w-11 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl" title="Show QR Code">
                    <QrCode className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="text-center text-xl font-black">Scan to Join</DialogTitle>
                    <DialogDescription className="text-center font-medium">
                      Share this QR code with your friends to refer them instantly.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center justify-center p-6 space-y-4">
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-border/50">
                      <QRCodeCanvas 
                        value={referralLink} 
                        size={200}
                        level="H"
                        includeMargin={true}
                        imageSettings={{
                          src: "/logo.png",
                          height: 40,
                          width: 40,
                          excavate: true,
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-primary uppercase tracking-widest">{profile?.referral_code}</p>
                      <p className="text-xs text-muted-foreground font-medium mt-1">Your Unique Referral Code</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="icon" className="h-11 w-11 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl" onClick={() => window.open(`https://twitter.com/intent/tweet?text=Join%20me%20on%20Earn%20Pal%20and%20start%20earning%20rewards!%20${referralLink}`, '_blank')}>
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="h-11 w-11 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl" onClick={() => window.open(`https://wa.me/?text=Join%20me%20on%20Earn%20Pal%20and%20start%20earning%20rewards!%20${referralLink}`, '_blank')}>
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
