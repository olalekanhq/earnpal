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
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <nav className="ink-header-shadow relative flex items-center justify-around rounded-3xl border border-hairline bg-card/85 px-1.5 py-2.5 backdrop-blur-xl">
        <div className="absolute inset-0 -z-10 rounded-3xl bg-primary/5" />
        
        {tabs.map((tab) => {
          const isActive = currentPath === tab.href;
          return (
            <Link
              key={tab.name}
              to={tab.href as any}
              className={cn(
                "relative flex flex-col items-center gap-1 transition-all duration-300 px-2 py-1",
                isActive ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground"
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
                <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_8px_var(--color-gold)]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
