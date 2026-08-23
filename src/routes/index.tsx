
import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Coins, ArrowRight, ShieldCheck, Zap, Users, Gift, CheckCircle2, Layout, BarChart3, Rocket, Globe, Sparkles, TrendingUp, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { z } from "zod";

export const Route = createFileRoute("/")({
  head: () => ({
    title: "Earn Pal | Reward Your Time with Real Prizes",
    meta: [
      { name: "description", content: "Join Earn Pal, the ultimate rewards community. Earn points by completing simple tasks, referring friends, and watching ads. Redeem your points for premium gift cards and real prizes today!" },
      { property: "og:title", content: "Earn Pal | Reward Your Time & Earn Real Prizes" },
      { property: "og:description", content: "Join thousands of users turning digital activity into rewards. Complete tasks, refer friends, and redeem points for premium gifts. Start earning now!" },
      { property: "og:image", content: "https://earnpal.lovable.app/logo.png" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search) => z.object({ ref: z.string().optional() }).parse(search),
  beforeLoad: async ({ search }) => {
    if (search.ref) throw redirect({ to: "/auth", search: { mode: "signup", ref: search.ref } });
    const { data: { session } } = await supabase.auth.getSession();
    if (session) throw redirect({ to: "/dashboard" });
  },
  component: LandingPage,
});

const reveal = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" as const } } };
const features = [
  { title: "Marketplace Hub", icon: Globe, desc: "A centralized location for available tasks, categorized by difficulty and reward." },
  { title: "Smart Referrals", icon: Users, desc: "Automated tracking and payout for every user you bring to the platform." },
  { title: "Real-time Stats", icon: BarChart3, desc: "Detailed analytics on your performance, clicks, and conversion metrics." },
  { title: "Instant Payouts", icon: Zap, desc: "Lightning-fast redemption processing for gift cards and rewards." },
  { title: "Enterprise Security", icon: ShieldCheck, desc: "Multi-layer protection ensuring your account and data stay secure." },
  { title: "Global Reach", icon: Rocket, desc: "Available worldwide with localized rewards for different regions." },
];

function LandingPage() {
  return <main className="min-h-screen overflow-hidden bg-background">
    <section className="relative isolate px-4 pb-20 pt-32 sm:px-6 md:pb-28 md:pt-40">
      
      <div className="absolute inset-0 -z-10 bg-grid opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
      <div className="container mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
        <motion.div initial="hidden" animate="visible" variants={reveal} className="max-w-2xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary"><Sparkles className="size-4" /> The smarter way to earn</div>
          <h1 className="text-balance text-5xl font-black leading-[0.94] tracking-[-0.06em] text-foreground sm:text-6xl md:text-7xl">Your time is worth <span className="text-primary">more.</span></h1>
          <p className="mt-7 max-w-xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">Complete simple tasks, grow your network, and turn everyday digital activity into rewards you actually want.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Button size="lg" className="h-14 rounded-2xl px-7 text-base font-bold shadow-xl shadow-primary/20" asChild><Link to="/auth">Start earning <ArrowRight data-icon="inline-end" /></Link></Button><Button size="lg" variant="ghost" className="h-14 rounded-2xl px-7 text-base font-bold" asChild><Link to="/earn" search={{ tab: "tasks" }}>Explore the platform</Link></Button></div>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-muted-foreground"><span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /> No upfront cost</span><span className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Secure by design</span></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }} className="relative mx-auto w-full max-w-xl">
          <div className="relative rounded-[2rem] border border-border/70 bg-card p-3 shadow-2xl shadow-primary/10 sm:p-5"><div className="rounded-[1.4rem] bg-muted/60 p-5 sm:p-7"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Available balance</p><p className="mt-2 text-4xl font-black tracking-tight text-foreground">24,680 <span className="text-base font-bold text-primary">pts</span></p></div><div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><CircleDollarSign className="size-6" /></div></div><div className="mt-8 h-3 overflow-hidden rounded-full bg-border"><motion.div initial={{ width: 0 }} animate={{ width: "72%" }} transition={{ duration: 1.2, delay: 0.5 }} className="h-full rounded-full bg-primary" /></div><div className="mt-3 flex justify-between text-xs font-semibold text-muted-foreground"><span>Monthly goal</span><span>72% complete</span></div><div className="mt-8 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-card p-4"><TrendingUp className="size-5 text-primary" /><p className="mt-3 text-2xl font-black">+8,420</p><p className="text-xs font-medium text-muted-foreground">This month</p></div><div className="rounded-2xl bg-card p-4"><Gift className="size-5 text-primary" /><p className="mt-3 text-2xl font-black">12</p><p className="text-xs font-medium text-muted-foreground">Rewards earned</p></div></div></div></div>
          <div className="absolute -bottom-6 -left-3 hidden items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-xl sm:flex"><div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Zap className="size-4" /></div><div><p className="text-xs font-bold">New reward unlocked</p><p className="text-xs text-muted-foreground">Just now</p></div></div>
        </motion.div>
      </div>
    </section>

    <section className="border-y border-border/70 bg-card px-4 py-7 sm:px-6"><div className="container mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-semibold text-muted-foreground sm:justify-between"><span className="flex items-center gap-2"><Coins className="size-4 text-primary" /> Tasks that fit your day</span><span className="flex items-center gap-2"><Users className="size-4 text-primary" /> Rewards that scale</span><span className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Built with trust</span></div></section>

    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={reveal} className="px-4 py-24 sm:px-6 md:py-32"><div className="container mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Your earning command center</p><h2 className="mt-4 text-balance text-4xl font-black tracking-[-0.04em] sm:text-5xl">Everything you earn, in one clear view.</h2><p className="mt-6 text-lg leading-8 text-muted-foreground">Track task progress, manage referral bonuses, and watch your points grow in real time. Earn Pal keeps every opportunity transparent and within reach.</p><Button className="mt-8 h-12 rounded-xl px-6 font-bold" asChild><Link to="/dashboard">Explore dashboard <ArrowRight data-icon="inline-end" /></Link></Button></div><div className="rounded-[2rem] border border-border bg-muted/40 p-3 shadow-xl sm:p-5"><div className="rounded-[1.4rem] border border-border bg-card p-5 sm:p-7"><div className="flex items-center justify-between border-b border-border pb-5"><div><p className="text-sm font-medium text-muted-foreground">Weekly activity</p><p className="mt-1 text-2xl font-black">12,450 pts</p></div><BarChart3 className="size-6 text-primary" /></div><div className="mt-8 flex h-40 items-end justify-between gap-2">{[35,52,44,68,58,82,70,94,76,88,66,100].map((height, i) => <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${height}%` }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="w-full rounded-t-lg bg-primary/80" />)}</div></div></div></div></motion.section>

    <section className="bg-muted/40 px-4 py-24 sm:px-6 md:py-32"><div className="container mx-auto max-w-6xl"><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Made to compound</p><h2 className="mt-4 text-balance text-4xl font-black tracking-[-0.04em] sm:text-5xl">Earn more with your network.</h2><p className="mt-5 text-lg leading-8 text-muted-foreground">Invite people you trust, help them get started, and build a rewarding stream that keeps working in the background.</p><Button size="lg" className="mt-8 h-14 rounded-2xl px-7 font-bold" asChild><Link to="/refer">View referral rewards <ArrowRight data-icon="inline-end" /></Link></Button></div></div></section>

    <section className="px-4 py-24 sm:px-6 md:py-32"><div className="container mx-auto max-w-6xl"><div className="mb-12 max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">One platform, many ways forward</p><h2 className="mt-4 text-balance text-4xl font-black tracking-[-0.04em] sm:text-5xl">Built for momentum.</h2></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map((feature, i) => <motion.div key={feature.title} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={{ ...reveal, visible: { ...reveal.visible, transition: { ...reveal.visible.transition, delay: i * 0.06 } } }} className="group rounded-3xl border border-border bg-card p-7 transition-shadow hover:shadow-xl hover:shadow-primary/5"><div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110"><feature.icon className="size-5" /></div><h3 className="mt-6 text-xl font-bold">{feature.title}</h3><p className="mt-3 leading-7 text-muted-foreground">{feature.desc}</p></motion.div>)}</div></div></section>

    <section className="border-y border-primary/20 bg-primary px-4 py-24 text-primary-foreground sm:px-6 md:py-32"><div className="container mx-auto max-w-3xl text-center"><h2 className="text-balance text-4xl font-black tracking-[-0.04em] sm:text-6xl">Make your time count.</h2><p className="mx-auto mt-6 max-w-xl text-lg leading-8 opacity-85">Join thousands of people turning small actions into meaningful rewards.</p><div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><Button size="lg" variant="secondary" className="h-14 rounded-2xl px-7 font-bold" asChild><Link to="/auth">Create your account <ArrowRight data-icon="inline-end" /></Link></Button><Button size="lg" variant="outline" className="h-14 rounded-2xl border-primary-foreground/30 px-7 font-bold text-primary-foreground hover:bg-primary-foreground/10" asChild><Link to="/auth">Log in</Link></Button></div></div></section>

    <section className="px-4 py-24 sm:px-6"><div className="container mx-auto max-w-2xl"><h2 className="text-center text-3xl font-black tracking-[-0.03em] sm:text-4xl">Frequently asked questions</h2><Accordion type="single" collapsible className="mt-10 w-full"><AccordionItem value="1"><AccordionTrigger className="text-left text-lg font-bold">How do I start earning?</AccordionTrigger><AccordionContent>Simply sign up and head to the Tasks page. Complete any listed task to start accumulating points instantly.</AccordionContent></AccordionItem><AccordionItem value="2"><AccordionTrigger className="text-left text-lg font-bold">Is referral tracking real-time?</AccordionTrigger><AccordionContent>Yes, our system tracks clicks, signups, and point accruals in real-time on your dedicated Referrals Dashboard.</AccordionContent></AccordionItem><AccordionItem value="3"><AccordionTrigger className="text-left text-lg font-bold">How secure are my points?</AccordionTrigger><AccordionContent>We use enterprise-grade encryption and anti-fraud systems to ensure your points balance is always accurate and secure.</AccordionContent></AccordionItem></Accordion></div></section>

    <footer className="border-t border-border bg-card px-4 py-10 sm:px-6"><div className="container mx-auto flex flex-col items-center justify-between gap-7 md:flex-row"><Link to="/" className="flex items-center gap-2 text-xl font-black tracking-tight text-primary"><img src="/logo.png" alt="Earn Pal" className="size-7 object-contain" /> EARN PAL</Link><div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs font-bold uppercase tracking-widest text-muted-foreground"><Link to="/" className="hover:text-primary">Home</Link><Link to="/earn" search={{ tab: "tasks" }} className="hover:text-primary">Earn</Link><Link to="/redeem" className="hover:text-primary">Redeem</Link><Link to="/privacy" className="hover:text-primary">Privacy</Link><Link to="/terms" className="hover:text-primary">Terms</Link><Link to="/auth" className="hover:text-primary">Login</Link></div><p className="text-center text-xs font-medium text-muted-foreground">© 2026 Earn Pal. All rights reserved.</p></div></footer>
  </main>;
}

export default LandingPage;
