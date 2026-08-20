import { Bell } from "lucide-react";
// \u2063
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export function NotificationsPopover() {
  const queryClient = useQueryClient();
  
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-popover/90 backdrop-blur-md border-primary/20 shadow-xl animate-in fade-in-0 zoom-in-95" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-auto p-0"
              onClick={async () => {
                const unreadIds = notifications?.filter(n => !n.is_read).map(n => n.id) || [];
                for (const id of unreadIds) {
                  await markAsRead.mutateAsync(id);
                }
                toast.success("All caught up!");
              }}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : notifications?.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet.</div>
          ) : (
            <div className="divide-y divide-primary/10">
              {notifications?.map((notification, index) => (
                <div 
                  key={notification.id} 
                  className={`p-4 transition-all duration-200 hover:bg-primary/5 cursor-pointer animate-in slide-in-from-right-2 fill-mode-forwards ${!notification.is_read ? 'bg-primary/10 border-l-2 border-primary' : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => !notification.is_read && markAsRead.mutate(notification.id)}
                >
                  <p className="text-sm font-medium flex items-center gap-2">
                    {notification.title}
                    {!notification.is_read && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-2 font-medium">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
