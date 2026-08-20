import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  ListTodo, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Video
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      title: "Overview",
      icon: LayoutDashboard,
      href: "/admin",
      exact: true
    },
    {
      title: "Tasks",
      icon: ListTodo,
      href: "/admin",
      tab: "tasks"
    },
    {
      title: "Users",
      icon: Users,
      href: "/admin",
      tab: "users"
    },
    {
      title: "Video Ads",
      icon: Video,
      href: "/admin",
      tab: "tasks", // They are managed in tasks tab currently
      filter: "Videos"
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/admin",
      tab: "audit" // Or wherever settings might be
    }
  ];

  return (
    <aside 
      className={cn(
        "relative flex flex-col border-r border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      <div className="flex h-16 items-center border-b border-border/40 px-6">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-primary p-2 rounded-xl shrink-0">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="font-black uppercase tracking-widest text-sm whitespace-nowrap">
              Admin Panel
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const isActive = item.exact 
            ? location.pathname === item.href && !location.search.includes('tab=')
            : location.pathname === item.href; // Simplified for now since we use tabs

          return (
            <Link
              key={item.title}
              to={item.href}
              search={item.tab ? { tab: item.tab } : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 shrink-0",
                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
              )} />
              {!isCollapsed && (
                <span className="font-bold text-sm tracking-tight">{item.title}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!isCollapsed && <span className="ml-2 font-bold text-xs uppercase tracking-widest">Collapse</span>}
        </Button>
      </div>
    </aside>
  );
}
