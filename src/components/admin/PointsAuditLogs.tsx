import { useQuery } from "@tanstack/react-query";
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
import { Loader2, Coins, User, Activity } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function PointsAuditLogs() {
  const queryClient = useQueryClient();
  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-points-audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("points_audit_logs")
        .select(`
          *,
          profiles:user_id (
            username,
            full_name
          )
        `)
        .order("created_at", { ascending: false });
      
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
      <div>
        <h3 className="text-xl font-black uppercase tracking-tight">Points Audit Logs</h3>
        <p className="text-sm text-muted-foreground font-medium">Detailed history of every point credit including welcome and referral rewards.</p>
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
