import { Link, useLocation } from "@tanstack/react-router"; <span>\u2063</span>
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
  Sun,
  Globe,
  Sparkles
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

// Mobile Menu Overlay Component
const MobileMenuOverlay = ({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) => (
  <div 
    className={cn(
      "md:hidden fixed inset-0 z-[70] flex transition-all duration-300 ease-out",
      isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    )}
  >
    <div 
      className={cn(
        "fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ease-in-out",
        isOpen ? "opacity-100" : "opacity-0"
      )} 
      onClick={onClose} 
    />
    <div 
      className={cn(
        "relative w-72 h-full bg-card shadow-2xl transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col",
        isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
      )}
    >
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute right-2 top-2"
        onClick={onClose}
        aria-label="Close menu"
      >
        <X className="h-5 w-5" />
      </Button>
      {children}
    </div>
  </div>
);

export function Navigation() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const isAuthPage = location.pathname === "/auth";
  const isLandingPage = location.pathname === "/";

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      return data;
    },
    enabled: !isAuthPage && !isLandingPage,
  });

  const { data: authInfo } = useQuery({
    queryKey: ["authInfo"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { isAdmin: false, isModerator: false, isTasker: false };
      
      const [{ data: isAdmin }, { data: isModerator }, { data: isTasker }] = await Promise.all([
        supabase.rpc("has_role", { _user_id: user.id, _role: 'admin' }),
        supabase.rpc("has_role", { _user_id: user.id, _role: 'moderator' }),
        supabase.rpc("has_role", { _user_id: user.id, _role: 'tasker' })
      ]);
      
      return { isAdmin, isModerator, isTasker };
    },
    enabled: !isAuthPage && !isLandingPage,
  });

  const isAdmin = authInfo?.isAdmin || false;
  const isModerator = authInfo?.isModerator || false;
  const isTasker = (authInfo?.isTasker as boolean) || false;

  // Auth page renders its own standalone layout with no global header
  if (isAuthPage) return null;

  // Custom transparent navbar for landing pages
  if (isLandingPage) {
    return (
      <>
        <nav className="fixed top-2 left-2 right-2 z-50 bg-card/80 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20 max-w-[calc(100vw-1rem)] md:after:hidden after:absolute after:inset-0 after:rounded-2xl after:shadow-[0_0_15px_rgba(124,58,237,0.5)] after:pointer-events-none after:z-[-1] animate-neon-pulse">
          <div className="container mx-auto px-4 flex h-20 items-center justify-between">
            <div className="flex items-center gap-2">
              {!isAuthPage && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden hover:bg-primary/5" 
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6 text-foreground" />
                </Button>
              )}
              <Link to="/" className="flex items-center gap-2 font-black text-2xl hover:opacity-80 transition-opacity uppercase tracking-tighter">
                <img src="/logo.png" alt="Noble Gain" className="h-8 w-8 object-contain" />
                <span className="hidden xs:inline text-foreground">Noble <span className="text-[#e6c17a]">Gain</span></span>
              </Link>
            </div>
            
              <div className="hidden md:flex items-center gap-8">
                <Link to="/about" className="text-sm font-black uppercase text-foreground/70 hover:text-foreground">About</Link>
                <Link to="/earn" search={{ tab: 'tasks' }} className="text-sm font-black uppercase text-foreground/70 hover:text-foreground">Product</Link>
                <Link to="/refer" className="text-sm font-black uppercase text-foreground/70 hover:text-foreground">Network</Link>
                <Link to="/redeem" className="text-sm font-black uppercase text-foreground/70 hover:text-foreground">Rewards</Link>
                
              </div>
            
            <div className="flex items-center gap-4">
              {!isAuthPage && (
                <>
                  <Button variant="ghost" className="font-black uppercase hidden sm:flex" asChild>
                    <Link to="/auth">Log in</Link>
                  </Button>
                  <Button className="font-black uppercase shadow-lg shadow-primary/20" asChild>
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </>
              )}
              <ThemeToggle />
            </div>
          </div>
        </nav>


        {/* Landing Page Mobile Overlay Menu */}
        <MobileMenuOverlay isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8 pr-10">
              <Link to="/" className="flex items-center gap-2 font-black text-xl uppercase tracking-tighter">
                <img src="/logo.png" alt="Noble Gain" className="h-8 w-8 object-contain" />
                <span className="text-foreground">Noble <span className="text-[#e6c17a]">Gain</span></span>
              </Link>
            </div>

            <nav className="flex flex-col gap-4">
              <Link 
                to="/about" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-black uppercase text-foreground/70 hover:text-primary transition-colors flex items-center gap-3"
              >
                <Sparkles className="h-5 w-5" />
                About
              </Link>
              <Link 
                to="/earn" 
                search={{ tab: 'tasks' }} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-black uppercase text-foreground/70 hover:text-primary transition-colors flex items-center gap-3"
              >
                <Coins className="h-5 w-5" />
                Product
              </Link>
              <Link 
                to="/refer" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-black uppercase text-foreground/70 hover:text-primary transition-colors flex items-center gap-3"
              >
                <Share2 className="h-5 w-5" />
                Network
              </Link>
              <Link 
                to="/redeem" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-black uppercase text-foreground/70 hover:text-primary transition-colors flex items-center gap-3"
              >
                <Gift className="h-5 w-5" />
                Rewards
              </Link>
            </nav>

            <div className="mt-auto space-y-4">
              <Button variant="outline" className="w-full font-black uppercase h-12 rounded-xl" asChild>
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>Log in</Link>
              </Button>
              <Button className="w-full font-black uppercase h-12 rounded-xl shadow-lg shadow-primary/20" asChild>
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
              </Button>
            </div>
          </div>
        </MobileMenuOverlay>
      </>
    );
  }



  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('noble-gain-remember-me');
      sessionStorage.removeItem('noble-gain-session-active');
      toast.success("Successfully signed out. See you soon!");
      // Force a full reload to landing page to clear all states
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
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
        { name: "Settings", href: "/settings" as any, icon: Settings },
        ...(isAdmin ? [{ name: "Admin Panel", href: "/admin", icon: Shield }] : []),
        ...(isModerator && !isAdmin ? [{ name: "Moderator Panel", href: "/moderator", icon: Shield }] : []),
        ...(isTasker && !isModerator && !isAdmin ? [{ name: "Tasker Panel", href: "/tasker", icon: Shield }] : []),
      ]
    }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6 px-4">
      <div className="flex items-center gap-3 px-2 mb-8">
        <img src="/logo.png" alt="Noble Gain" className="h-8 w-8 object-contain" />
        <span className="font-black text-xl tracking-tighter uppercase text-foreground">Noble <span className="text-[#e6c17a]">Gain</span></span>
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
            <AlertDialogTitle className="font-black text-xl">Sign out of Noble Gain?</AlertDialogTitle>
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
      <div className="ink-header-shadow md:hidden fixed top-2 left-2 right-2 z-50 flex items-center justify-between h-16 px-3 bg-card/85 backdrop-blur-xl border border-hairline rounded-2xl">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="flex items-center gap-1.5 font-black text-lg uppercase tracking-tighter ml-2">
            <img src="/logo.png" alt="Noble Gain" className="h-8 w-8 object-contain" />
            <span className="leading-tight text-foreground">Noble <span className="text-[#e6c17a]">Gain</span></span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
           <ThemeToggle />
           <NotificationsPopover />
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 border-2 border-primary/10 shadow-sm ring-2 ring-background" aria-label="User menu">
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
                <Link to="/profile" className="flex items-center w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  <User className="mr-3 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer px-3 py-2 font-bold text-sm">
                  <Link to="/admin" className="flex items-center w-full" onClick={() => setIsMobileMenuOpen(false)}>
                    <Shield className="mr-3 h-4 w-4" />
                    Admin Panel
                  </Link>
                </DropdownMenuItem>
              )}
              {isModerator && !isAdmin && (
                <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer px-3 py-2 font-bold text-sm">
                  <Link to="/moderator" className="flex items-center w-full" onClick={() => setIsMobileMenuOpen(false)}>
                    <Shield className="mr-3 h-4 w-4" />
                    Moderator Panel
                  </Link>
                </DropdownMenuItem>
              )}
              {isTasker && !isModerator && !isAdmin && (
                <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer px-3 py-2 font-bold text-sm">
                  <Link to="/tasker" className="flex items-center w-full" onClick={() => setIsMobileMenuOpen(false)}>
                    <Shield className="mr-3 h-4 w-4" />
                    Tasker Panel
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer px-3 py-2 font-bold text-sm">
                <Link to="/transactions" className="flex items-center w-full" onClick={() => setIsMobileMenuOpen(false)}>
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
      <MobileMenuOverlay isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
        <SidebarContent />
      </MobileMenuOverlay>

      {/* Desktop Sidebar (Persistent) */}
      <aside className="hidden md:flex fixed top-0 left-0 z-40 w-72 h-screen bg-card border-r border-hairline">
        <SidebarContent />
      </aside>

      {/* Desktop Top Bar */}
      <header className="hidden md:flex fixed top-0 right-0 z-30 h-20 items-center justify-between pl-80 pr-8 left-0 bg-card/80 backdrop-blur-xl border-b border-hairline">
        <div className="flex flex-col">
          <h1 className="text-lg font-black uppercase tracking-tight text-foreground">
            {location.pathname === "/dashboard" && "Dashboard Overview"}
            {location.pathname === "/earn" && "Earn Points"}
            {location.pathname === "/refer" && "Referral Program"}
            {location.pathname === "/redeem" && "Redeem Rewards"}
            {location.pathname === "/profile" && "Your Profile"}
            {location.pathname === "/transactions" && "Points History"}
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
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 border-2 border-primary/10 shadow-sm ring-2 ring-background transition-transform hover:scale-105 active:scale-95" aria-label="User profile menu">
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
                <Link to="/settings" className="flex items-center w-full">
                  <Settings className="mr-3 h-4 w-4" strokeWidth={2.5} />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer px-3 py-2.5 font-bold text-sm">
                <Link to="/transactions" className="flex items-center w-full">
                  <History className="mr-3 h-4 w-4" strokeWidth={2.5} />
                  Points History
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
