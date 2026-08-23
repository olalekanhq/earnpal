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
    <div className="md:hidden fixed bottom-6 left-4 right-4 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <nav className="relative flex items-center justify-around bg-card/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-3xl px-2 py-3">
        {/* Neon glow effect background */}
        <div className="absolute inset-0 rounded-3xl bg-primary/5 -z-10" />
        
        {tabs.map((tab) => {
          const isActive = currentPath === tab.href;
          return (
            <Link
              key={tab.name}
              to={tab.href as any}
              className={cn(
                "relative flex flex-col items-center gap-1 transition-all duration-300 px-3 py-1.5",
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon
                className={cn(
                  "h-6 w-6 transition-all duration-300",
                  isActive ? "fill-primary/10 stroke-[2.5px]" : "stroke-[2px]"
                )}
              />
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-all duration-300",
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
