import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Coins, ArrowRight, ShieldCheck, Zap, Users, Gift, CheckCircle2, Layout, BarChart3, Rocket, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    title: "Earn Pal | The Ultimate Rewards Platform",
    meta: [
      { name: "description", content: "Earn points for simple tasks, refer friends, and redeem for amazing prizes on Earn Pal. Join the most intelligent earning platform today." },
      { property: "og:title", content: "Earn Pal | Reward Your Time" },
      { property: "og:description", content: "Turn your time into real rewards. Join Earn Pal and start earning today." },
      { property: "og:image", content: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=1200" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Earn Pal | Reward Your Time" },
      { name: "twitter:description", content: "The ultimate rewards community. Complete tasks, refer friends, and unlock premium rewards." },
    ],
  }),
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    // We only redirect if we definitely have a session.
    // If not, we don't wait/retry here because the landing page is public.
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
      <section className="relative pt-20 pb-20 md:pt-32 md:pb-40 overflow-hidden bg-muted/30">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 animate-in fade-in slide-in-from-bottom-2 uppercase tracking-widest">
              <Zap className="h-3 w-3" />
              <span>The ultimate rewards community</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[0.9] animate-in fade-in slide-in-from-bottom-4 duration-500">
              Turn Your Time Into <span className="text-primary italic">Real Rewards</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
              Complete simple tasks, refer your friends, and unlock premium rewards. Join the most intelligent earning platform today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <Button size="lg" className="text-lg px-8 h-14 font-bold shadow-xl shadow-primary/20 group uppercase" asChild>
                <Link to="/auth">
                  Get Started →
                </Link>
              </Button>
              <Button size="lg" variant="ghost" className="text-lg px-8 h-14 font-bold uppercase text-foreground/70 hover:text-foreground" asChild>
                <Link to="/earn">Learn more</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: Dashboard Highlight */}
      <section className="py-24 bg-card border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">Everything You Earn, in One Place</h2>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed">Track your task progress, manage referral bonuses, and watch your points grow in real-time. Our intuitive dashboard makes earning simple and transparent.</p>
              <Button className="font-bold rounded-xl h-12 px-8" asChild><Link to="/dashboard">Explore Dashboard →</Link></Button>
            </div>
            <div className="bg-muted/30 p-6 rounded-[2.5rem] border border-border/50 shadow-2xl shadow-primary/5 rotate-2 hover:rotate-0 transition-all duration-500">
               <div className="aspect-video bg-gray-100 rounded-2xl flex items-center justify-center border">
                  <Layout className="h-16 w-16 text-primary/50" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: Scalability */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Earn More with Your Network</h2>
            <p className="text-lg text-muted-foreground font-medium">Our advanced referral system allows you to build a passive income stream. Earn a percentage of everything your friends earn, for life.</p>
            <Button size="lg" className="rounded-xl font-bold h-14 px-10" asChild><Link to="/refer">View Referral Rewards →</Link></Button>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-24 bg-card border-t border-border/50">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-black mb-12 text-center">Frequently asked questions</h2>
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

      {/* Feature Grid: More Capabilities */}
      <section className="py-24 bg-muted/30 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase text-primary tracking-widest">Platform Features</span>
            <h2 className="text-4xl md:text-5xl font-black mt-4">Everything you need to scale</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Marketplace Hub", icon: Globe, desc: "A centralized location for all available tasks, categorized by difficulty and reward." },
              { title: "Smart Referrals", icon: Users, desc: "Automated tracking and payout for every user you bring to the platform." },
              { title: "Real-time Stats", icon: BarChart3, desc: "Detailed analytics on your performance, click rates, and conversion metrics." },
              { title: "Instant Payouts", icon: Zap, desc: "Lightning-fast redemption processing for gift cards and other rewards." },
              { title: "Enterprise Security", icon: ShieldCheck, desc: "Multi-layer protection ensuring your account and data are never compromised." },
              { title: "Global Reach", icon: Rocket, desc: "Available worldwide with localized rewards for different regions." },
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-[2rem] border-none shadow-sm bg-card hover:shadow-xl transition-all duration-300 space-y-4 group">
                <div className="bg-primary/10 w-fit p-3 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section: Final Call to Action */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight">Ready to start earning?</h2>
          <p className="text-xl opacity-90 font-medium max-w-2xl mx-auto">Join thousands of users who are already turning their daily digital activity into real-world rewards.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" variant="secondary" className="text-lg px-8 h-14 font-bold shadow-xl rounded-xl bg-white text-primary hover:bg-white/90 border-none" asChild>
              <Link to="/auth">Create your account →</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 h-14 font-bold border-white/20 hover:bg-white/10 text-white rounded-xl" asChild>
              <Link to="/auth">Log in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 font-black text-2xl text-primary">
              <Coins className="h-6 w-6" />
              <span className="tracking-tighter">EARN PAL</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              <Link to="/" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Home</Link>
              <Link to="/earn" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Earn</Link>
              <Link to="/redeem" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Redeem</Link>
              <Link to="/privacy" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Privacy</Link>
              <Link to="/terms" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Terms</Link>
              <Link to="/auth" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Login</Link>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              © 2026 Earn Pal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
