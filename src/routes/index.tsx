import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";
import { LandingNav } from "@/components/landing/LandingNav";
import { DashboardMock } from "@/components/landing/mockups";
import {
  Benefits,
  Faq,
  Features,
  FinalCta,
  HowItWorks,
  LandingFooter,
  Showcase,
  TrustStrip,
} from "@/components/landing/LandingSections";

export const Route = createFileRoute("/")({
  head: () => ({
    title: "Earn Pal | Complete Opportunities, Earn Real Rewards",
    meta: [
      {
        name: "description",
        content:
          "Earn Pal turns your available time into rewards. Complete simple opportunities, track every point you earn, and redeem your balance for real rewards.",
      },
      { property: "og:title", content: "Earn Pal | Complete Opportunities, Earn Real Rewards" },
      {
        property: "og:description",
        content:
          "Discover opportunities, complete them, and watch your points grow. Transparent tracking, secure accounts and simple reward redemption.",
      },
      { property: "og:image", content: "https://earnpal.lovable.app/logo.png" },
      { name: "twitter:image", content: "https://earnpal.lovable.app/logo.png" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search) => z.object({ ref: z.string().optional() }).parse(search),
  beforeLoad: async ({ search }) => {
    if (search.ref) throw redirect({ to: "/auth", search: { mode: "signup", ref: search.ref } });
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) throw redirect({ to: "/dashboard" });
  },
  component: LandingPage,
});

function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-16 pt-28 sm:px-6 md:pb-24 md:pt-36">
      <div className="pointer-events-none absolute inset-0 -z-10 ink-dots opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 size-[34rem] -translate-x-1/2 rounded-full bg-gold/10 blur-[120px] ink-breathe" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_0.95fr] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 0.8, 0.2, 1] }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-ink-2/70 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
            <Sparkles className="size-3.5" /> Rewards, made transparent
          </div>
          <h1 className="mt-6 text-balance text-[clamp(2.4rem,8vw,4.5rem)] font-black leading-[0.95] tracking-[-0.055em] text-ink-fg">
            Turn your time into <span className="text-gold">real rewards.</span>
          </h1>
          <p className="mt-6 max-w-lg text-pretty text-[15px] leading-7 text-ink-muted sm:text-lg sm:leading-8">
            Earn Pal is a simple rewards platform: pick an opportunity, complete it, and collect
            points you can redeem. Every value, status and payout stays visible.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gold px-6 text-sm font-bold tracking-tight text-ink transition-transform duration-200 hover:-translate-y-0.5 sm:h-13"
            >
              Get Started
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-hairline px-6 text-sm font-bold tracking-tight text-ink-fg transition-colors duration-200 hover:border-gold/30 hover:text-gold sm:h-13"
            >
              See how it works
            </a>
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] font-medium text-ink-muted">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-gold" /> Free to join
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-gold" /> Secure, verified accounts
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 0.8, 0.2, 1] }}
          className="relative w-full"
        >
          <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-gold/6 blur-2xl" />
          <DashboardMock className="shadow-2xl shadow-black/40" />
        </motion.div>
      </div>
    </section>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-ink text-ink-fg">
      <LandingNav />
      <main>
        <Hero />
        <TrustStrip />
        <Features />
        <Showcase />
        <HowItWorks />
        <Benefits />
        <Faq />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
