import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Share2, Users, Gift, Copy, Check, Twitter, MessageSquare, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

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

  const referralLink = `${window.location.origin}/auth?ref=${profile?.referral_code}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareStats = [
    { label: "Total Referrals", value: "12", icon: Users },
    { label: "Pending", value: "3", icon: Check },
    { label: "Points Earned", value: "600", icon: Gift },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-8">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Refer & Earn</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Invite your friends to PAID POINT and earn 50 points for each person who signs up and completes their first task.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {shareStats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="max-w-2xl mx-auto border-primary/20 bg-primary/5">
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

      <div className="max-w-2xl mx-auto mt-12 space-y-4">
        <h2 className="text-xl font-bold">How it works</h2>
        <div className="grid gap-4">
          {[
            { step: 1, text: "Share your unique referral link with friends." },
            { step: 2, text: "Your friends sign up using your link." },
            { step: 3, text: "They complete their first task to verify their account." },
            { step: 4, text: "You both get 50 bonus points!" },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 items-start p-4 bg-muted/50 rounded-lg border">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                {item.step}
              </div>
              <p className="pt-1">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}