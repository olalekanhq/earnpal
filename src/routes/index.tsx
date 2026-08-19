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
      <section className="relative pt-20 pb-20 md:pt-32 md:pb-40 overflow-hidden bg-background bg-grid">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20 animate-in fade-in slide-in-from-bottom-2">
              <Zap className="h-4 w-4" />
              <span>THE FUTURE OF REWARDS IS HERE</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-foreground uppercase leading-[0.9] animate-in fade-in slide-in-from-bottom-4 duration-500">
              Grow your Digital Empire <span className="text-primary italic">Without the Chaos</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
              Unified control for marketplace tasks, referrals, and earning—all in one intelligent dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <Button size="lg" className="text-lg px-8 h-14 font-black shadow-xl shadow-primary/20 group uppercase" asChild>
                <Link to="/auth">
                  Get Started →
                </Link>
              </Button>
              <Button size="lg" variant="ghost" className="text-lg px-8 h-14 font-black uppercase text-foreground/70 hover:text-foreground" asChild>
                <Link to="/earn">Learn more</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: Dashboard Highlight */}
      <section className="py-24 bg-accent/10 border-y">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Unified Control in One Dashboard</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">Connect your sales, tasks, and referrals into a single interface. Say goodbye to fragmented tools and customize your workflow in minutes — and you're ready to scale!</p>
              <Button className="font-black uppercase" asChild><Link to="/dashboard">Explore Dashboard →</Link></Button>
            </div>
            <div className="bg-white p-4 rounded-3xl border shadow-2xl shadow-primary/10 rotate-2 hover:rotate-0 transition-transform">
               <div className="aspect-video bg-gray-100 rounded-2xl flex items-center justify-center border">
                  <Layout className="h-16 w-16 text-primary/50" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: Scalability */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Limitless Growth and Scale</h2>
            <p className="text-lg text-muted-foreground">Built on enterprise-grade infrastructure, Earn Pal effortlessly handles your traffic spikes, high transaction volumes, and thousands of concurrent users as your business scales.</p>
            <Button size="lg" className="uppercase font-black" asChild><Link to="/refer">Explore Referral Architecture →</Link></Button>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-24 bg-accent/10 border-t">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-black uppercase mb-12 text-center">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="1">
              <AccordionTrigger className="text-lg font-bold">How do I start earning?</AccordionTrigger>
              <AccordionContent>Simply sign up and head to the Tasks page. Complete any listed task to start accumulating points instantly.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="2">
              <AccordionTrigger className="text-lg font-bold">Is referral tracking real-time?</AccordionTrigger>
              <AccordionContent>Yes, our system tracks clicks, signups, and point accruals in real-time on your dedicated Referrals Dashboard.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="3">
              <AccordionTrigger className="text-lg font-bold">How secure are my points?</AccordionTrigger>
              <AccordionContent>We use enterprise-grade encryption and anti-fraud systems to ensure your points balance is always accurate and secure.</AccordionContent>
            </AccordionItem>
          </Accordion>
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
