import { Link, useLocation } from "@tanstack/react-router";
import { Coins, LayoutDashboard, Gift, Share2, LogOut, Menu, X, Shield, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { NotificationsPopover } from "./NotificationsPopover";

export function Navigation() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isAuthPage = location.pathname === "/auth";
  const isLandingPage = location.pathname === "/";
  if (isAuthPage || isLandingPage) return null;

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      return data;
    },
  });

  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: 'admin' });
      return data;
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const navItems = [
    { name: "Earn", href: "/earn", icon: Coins },
    { name: "Referral", href: "/refer", icon: Share2 },
    ...(isAdmin ? [{ name: "Admin", href: "/admin", icon: Shield }] : []),
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity">
          <Coins className="h-6 w-6" />
          <span>Earn Pal</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.filter(item => item.name !== "Profile" && item.name !== "Settings").map((item) => (
            <Link 

              key={item.name} 
              to={item.href}
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === item.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
            <Coins className="h-4 w-4 text-primary" />
            <span className="font-bold text-sm text-primary">{profile?.points_balance || 0}</span>
          </div>
          <NotificationsPopover />
          <Button variant="ghost" size="icon" asChild title="Profile">
            <Link to="/profile">
              <User className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild title="Settings">
            <Link to="/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 mr-2">
            <Coins className="h-4 w-4 text-primary" />
            <span className="font-bold text-sm text-primary">{profile?.points_balance || 0}</span>
          </div>
          <NotificationsPopover />
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-9 w-9 border"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <User className="h-5 w-5" />}
            </Button>

            {/* Mobile Dropdown - Overlaying instead of pushing down */}
            {isOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-background/20 backdrop-blur-sm md:hidden" 
                  onClick={() => setIsOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 z-50 rounded-xl border bg-card p-2 shadow-xl animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="px-3 py-2 border-b mb-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menu</p>
                  </div>
                  <div className="grid gap-1">
                    {navItems.map((item) => (
                      <Link 
                        key={item.name} 
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium transition-all hover:bg-accent active:scale-95 ${
                          location.pathname === item.href ? "bg-primary/10 text-primary" : "text-foreground/80"
                        }`}
                      >
                        <div className={`p-1.5 rounded-md ${location.pathname === item.href ? "bg-primary/20" : "bg-muted"}`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-1 pt-1 border-t">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-3 p-2.5 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg text-sm transition-all" 
                      onClick={handleLogout}
                    >
                      <div className="p-1.5 rounded-md bg-destructive/10">
                        <LogOut className="h-4 w-4" />
                      </div>
                      Log out
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}