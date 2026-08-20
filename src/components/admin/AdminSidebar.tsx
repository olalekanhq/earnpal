import { useState } from "react";
import { Link, useLocation, useSearch } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  ListTodo, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Video,
  ShoppingBag,
  History,
  BarChart3,
  Share2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const search = useSearch({ from: "/_authenticated/admin" });

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      tab: undefined
    },
    {
      title: "Users",
      icon: Users,
      href: "/admin",
      tab: "users"
    },
    {
      title: "Tasks",
      icon: ListTodo,
      href: "/admin",
      tab: "tasks"
    },
    {
      title: "Rewards",
      icon: ShoppingBag,
      href: "/admin",
      tab: "rewards"
    },
    {
      title: "Redemptions",
      icon: History,
      href: "/admin",
      tab: "redemptions"
    },
    {
      title: "Referrals",
      icon: Share2,
      href: "/admin",
      tab: "referrals"
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/admin",
      tab: "analytics"
    },
    {
      title: "Audit Logs",
      icon: ShieldCheck,
      href: "/admin",
      tab: "audit"
    }
  ];

  return (
    <aside 
      className={cn(
        "relative flex flex-col border-r border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 ease-in-out z-20",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      <div className="flex h-20 items-center border-b border-border/40 px-6">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-primary p-2.5 rounded-2xl shrink-0 shadow-lg shadow-primary/20">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="font-black uppercase tracking-widest text-sm whitespace-nowrap">
              Admin Panel
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const currentTab = (search as any).tab;
          const isActive = currentTab === item.tab;

          return (
            <Link
              key={item.title}
              to={item.href}
              search={item.tab ? { tab: item.tab } : {}}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 shrink-0",
                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
              )} strokeWidth={2.5} />
              {!isCollapsed && (
                <span className="font-black text-[11px] uppercase tracking-widest">{item.title}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/40 bg-muted/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full justify-center rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/5 h-11"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!isCollapsed && <span className="ml-2 font-black text-[10px] uppercase tracking-widest">Collapse</span>}
        </Button>
      </div>
    </aside>
  );
}
