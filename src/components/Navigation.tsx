import { Link, useLocation } from "@tanstack/react-router";
import { Coins, LayoutDashboard, Gift, Share2, LogOut, Menu, X, Shield, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { NotificationsPopover } from "./NotificationsPopover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-9 w-9 border"
                aria-label="Open menu"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{profile?.username || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">{profile?.full_name || ''}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {navItems.map((item) => (
                <DropdownMenuItem key={item.name} asChild>
                  <Link 
                    to={item.href}
                    className="flex items-center w-full gap-2 cursor-pointer"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>

  );
}