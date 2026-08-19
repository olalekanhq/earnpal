import { Link, useLocation } from "@tanstack/react-router";
import { Coins, LayoutDashboard, Gift, Share2, LogOut, Menu, X, Shield, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { NotificationsPopover } from "./NotificationsPopover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";


export function Navigation() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isAuthPage = location.pathname === "/auth";
  const isLandingPage = location.pathname === "/";
  
  if (isAuthPage) return null;

  // Custom transparent navbar for landing page
  if (isLandingPage) {
    return (
      <nav className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-black text-2xl text-primary hover:opacity-80 transition-opacity uppercase tracking-tighter">
            <Coins className="h-8 w-8" />
            <span>Earn Pal</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/earn" className="text-sm font-black uppercase text-foreground/70 hover:text-foreground">Product</Link>
            <Link to="/refer" className="text-sm font-black uppercase text-foreground/70 hover:text-foreground">Network</Link>
            <Link to="/redeem" className="text-sm font-black uppercase text-foreground/70 hover:text-foreground">Rewards</Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="font-black uppercase hidden sm:flex" asChild>
              <Link to="/auth">Log in</Link>
            </Button>
            <Button className="font-black uppercase shadow-lg shadow-primary/20" asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>
    );
  }

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
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-9 w-9 border"
                aria-label="Open menu"
              >
                <User className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px] p-0 border-l">
              <SheetHeader className="p-6 border-b text-left">
                <SheetTitle className="flex items-center gap-2 text-primary">
                  <Coins className="h-6 w-6" />
                  Earn Pal
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col h-[calc(100vh-80px)]">
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Navigation</p>
                    <div className="grid gap-1">
                      {navItems.map((item) => (
                        <SheetClose asChild key={item.name}>
                          <Link 
                            to={item.href}
                            className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all hover:bg-accent active:scale-95 ${
                              location.pathname === item.href ? "bg-primary/10 text-primary" : "text-foreground/80"
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${location.pathname === item.href ? "bg-primary/20" : "bg-muted"}`}>
                              <item.icon className="h-5 w-5" />
                            </div>
                            {item.name}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t mt-auto">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 p-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl text-sm font-medium transition-all" 
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                  >
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <LogOut className="h-5 w-5" />
                    </div>
                    Log out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>

  );
}