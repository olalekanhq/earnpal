import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => {
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://noblegain.lovable.app';
    const canonicalUrl = `${url}/terms`;

    return {
      title: "Terms of Service | Noble Gain",
      meta: [
        { name: "description", content: "Read the Noble Gain terms of service. Understand our rules, user obligations, and platform policies before you start earning." },
        { property: "og:title", content: "Terms of Service | Noble Gain" },
        { property: "og:description", content: "The rules of the road for Noble Gain. Read our terms of service." },
        { property: "og:url", content: canonicalUrl },
        { property: "og:type", content: "website" },
        { property: "og:image", content: `${url}/api/public/og?title=Terms of Service&description=Rules and policies for Noble Gain.` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Terms of Service",
            "description": "Noble Gain Terms of Service",
            "publisher": {
              "@type": "Organization",
              "name": "Noble Gain"
            }
          })
        }
      ]
    };
  },
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20 md:py-24">
      <div className="premium-surface rounded-[2.5rem] bg-card p-6 sm:p-8 md:p-12">
        <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Terms of Service</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground font-medium">
          <p className="text-lg">Last updated: August 19, 2026</p>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-foreground">1. Agreement to Terms</h2>
            <p>By accessing or using Noble Gain, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-foreground">2. User Conduct</h2>
            <p>You agree not to use the platform for any unlawful purpose or in any way that interrupts, damages, or impairs the service. Prohibited activities include but are not limited to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Attempting to gain unauthorized access to our systems.</li>
              <li>Using automated scripts to collect data or interact with the service.</li>
              <li>Engaging in fraudulent activity to earn rewards.</li>
              <li>Impersonating other users or entities.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-foreground">3. Accounts and Security</h2>
            <p>When you create an account with us, you must provide accurate and complete information. You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-foreground">4. Intellectual Property</h2>
            <p>The service and its original content, features, and functionality are and will remain the exclusive property of Noble Gain and its licensors.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-foreground">5. Termination</h2>
            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
          </section>

          <div className="pt-8 border-t border-border/50 mt-12">
            <Button asChild className="rounded-xl font-bold uppercase tracking-widest">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal Button shim if not using the component directly
function Button({ children, asChild, className, ...props }: any) {
  const Comp = asChild ? "span" : "button";
  return (
    <Comp className={`inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 ${className}`} {...props}>
      {children}
    </Comp>
  );
}
