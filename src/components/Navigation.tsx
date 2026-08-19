import { Link, useLocation } from "@tanstack/react-router";
import { 
  Coins, LayoutDashboard, Gift, Share2, LogOut, Menu, X, Shield, 
  Settings, User, Home, ShoppingBag, Wallet, Moon, Sun, ChevronDown,
  HelpCircle, CreditCard, BookOpen, Store, Image as ImageIcon, 
  FileText, Smartphone, Database, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navigation() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [currency, setCurrency] = useState("USD");

  if (isAuthPage) return null;


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
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Earn", href: "/earn", icon: Coins },
    { name: "Referral", href: "/refer", icon: Share2 },
    { name: "Rewards", href: "/redeem", icon: Gift },
    ...(isAdmin ? [{ name: "Admin", href: "/admin", icon: Shield }] : []),
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const sidebarGroups = [
    {
      label: "MAIN MENU",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Deposit", href: "#", icon: CreditCard },
        { name: "Withdraw", href: "#", icon: Wallet },
        { name: "Social Activity", href: "/refer", icon: Share2 },
        { name: "Adverts", href: "/earn", icon: ImageIcon },
        { name: "Credit Score Checker", href: "#", icon: Shield },
        { name: "Bills & Utilities", href: "#", icon: Zap },
        { name: "Upgrade Plan", icon: Zap },
        { name: "Wallets", href: "#", icon: ShoppingBag },
      ]
    },
    {
      label: "ACCOUNT",
      items: [
        { name: "Settings", href: "/settings", icon: Settings },
        { name: "Support", href: "#", icon: HelpCircle },
      ]
    }
  ];

  // Custom transparent navbar for landing page
  if (location.pathname === "/") {
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


  return (
    <>
      {/* Desktop Header */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </div>
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-muted p-1 rounded-lg mr-2">
              <Button 
                variant={currency === "USD" ? "secondary" : "ghost"} 
                size="sm" 
                className="h-7 text-[10px] font-bold px-3"
                onClick={() => setCurrency("USD")}
              >
                USD
              </Button>
              <Button 
                variant={currency === "NGN" ? "secondary" : "ghost"} 
                size="sm" 
                className="h-7 text-[10px] font-bold px-3"
                onClick={() => setCurrency("NGN")}
              >
                NGN
              </Button>
            </div>
            
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Moon className="h-5 w-5" />
            </Button>

            <NotificationsPopover />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full ml-1">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage src={profile?.avatar_url || ""} alt={profile?.username || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {profile?.username?.[0]?.toUpperCase() || profile?.full_name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">{profile?.full_name || profile?.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">@{profile?.username || "user"}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/refer" className="cursor-pointer">
                    <Share2 className="mr-2 h-4 w-4" />
                    <span>Referrals</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t px-6 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex flex-col items-center gap-1">
          <div className={`p-1 rounded-lg ${location.pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"}`}>
            <Home className="h-6 w-6" />
          </div>
          <span className={`text-[10px] font-bold ${location.pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"}`}>Home</span>
        </Link>
        <Link to="/earn" className="flex flex-col items-center gap-1">
          <div className={`p-1 rounded-lg ${location.pathname === "/earn" ? "text-primary" : "text-muted-foreground"}`}>
            <ShoppingBag className="h-6 w-6" />
          </div>
          <span className={`text-[10px] font-bold ${location.pathname === "/earn" ? "text-primary" : "text-muted-foreground"}`}>Market</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center gap-1">
          <div className={`p-1 rounded-lg ${location.pathname === "/profile" ? "text-primary" : "text-muted-foreground"}`}>
            <Wallet className="h-6 w-6" />
          </div>
          <span className={`text-[10px] font-bold ${location.pathname === "/profile" ? "text-primary" : "text-muted-foreground"}`}>Wallet</span>
        </Link>
        <button className="flex flex-col items-center gap-1" onClick={() => setIsOpen(true)}>
          <div className="p-1 rounded-lg text-muted-foreground">
            <Menu className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground">Menu</span>
        </button>
      </nav>

      {/* Mobile Sidebar Overlay (Sheet) */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-[300px] p-0 flex flex-col border-r">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Coins className="h-6 w-6 text-primary" />
              </div>
              <span className="font-black text-xl text-primary tracking-tight">Earn Pal</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
            {sidebarGroups.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] font-black text-muted-foreground/60 tracking-[0.2em] mb-4 px-2">{group.label}</p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    item.href ? (
                      <SheetClose asChild key={item.name}>
                        <Link 
                          to={item.href}
                          className={`flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all ${
                            location.pathname === item.href 
                            ? "bg-primary/5 text-primary" 
                            : "text-foreground/70 hover:bg-accent"
                          }`}
                        >
                          <item.icon className={`h-5 w-5 ${location.pathname === item.href ? "text-primary" : "text-muted-foreground"}`} />
                          {item.name}
                        </Link>
                      </SheetClose>
                    ) : (
                      <button 
                        key={item.name}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-foreground/70 hover:bg-accent transition-all"
                      >
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                        {item.name}
                      </button>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t mt-auto bg-muted/20">
            <div className="flex items-center gap-3 mb-6 px-2">
              <Avatar className="h-10 w-10 border-2 border-primary/10">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground font-black">
                  {profile?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black truncate">{profile?.full_name || profile?.username || "Ridwan line"}</p>
                <p className="text-xs text-muted-foreground truncate font-medium">{profile?.email || "lifelineng@outlook.com"}</p>
              </div>
            </div>

            <div className="flex items-center bg-muted p-1 rounded-lg mb-6">
              <Button 
                variant={currency === "USD" ? "secondary" : "ghost"} 
                size="sm" 
                className="flex-1 h-8 text-[10px] font-black"
                onClick={() => setCurrency("USD")}
              >
                USD
              </Button>
              <Button 
                variant={currency === "NGN" ? "secondary" : "ghost"} 
                size="sm" 
                className="flex-1 h-8 text-[10px] font-black"
                onClick={() => setCurrency("NGN")}
              >
                NGN
              </Button>
            </div>

            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 px-2 h-10 text-muted-foreground hover:text-foreground font-bold transition-all" 
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
