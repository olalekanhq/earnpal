import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, Coins, User, Activity, Search, Calendar as CalendarIcon, X } from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export function PointsAuditLogs() {
  const queryClient = useQueryClient();
  const [searchUserId, setSearchUserId] = useState("");
  const [searchReason, setSearchReason] = useState("");
  const [searchTrigger, setSearchTrigger] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-points-audit-logs", searchUserId, searchReason, searchTrigger, dateRange],
    queryFn: async () => {
      let query = supabase
        .from("points_audit_logs")
        .select(`
          *,
          profiles:user_id (
            username,
            full_name
          )
        `);

      if (searchUserId) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(searchUserId);
        if (isUuid) {
          query = query.eq("user_id", searchUserId);
        } else {
          query = query.or(`username.ilike.%${searchUserId}%,full_name.ilike.%${searchUserId}%`, { foreignTable: 'profiles' });
        }
      }

      if (searchReason) {
        query = query.ilike("reason", `%${searchReason}%`);
      }

      if (searchTrigger) {
        query = query.ilike("trigger_name", `%${searchTrigger}%`);
      }

      if (dateRange?.from) {
        query = query.gte("created_at", startOfDay(dateRange.from).toISOString());
      }
      if (dateRange?.to) {
        query = query.lte("created_at", endOfDay(dateRange.to).toISOString());
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel("points-audit-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "points_audit_logs",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-points-audit-logs"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight">Points Audit Logs</h3>
          <p className="text-sm text-muted-foreground font-medium">Detailed history of every point credit including welcome and referral rewards.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {(searchUserId || searchReason || searchTrigger || dateRange) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSearchUserId("");
                setSearchReason("");
                setSearchTrigger("");
                setDateRange(undefined);
              }}
              className="h-9 px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              <X className="mr-1 h-3 w-3" /> Clear Filters
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-card/30 p-4 rounded-2xl border border-border/40 backdrop-blur-sm">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">User / ID</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="Username or UUID..." 
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              className="pl-9 h-9 text-xs bg-background/50 border-border/40 focus:border-primary/50 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Reason</label>
          <div className="relative">
            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="e.g. Welcome Bonus..." 
              value={searchReason}
              onChange={(e) => setSearchReason(e.target.value)}
              className="pl-9 h-9 text-xs bg-background/50 border-border/40 focus:border-primary/50 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Trigger Source</label>
          <div className="relative">
            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="e.g. handle_new_user..." 
              value={searchTrigger}
              onChange={(e) => setSearchTrigger(e.target.value)}
              className="pl-9 h-9 text-xs bg-background/50 border-border/40 focus:border-primary/50 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Date Range</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-medium h-9 text-xs bg-background/50 border-border/40 hover:bg-background/80 rounded-xl",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">User</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Amount</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Reason</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Source</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-right">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground font-medium">
                  No point audit logs recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              logs?.map((log: any) => (
                <TableRow key={log.id} className="border-border/40 hover:bg-accent/5 transition-colors group">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/5 p-1.5 rounded-lg group-hover:bg-primary/10 transition-colors">
                        <User className="h-3 w-3 text-primary" />
                      </div>
                      <div>
                        <div className="font-bold text-sm tracking-tight">{log.profiles?.username || "Unknown"}</div>
                        <div className="text-[10px] text-muted-foreground font-medium">{log.profiles?.full_name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className="bg-green-500/10 p-1.5 rounded-lg">
                        <Coins className="h-3.3 w-3.3 text-green-600" />
                      </div>
                      <span className="font-black text-green-600 text-sm">+{log.amount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge variant="outline" className="font-black uppercase text-[9px] tracking-wider px-2 py-0.5 border-primary/20 bg-primary/5 text-primary">
                      {log.reason}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Activity className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded uppercase">{log.trigger_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      {format(new Date(log.created_at), "MMM d, yyyy")}
                    </div>
                    <div className="text-[9px] text-muted-foreground/60 font-bold">
                      {format(new Date(log.created_at), "HH:mm:ss")}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
