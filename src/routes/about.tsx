import { createFileRoute, Link } from "@tanstack/react-router";
import { LandingNav } from "@/components/landing/LandingNav";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Target, 
  Users, 
  Sparkles, 
  Award, 
  Rocket, 
  ArrowRight,
  Globe,
  Zap,
  BarChart3,
  CircleDollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/about")({
  head: () => ({
    title: "About Noble Gain | Our Mission & Brand Story",
    meta: [
      { name: "description", content: "Learn about Noble Gain's mission to empower digital users through a transparent, secure, and rewarding platform. Discover our story and key features." },
      { property: "og:title", content: "About Noble Gain | Empowering Your Digital Time" },
      { property: "og:description", content: "Discover how Noble Gain is redefining the rewards economy with transparency, security, and global reach." },
      { property: "og:image", content: "https://noblegain.lovable.app/logo.png" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.65, ease: "easeOut" as const } 
  }
};

const storyTimeline = [
  {
    year: "The Beginning",
    title: "A Simple Vision",
    description: "Noble Gain started with a single goal: to prove that digital activity should have tangible value for the user, not just the platform."
  },
  {
    year: "The Evolution",
    title: "Premium Rewards",
    description: "We transitioned from a basic task-earning site to a premium rewards community, focusing on high-quality partnerships and instant redemptions."
  },
  {
    year: "Today",
    title: "Noble Gain",
    description: "Now a global platform, we continue to innovate with smart referrals, enterprise-grade security, and a user-first philosophy."
  }
];

const pillars = [
  {
    title: "Transparency",
    icon: Globe,
    desc: "Every point earned and every referral tracked is visible in real-time. No hidden fees, no opaque rules."
  },
  {
    title: "Security",
    icon: ShieldCheck,
    desc: "We employ multi-layer encryption and anti-fraud protocols to ensure your balance and data are always protected."
  },
  {
    title: "Community",
    icon: Users,
    desc: "Our platform thrives on the success of our users. Our referral network is designed to reward growth together."
  }
];

function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <LandingNav />
      {/* Hero Section */}
      <section className="relative px-4 pt-32 pb-20 sm:px-6 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="container mx-auto max-w-7xl">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={reveal} 
            className="text-center max-w-3xl mx-auto"
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="size-4" /> Our Story & Mission
            </div>
            <h1 className="text-balance text-5xl font-black leading-[0.94] tracking-[-0.06em] text-foreground sm:text-6xl md:text-7xl">
              Empowering your <span className="text-[#e6c17a]">digital footprint.</span>
            </h1>
            <p className="mt-7 text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">
              Noble Gain is built on the belief that every action you take online has value. We provide the tools to capture that value and turn it into rewards.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-4 py-24 sm:px-6 md:py-32 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }} 
              variants={reveal}
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
                <Target className="size-7" />
              </div>
              <h2 className="text-4xl font-black tracking-tight mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Our mission is to democratize the digital economy. We want to ensure that users are compensated fairly for the attention and activity they contribute to the internet.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                By creating a transparent and secure ecosystem, we enable thousands of users worldwide to earn real prizes through simple, daily digital interactions.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square md:aspect-auto md:h-[500px] rounded-[2rem] overflow-hidden border border-border shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-[#e6c17a]/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <img src="/logo.png" alt="Noble Gain" className="w-48 h-48 object-contain" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="px-4 py-24 sm:px-6 md:py-32">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">The Noble Pillars</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Built on trust, transparency, and a commitment to our users.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {pillars.map((pillar, i) => (
              <motion.div 
                key={pillar.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { delay: i * 0.1 } }
                }}
                className="group rounded-3xl border border-border bg-card p-8 transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 group-hover:scale-110 transition-transform">
                  <pillar.icon className="size-6" />
                </div>
                <h3 className="text-xl font-bold mb-4">{pillar.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Timeline */}
      <section className="px-4 py-24 sm:px-6 md:py-32 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">The Evolution of Noble Gain</h2>
          </div>
          <div className="space-y-12">
            {storyTimeline.map((item, i) => (
              <motion.div 
                key={item.year}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={reveal}
                className="flex flex-col md:flex-row gap-8 items-start"
              >
                <div className="md:w-32 flex-shrink-0">
                  <span className="text-sm font-black uppercase tracking-widest text-primary/60">{item.year}</span>
                </div>
                <div className="flex-1 rounded-3xl border border-border bg-card p-8 shadow-sm">
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-y border-primary/20 bg-primary px-4 py-24 text-primary-foreground sm:px-6 md:py-32">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-4xl font-black tracking-[-0.04em] sm:text-6xl">Ready to join the community?</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 opacity-85">
            Start your earning journey today and see why thousands trust Noble Gain.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" variant="secondary" className="h-14 rounded-2xl px-7 font-bold shadow-xl" asChild>
              <Link to="/auth">Create your account <ArrowRight className="ml-2 size-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 rounded-2xl border-primary-foreground/30 px-7 font-bold text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/earn" search={{ tab: "tasks" }}>Explore Opportunities</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer (Simplified or reused from index) */}
      <footer className="border-t border-border bg-card px-4 py-10 sm:px-6">
        <div className="container mx-auto flex flex-col items-center justify-between gap-7 md:flex-row">
          <Link to="/" className="flex items-center gap-2 text-xl font-black tracking-tight">
            <img src="/logo.png" alt="Noble Gain" className="size-8 object-contain" />
            <span className="text-foreground">NOBLE <span className="text-[#e6c17a]">GAIN</span></span>
          </Link>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <Link to="/about" className="text-primary underline underline-offset-4">About</Link>
            <Link to="/earn" search={{ tab: "tasks" }} className="hover:text-primary">Earn</Link>
            <Link to="/redeem" className="hover:text-primary">Redeem</Link>
            <Link to="/privacy" className="hover:text-primary">Privacy</Link>
            <Link to="/terms" className="hover:text-primary">Terms</Link>
          </div>
          <p className="text-center text-xs font-medium text-muted-foreground">© 2026 Noble Gain. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

export default AboutPage;