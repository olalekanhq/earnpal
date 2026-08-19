import { Link, useLocation } from "@tanstack/react-router";
import { 
  Coins, 
  LayoutDashboard, 
  Gift, 
  Share2, 
  LogOut, 
  Menu, 
  X, 
  Shield, 
  Settings, 
  User,
  Bell,
  History,
  ChevronRight,
  Moon,
  Sun
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { NotificationsPopover } from "./NotificationsPopover";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function Navigation() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const isAuthPage = location.pathname === "/auth";
  const isLandingPage = location.pathname === "/";
  
  if (isAuthPage) return null;

  // Custom transparent navbar for landing page
  if (isLandingPage) {
    return (
      <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-black text-2xl text-primary hover:opacity-80 transition-opacity uppercase tracking-tighter">
            <Coins className="h-7 w-7" />
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
    try {
      await supabase.auth.signOut();
      toast.success("Successfully signed out. See you soon!");
      window.location.href = "/";
    } catch (error) {
      toast.error("Error signing out. Please try again.");
    }
  };

  const menuGroups = [
    {
      label: "Main Menu",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Earn Points", href: "/earn", icon: Coins },
        { name: "Redeem", href: "/redeem", icon: Gift },
        { name: "Referral", href: "/refer", icon: Share2 },
      ]
    },
    {
      label: "Account",
      items: [
        { name: "Profile", href: "/profile", icon: User },
        { name: "Settings", href: "/settings", icon: Settings },
        ...(isAdmin ? [{ name: "Admin Panel", href: "/admin", icon: Shield }] : []),
      ]
    }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6 px-4">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="bg-primary p-2 rounded-xl shadow-md shadow-primary/20">
          <Coins className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="font-black text-xl tracking-tighter uppercase">Earn Pal</span>
      </div>

      <div className="flex-1 space-y-8">
        {menuGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            <h3 className="px-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all group",
                    location.pathname === item.href
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors",
                    location.pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} strokeWidth={1.8} />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6 border-t border-border/50">
        <div className="flex items-center gap-3 px-2 mb-6">
          <Avatar className="h-10 w-10 border border-border shadow-sm">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-primary/5 text-primary">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          {profile && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{profile.username ? (profile.username.charAt(0).toUpperCase() + profile.username.slice(1)) : "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{profile.full_name || ""}</p>
            </div>
          )}
        </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl px-3 h-11"
            onClick={() => setShowLogoutDialog(true)}
          >
          <LogOut className="mr-3 h-5 w-5" strokeWidth={1.8} />
          <span className="font-bold">Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="rounded-2xl border-border/40 max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black text-xl">Sign out of Earn Pal?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium">
              You'll need to sign back in to access your rewards and track your progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl font-bold border-border/40">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className="rounded-xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-20 px-4 bg-white/95 backdrop-blur-md border-b border-border/40 shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="hover:bg-primary/5">
            <Menu className="h-6 w-6 text-foreground" />
          </Button>
          <Link to="/dashboard" className="flex items-center gap-1.5 font-black text-lg uppercase tracking-tighter text-primary">
            <Coins className="h-5 w-5" strokeWidth={2.5} />
            <span className="leading-tight">Earn Pal</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
           <ThemeToggle />
           <NotificationsPopover />
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 border-2 border-primary/10 shadow-sm ring-2 ring-background">
                <Avatar className="h-full w-full">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/5 text-primary">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mt-2 rounded-2xl p-2 shadow-xl border-border/40" align="end">
              <DropdownMenuLabel className="font-black px-3 py-2">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-black">{profile?.username ? (profile.username.charAt(0).toUpperCase() + profile.username.slice(1)) : "User"}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{profile?.points_balance?.toLocaleString()} Points</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/40 my-1" />
              <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer px-3 py-2 font-bold text-sm">
                <Link to="/profile" className="flex items-center w-full">
                  <User className="mr-3 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer px-3 py-2 font-bold text-sm">
                <Link to="/earn" className="flex items-center w-full">
                  <History className="mr-3 h-4 w-4" />
                  Points History
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer px-3 py-2 font-bold text-sm text-destructive focus:text-destructive focus:bg-destructive/5">
                <button onClick={() => setShowLogoutDialog(true)} className="flex items-center w-full">
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign out
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Overlay Sidebar (Off-canvas Drawer) */}
      <div 
        className={cn(
          "md:hidden fixed inset-0 z-50 flex transition-opacity duration-300",
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div 
          className={cn(
            "fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          )} 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
        <div 
          className={cn(
            "relative w-72 h-full bg-white shadow-2xl transition-transform duration-300 ease-in-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
          <SidebarContent />
        </div>
      </div>

      {/* Desktop Sidebar (Persistent) */}
      <aside className="hidden md:flex fixed top-0 left-0 z-40 w-72 h-screen bg-white border-r border-border/50">
        <SidebarContent />
      </aside>

      {/* Desktop Top Bar */}
      <header className="hidden md:flex fixed top-0 right-0 z-30 h-20 items-center justify-between pl-80 pr-8 left-0 bg-white/80 backdrop-blur-md border-b border-border/40">
        <div className="flex flex-col">
          <h1 className="text-lg font-black uppercase tracking-tight text-foreground">
            {location.pathname === "/dashboard" && "Dashboard Overview"}
            {location.pathname === "/earn" && "Earn Points"}
            {location.pathname === "/refer" && "Referral Program"}
            {location.pathname === "/redeem" && "Redeem Rewards"}
            {location.pathname === "/profile" && "Your Profile"}
            {location.pathname === "/settings" && "Account Settings"}
            {location.pathname === "/admin" && "Admin Control Panel"}
          </h1>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest -mt-1">
            Welcome back, {profile?.username ? (profile.username.charAt(0).toUpperCase() + profile.username.slice(1)) : "User"}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-primary/5 border border-primary/10 shadow-sm px-4 py-2 rounded-2xl">
            <Coins className="h-4 w-4 text-primary" strokeWidth={2.5} />
            <span className="text-sm font-black text-foreground">
              {profile?.points_balance?.toLocaleString() || 0}
              <span className="text-[10px] text-muted-foreground ml-1.5 font-black uppercase tracking-wider">Points</span>
            </span>
          </div>
          <div className="h-8 w-[1px] bg-border/60 mx-1" />
          <ThemeToggle />
          <NotificationsPopover />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 border-2 border-primary/10 shadow-sm ring-2 ring-background transition-transform hover:scale-105 active:scale-95">
                <Avatar className="h-full w-full">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/5 text-primary">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 mt-2 rounded-2xl p-2 shadow-xl border-border/40" align="end">
              <DropdownMenuLabel className="font-black px-4 py-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-black">{profile?.username ? (profile.username.charAt(0).toUpperCase() + profile.username.slice(1)) : "User"}</p>
                  <div className="flex items-center gap-1.5 bg-primary/5 w-fit px-2 py-0.5 rounded-lg">
                    <Coins className="h-3 w-3 text-primary" />
                    <p className="text-[10px] text-primary uppercase tracking-wider font-black">{profile?.points_balance?.toLocaleString()} Points</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/40 my-1 mx-2" />
              <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer px-3 py-2.5 font-bold text-sm">
                <Link to="/profile" className="flex items-center w-full">
                  <User className="mr-3 h-4 w-4" strokeWidth={2.5} />
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer px-3 py-2.5 font-bold text-sm">
                <Link to="/earn" className="flex items-center w-full">
                  <History className="mr-3 h-4 w-4" strokeWidth={2.5} />
                  Points History
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer px-3 py-2.5 font-bold text-sm">
                <Link to="/settings" className="flex items-center w-full">
                  <Settings className="mr-3 h-4 w-4" strokeWidth={2.5} />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/40 my-1 mx-2" />
              <DropdownMenuItem asChild className="rounded-xl focus:bg-destructive/5 focus:text-destructive cursor-pointer px-3 py-2.5 font-bold text-sm text-destructive">
                <button onClick={() => setShowLogoutDialog(true)} className="flex items-center w-full">
                  <LogOut className="mr-3 h-4 w-4" strokeWidth={2.5} />
                  Sign out
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}