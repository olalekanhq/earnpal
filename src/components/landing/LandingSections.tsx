import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Compass,
  Gift,
  LineChart,
  Lock,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DashboardMock, HistoryMock, OpportunitiesMock, RedeemMock } from "./mockups";

const fade = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 0.8, 0.2, 1] as const } },
};

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={fade}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">{children}</p>
  );
}

const Section = ({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section id={id} className={`scroll-mt-24 px-4 py-16 sm:px-6 md:py-28 ${className}`}>
    <div className="mx-auto max-w-6xl">{children}</div>
  </section>
);

/* 3 — Trust strip */
export function TrustStrip() {
  const items = [
    { icon: Sparkles, label: "Simple earning experience" },
    { icon: LineChart, label: "Transparent activity tracking" },
    { icon: ShieldCheck, label: "Secure account management" },
    { icon: CheckCircle2, label: "Built for everyday users" },
  ];
  return (
    <div className="border-y border-hairline bg-ink-2/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:gap-6">
        {items.map((it) => (
          <div key={it.label} className="flex min-w-0 items-center gap-2.5">
            <it.icon className="size-4 shrink-0 text-gold" />
            <span className="text-xs font-semibold tracking-tight text-ink-muted sm:text-[13px]">
              {it.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 4 + 5 — Value proposition and feature grid */
export function Features() {
  return (
    <Section id="opportunities">
      <Reveal className="max-w-2xl">
        <Eyebrow>The platform</Eyebrow>
        <h2 className="mt-4 text-[clamp(1.9rem,5.4vw,3.25rem)] font-black leading-[1.02] tracking-[-0.045em] text-ink-fg">
          Everything you need to earn, in one place.
        </h2>
        <p className="mt-5 text-[15px] leading-7 text-ink-muted sm:text-base">
          Earn Pal brings opportunities, verification, progress and reward redemption into a single
          account. You always know what an activity is worth and where it stands.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-3 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
        <Reveal className="sm:col-span-2">
          <article className="group h-full rounded-2xl border border-hairline bg-ink-2/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold/25 sm:p-8">
            <span className="grid size-10 place-items-center rounded-xl bg-gold/10 text-gold">
              <Compass className="size-5" />
            </span>
            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-muted">
              Discover
            </p>
            <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-ink-fg sm:text-2xl">
              Opportunities organised by category and reward
            </h3>
            <p className="mt-3 max-w-lg text-sm leading-6 text-ink-muted">
              Browse available activities with the point value shown upfront, including instant
              activities and ones that require a short review.
            </p>
          </article>
        </Reveal>

        {[
          {
            icon: Wallet,
            label: "Balance",
            title: "Track your earnings",
            desc: "Every credit and redemption is recorded in your transaction history.",
          },
          {
            icon: CheckCircle2,
            label: "Complete",
            title: "Submit activities",
            desc: "Finish an activity, submit it, and follow its status through to verification.",
          },
          {
            icon: BarChart3,
            label: "Progress",
            title: "Monitor momentum",
            desc: "Daily activity, streaks and referral performance in one clear view.",
          },
          {
            icon: Gift,
            label: "Rewards",
            title: "Redeem your points",
            desc: "Exchange collected points for available rewards and track each request.",
          },
          {
            icon: Lock,
            label: "Security",
            title: "Protected account",
            desc: "Email verification, role-based access and per-account data rules.",
          },
        ].map((f, i) => (
          <Reveal key={f.title} delay={i * 0.04}>
            <article className="group h-full rounded-2xl border border-hairline bg-ink-2/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold/25">
              <span className="grid size-9 place-items-center rounded-lg bg-gold/10 text-gold">
                <f.icon className="size-4" />
              </span>
              <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-muted">
                {f.label}
              </p>
              <h3 className="mt-1.5 text-lg font-black tracking-[-0.03em] text-ink-fg">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-muted">{f.desc}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* 6 — Product showcase */
export function Showcase() {
  const blocks = [
    {
      eyebrow: "Discovery",
      title: "Find the next opportunity in seconds",
      desc: "Available activities are grouped by category with the reward value attached, so nothing is hidden behind a click.",
      mock: <OpportunitiesMock />,
    },
    {
      eyebrow: "Earnings",
      title: "A dashboard that stays honest",
      desc: "Balance, daily progress and recent credits update as your activity is verified.",
      mock: <DashboardMock />,
      flip: true,
    },
    {
      eyebrow: "History",
      title: "Every submission has a status",
      desc: "Pending, verified or needs revision — with the reason attached when something is returned.",
      mock: <HistoryMock />,
    },
    {
      eyebrow: "Redemption",
      title: "Turn points into rewards",
      desc: "Redeem when you reach a reward's point cost and follow the request from submitted to fulfilled.",
      mock: <RedeemMock />,
      flip: true,
    },
  ];

  return (
    <Section className="border-t border-hairline">
      <Reveal className="max-w-xl">
        <Eyebrow>Inside Earn Pal</Eyebrow>
        <h2 className="mt-4 text-[clamp(1.75rem,4.8vw,2.75rem)] font-black leading-[1.05] tracking-[-0.045em] text-ink-fg">
          See exactly how it works before you join.
        </h2>
      </Reveal>

      <div className="mt-12 space-y-14 sm:mt-16 sm:space-y-24">
        {blocks.map((b) => (
          <Reveal key={b.title}>
            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
              <div className={b.flip ? "lg:order-2" : ""}>
                <Eyebrow>{b.eyebrow}</Eyebrow>
                <h3 className="mt-3 text-2xl font-black tracking-[-0.04em] text-ink-fg sm:text-3xl">
                  {b.title}
                </h3>
                <p className="mt-4 max-w-md text-sm leading-7 text-ink-muted sm:text-[15px]">
                  {b.desc}
                </p>
              </div>
              <div className={b.flip ? "lg:order-1" : ""}>{b.mock}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* 7 — How it works */
export function HowItWorks() {
  const steps = [
    { n: "01", t: "Create your account", d: "Sign up with your email and verify it to activate your account." },
    { n: "02", t: "Choose an opportunity", d: "Pick an available activity and see its reward before you start." },
    { n: "03", t: "Complete the activity", d: "Submit your work; instant activities credit right away." },
    { n: "04", t: "Receive and track your reward", d: "Points land in your balance and stay visible in your history." },
  ];
  return (
    <Section id="how-it-works" className="border-t border-hairline bg-ink-2/30">
      <Reveal className="max-w-xl">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-4 text-[clamp(1.75rem,4.8vw,2.75rem)] font-black leading-[1.05] tracking-[-0.045em] text-ink-fg">
          Four steps from sign-up to reward.
        </h2>
      </Reveal>
      <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-hairline bg-[color:var(--hairline)] sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.05}>
            <div className="h-full bg-ink px-6 py-8 transition-colors duration-300 hover:bg-ink-2/70">
              <p className="text-3xl font-black tracking-[-0.05em] text-gold/80 sm:text-4xl">{s.n}</p>
              <h3 className="mt-5 text-base font-black tracking-[-0.02em] text-ink-fg">{s.t}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-muted">{s.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* 8 + 9 — Benefits split layout with progress visual */
export function Benefits() {
  const items = [
    { t: "Transparency", d: "Point values, statuses and reasons are always visible." },
    { t: "Ease of use", d: "A focused interface with no unnecessary steps." },
    { t: "Progress tracking", d: "Daily activity, streaks and referrals in one dashboard." },
    { t: "Simple redemption", d: "Exchange points for rewards with a clear request trail." },
    { t: "Secure by design", d: "Verified accounts and strict per-user data access." },
  ];
  return (
    <Section id="benefits" className="border-t border-hairline">
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1fr] lg:gap-16">
        <Reveal>
          <Eyebrow>Why Earn Pal</Eyebrow>
          <h2 className="mt-4 text-[clamp(1.75rem,4.8vw,2.75rem)] font-black leading-[1.05] tracking-[-0.045em] text-ink-fg">
            Built to be understood, not guessed at.
          </h2>
          <p className="mt-5 text-sm leading-7 text-ink-muted sm:text-[15px]">
            Earning should be predictable. Earn Pal shows what each activity is worth, what state it
            is in, and what your points can be exchanged for — before you commit your time.
          </p>
          <div className="mt-8">
            <DashboardMock />
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <ul className="divide-y divide-[color:var(--hairline)] border-y border-hairline">
            {items.map((it) => (
              <li key={it.t} className="group flex gap-4 py-5">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-gold/10 text-gold transition-transform duration-300 group-hover:scale-105">
                  <CheckCircle2 className="size-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-black tracking-[-0.02em] text-ink-fg">{it.t}</h3>
                  <p className="mt-1 text-sm leading-6 text-ink-muted">{it.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}

/* 10 — FAQ */
export function Faq() {
  const faqs = [
    {
      q: "How does Earn Pal work?",
      a: "You create an account, choose from the available activities, complete them, and receive points. Points are recorded in your balance and can be redeemed for available rewards.",
    },
    { q: "Is it free to join?", a: "Yes. Creating an Earn Pal account is free and there is no subscription." },
    {
      q: "How do I earn?",
      a: "By completing available activities, keeping a daily streak, and referring people who complete their first activity. Each activity shows its point value before you start.",
    },
    {
      q: "How are rewards tracked?",
      a: "Every credit and redemption appears in your transaction history, and each submission carries a status: pending, verified or returned with a reason.",
    },
    {
      q: "How do withdrawals work?",
      a: "Points are exchanged for rewards from the rewards catalogue. Once you meet a reward's point cost you submit a redemption request and follow its status until it is fulfilled.",
    },
    {
      q: "Can I use Earn Pal on mobile?",
      a: "Yes. The platform is fully responsive, with a dedicated mobile navigation for the dashboard, activities and rewards.",
    },
    {
      q: "How is my account protected?",
      a: "Accounts are verified by email, access is role-based, and account data is restricted per user at the database level.",
    },
  ];
  return (
    <Section id="faq" className="border-t border-hairline bg-ink-2/30">
      <div className="grid gap-10 lg:grid-cols-[0.7fr_1fr] lg:gap-16">
        <Reveal>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-4 text-[clamp(1.75rem,4.8vw,2.5rem)] font-black leading-[1.06] tracking-[-0.045em] text-ink-fg">
            Answers before you sign up.
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f) => (
              <AccordionItem
                key={f.q}
                value={f.q}
                className="border-b border-[color:var(--hairline)]"
              >
                <AccordionTrigger className="py-5 text-left text-[15px] font-bold tracking-tight text-ink-fg hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-7 text-ink-muted">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </Section>
  );
}

/* 11 — Final CTA */
export function FinalCta() {
  return (
    <Section className="border-t border-hairline">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-hairline bg-ink-2/60 px-6 py-14 text-center sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-gold/12 blur-3xl ink-breathe" />
          <div className="relative">
            <h2 className="text-[clamp(1.85rem,5.2vw,3rem)] font-black leading-[1.03] tracking-[-0.045em] text-ink-fg">
              Ready to start earning?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-ink-muted sm:text-base">
              Join Earn Pal and turn your available time into meaningful progress.
            </p>
            <Link
              to="/auth"
              className="group mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-gold px-6 text-sm font-bold tracking-tight text-ink transition-transform duration-200 hover:-translate-y-0.5 sm:h-13"
            >
              Get Started
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* 12 — Footer */
export function LandingFooter() {
  return (
    <footer className="border-t border-hairline px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1.3fr_repeat(3,minmax(0,1fr))]">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Earn Pal" className="h-7 w-7 shrink-0 object-contain" />
              <span className="text-base font-black tracking-[-0.03em] text-ink-fg">
                Earn<span className="text-gold">Pal</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-ink-muted">
              Complete opportunities, earn rewards and track your progress from one simple platform.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-fg/70">
              Platform
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
              <li><a href="#opportunities" className="hover:text-ink-fg">Opportunities</a></li>
              <li><a href="#how-it-works" className="hover:text-ink-fg">How it works</a></li>
              <li><a href="#benefits" className="hover:text-ink-fg">Benefits</a></li>
              <li><Link to="/auth" className="hover:text-ink-fg">Sign in</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-fg/70">
              Company
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
              <li><Link to="/about" className="hover:text-ink-fg">About</Link></li>
              <li><a href="#faq" className="hover:text-ink-fg">FAQ</a></li>
              <li><Link to="/auth" className="hover:text-ink-fg">Get started</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-fg/70">
              Legal &amp; support
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
              <li><Link to="/privacy" className="hover:text-ink-fg">Privacy policy</Link></li>
              <li><Link to="/terms" className="hover:text-ink-fg">Terms of service</Link></li>
              <li><Link to="/about" className="hover:text-ink-fg">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-hairline pt-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Earn Pal. All rights reserved.</span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-3.5 text-gold" /> Secure account management
          </span>
        </div>
      </div>
    </footer>
  );
}
