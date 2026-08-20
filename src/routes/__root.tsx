import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Navigation } from "@/components/Navigation";
import { Coins } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Onboarding } from "@/components/Onboarding";
import { ThemeProvider } from "@/hooks/use-theme";
import { supabase } from "@/integrations/supabase/client";
import { ensureBucketsExist } from "@/utils/storage-init";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="bg-primary/10 p-6 rounded-3xl mb-8 shadow-xl shadow-primary/5 ring-1 ring-primary/20">
          <Coins className="h-16 w-16 text-primary animate-pulse" strokeWidth={2.5} />
        </div>
        
        <h1 className="text-8xl font-black text-primary tracking-tighter mb-2">404</h1>
        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground mb-4">
          Lost in the vault?
        </h2>
        <p className="text-muted-foreground font-medium mb-10 leading-relaxed">
          The page you're looking for doesn't exist or has been moved to another section of the platform.
        </p>

        <Link
          to="/"
          className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-sm font-black uppercase tracking-widest text-primary-foreground transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
        >
          Back to Dashboard
          <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
        
        <div className="mt-12 flex items-center gap-2 font-black text-xs text-muted-foreground/40 uppercase tracking-[0.2em]">
          <span>Earn Pal</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/20" />
          <span>Security Protocol</span>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center animate-pulse">
        <div className="bg-primary/10 p-4 rounded-3xl mb-4 shadow-xl shadow-primary/10">
          <Coins className="h-12 w-12 text-primary" strokeWidth={2.5} />
        </div>
        <div className="flex items-center gap-2 font-black text-2xl text-primary tracking-tighter uppercase">
          <span>Earn Pal</span>
        </div>
        <p className="mt-4 text-sm font-bold text-muted-foreground uppercase tracking-widest">
          Loading your experience...
        </p>
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="text-xs font-black uppercase tracking-widest text-primary hover:underline"
          >
            Try Again
          </button>
          <span className="text-muted-foreground/30">|</span>
          <a
            href="/"
            className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => {
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://earnpal.lovable.app';
    const canonicalUrl = typeof window !== 'undefined' ? `${url}${window.location.pathname}` : url;

    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=5" },
        { title: "Earn Pal — Reward Your Time" },
        { name: "description", content: "The ultimate rewards platform. Earn points for simple tasks, refer friends, and redeem for amazing prizes." },
        { name: "author", content: "Earn Pal" },
        { property: "og:title", content: "Earn Pal — Reward Your Time" },
        { property: "og:description", content: "The ultimate rewards platform. Earn points for simple tasks, refer friends, and redeem for amazing prizes." },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:image", content: `${url}/api/public/og?title=Earn Pal&description=Reward Your Time` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@Lovable" },
        { name: "6a97888e-site-verification", content: "2a365eac71037194b13cbbf9bee6c208" },
      ],
      links: [
        { rel: "canonical", href: canonicalUrl },
        {
          rel: "stylesheet",
          href: appCss,
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap",
        },
        { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Earn Pal",
            "url": url,
            "logo": `${url}/logo.png`,
            "description": "The ultimate rewards platform. Earn points for simple tasks, refer friends, and redeem for amazing prizes."
          })
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Earn Pal",
            "url": url,
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${url}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          })
        }
      ]
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const location = useLocation();
  const router = useRouter();
  const isLandingPage = location.pathname === "/";
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Sessions persist across refresh and browser restarts until the user
    // signs out manually. No transient-session cleanup here.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT' && event !== 'USER_UPDATED') return;

      router.invalidate();

      if (event === 'SIGNED_OUT') {
        const currentPath = window.location.pathname;
        const publicPages = ['/', '/auth', '/landing', '/privacy', '/terms'];
        if (!publicPages.includes(currentPath)) {
          router.navigate({ to: '/auth' });
        }
      }
    });

    // Clean up flags from the previous transient-session implementation.
    localStorage.removeItem('earn-pal-session-transient');
    sessionStorage.removeItem('earn-pal-session-active');

    return () => subscription.unsubscribe();
  }, [router]);


  useEffect(() => {
    ensureBucketsExist().catch(err => console.error("Bucket init failed:", err));
  }, []);

  useEffect(() => {

    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    
    if (refCode) {
      const trackClick = async () => {
        const { error } = await supabase.rpc('increment_referral_clicks', {
          target_referral_code: refCode
        });
        if (error) console.error("Error tracking referral click:", error);
      };
      trackClick();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="earn-pal-theme">
        <div className="flex min-h-screen bg-background text-foreground relative overflow-x-hidden w-full">
          <Navigation />
          <main className={cn(
            "flex-1 transition-all duration-300 min-h-screen w-full flex flex-col",
            !isLandingPage && "md:ml-72"
          )}>
            <div className={cn("flex-1 w-full", !isLandingPage && "pt-20")}>
              <Outlet />
            </div>
          </main>
        </div>
        <Toaster />
        <Onboarding />
      </ThemeProvider>
    </QueryClientProvider>
  );
}