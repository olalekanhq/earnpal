import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Coins, Gift, Share2, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileTabBar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { name: "Home", href: "/dashboard", icon: LayoutDashboard },
    { name: "Earn", href: "/earn", icon: Coins },
    { name: "Redeem", href: "/redeem", icon: Gift },
    { name: "Refer", href: "/refer", icon: Share2 },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <nav aria-label="Mobile navigation" className="premium-surface relative mx-auto flex max-w-lg items-center justify-around rounded-3xl bg-card/90 px-1.5 py-2.5 backdrop-blur-xl">
        {/* Neon glow effect background */}
        <div className="absolute inset-0 rounded-3xl bg-primary/5 -z-10" />
        
        {tabs.map((tab) => {
          const isActive = currentPath === tab.href;
          return (
            <Link
              key={tab.name}
              to={tab.href as any}
              className={cn(
                "relative flex min-h-11 min-w-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1 transition-all duration-300",
                isActive ? "bg-primary/10 text-primary scale-105" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <tab.icon
                className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isActive ? "fill-primary/10 stroke-[2.5px]" : "stroke-[2px]"
                )}
              />
              <span className={cn(
                "text-[9px] font-black uppercase tracking-wider transition-all duration-300",
                isActive ? "opacity-100" : "opacity-0 h-0 w-0 scale-0"
              )}>
                {tab.name}
              </span>
              
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(124,58,237,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
