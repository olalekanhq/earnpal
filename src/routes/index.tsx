import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Coins, ArrowRight, ShieldCheck, Zap, Users, Gift, CheckCircle2, Layout, BarChart3, Rocket, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    title: "Earn Pal | The Ultimate Rewards Platform",
    meta: [
      { name: "description", content: "Earn points for simple tasks, refer friends, and redeem for amazing prizes on Earn Pal." },
      { property: "og:title", content: "Earn Pal | The Ultimate Rewards Platform" },
      { property: "og:image", content: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=1200" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 md:pt-32 md:pb-40 overflow-hidden bg-background">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20 animate-in fade-in slide-in-from-bottom-2">
              <Zap className="h-4 w-4" />
              <span>EARN PAL IS NOW LIVE</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground uppercase leading-[0.9] animate-in fade-in slide-in-from-bottom-4 duration-500">
              Turn Your <span className="text-primary">Time</span> Into <span className="text-primary underline decoration-primary/30">Rewards</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
              The simplest way to earn points online. Complete daily tasks, refer your squad, and cash out for premium gifts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <Button size="lg" className="text-lg px-8 h-14 font-black shadow-xl shadow-primary/20 group" asChild>
                <Link to="/auth">
                  GET STARTED NOW <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 font-black" asChild>
                <Link to="/earn">VIEW ALL TASKS</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary rounded-full blur-[120px] mix-blend-multiply" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-400 rounded-full blur-[120px] mix-blend-multiply" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Active Users", value: "50K+" },
              { label: "Points Paid", value: "12M+" },
              { label: "Tasks Done", value: "850K+" },
              { label: "Happy Earners", value: "99%" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-black text-foreground">{stat.value}</div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">How It Works</h2>
            <p className="text-muted-foreground font-medium max-w-xl mx-auto text-lg">
              Three simple steps to start cashing in on your daily activity.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Complete Tasks",
                desc: "Follow socials, watch videos, or take surveys. New tasks added every hour.",
                icon: Zap,
                color: "bg-blue-500",
              },
              {
                title: "Grow Your Team",
                desc: "Refer friends and earn 10% of their earnings forever. No caps on referrals.",
                icon: Users,
                color: "bg-primary",
              },
              {
                title: "Redeem Rewards",
                desc: "Convert your hard-earned points into gift cards, crypto, or cash instantly.",
                icon: Gift,
                color: "bg-purple-500",
              },
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-3xl border bg-card hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5">
                <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-4 uppercase">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl md:text-5xl font-black uppercase leading-none">
                Safe. Secure. <br />
                <span className="text-primary">Reliable.</span>
              </h2>
              <p className="text-lg text-muted-foreground font-medium">
                We use enterprise-grade security to ensure your data and earnings are always protected. Join a community that values your privacy.
              </p>
              <div className="space-y-4">
                {[
                  "SSL Encrypted Transactions",
                  "Verified Redemption Partners",
                  "24/7 Dedicated Support",
                  "Anti-Fraud Protection Systems",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-bold text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full max-w-md">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-blue-400/20 border-2 border-primary/10 flex items-center justify-center p-8 relative">
                 <ShieldCheck className="h-32 w-32 text-primary animate-pulse" />
                 <div className="absolute inset-0 border-[20px] border-background/50 rounded-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 font-black text-2xl text-primary">
              <Coins className="h-8 w-8" />
              <span>EARN PAL</span>
            </div>
            <div className="flex gap-8">
              <Link to="/" className="text-sm font-bold text-muted-foreground hover:text-foreground">HOME</Link>
              <Link to="/earn" className="text-sm font-bold text-muted-foreground hover:text-foreground">EARN</Link>
              <Link to="/redeem" className="text-sm font-bold text-muted-foreground hover:text-foreground">REDEEM</Link>
              <Link to="/auth" className="text-sm font-bold text-muted-foreground hover:text-foreground">LOGIN</Link>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              © 2026 EARN PAL. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
