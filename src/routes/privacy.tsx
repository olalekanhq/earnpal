import { createFileRoute, Link } from "@tanstack/react-router";
import { useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => {
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://noblegain.lovable.app';
    const canonicalUrl = `${url}/privacy`;

    return {
      title: "Privacy Policy | Noble Gain",
      meta: [
        { name: "description", content: "Learn how Noble Gain collects, uses, and protects your personal data. Our privacy policy outlines our commitment to your security." },
        { property: "og:title", content: "Privacy Policy | Noble Gain" },
        { property: "og:description", content: "Your privacy is our priority. Read the Noble Gain privacy policy." },
        { property: "og:url", content: canonicalUrl },
        { property: "og:type", content: "website" },
        { property: "og:image", content: `${url}/api/public/og?title=Privacy Policy&description=Your privacy matters to us.` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Privacy Policy",
            "description": "Noble Gain Privacy Policy",
            "publisher": {
              "@type": "Organization",
              "name": "Noble Gain"
            }
          })
        }
      ]
    };
  },
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <div className="container mx-auto px-4 pt-32 pb-24 max-w-4xl">
      <div className="bg-card p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-border/50">
        <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Privacy Policy</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground font-medium">
          <p className="text-lg">Last updated: August 19, 2026</p>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-foreground">1. Introduction</h2>
            <p>Welcome to Noble Gain. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-foreground">2. Data We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
              <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
              <li><strong>Usage Data:</strong> includes information about how you use our website and services.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-foreground">3. How We Use Your Data</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-foreground">4. Data Security</h2>
            <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.</p>
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
