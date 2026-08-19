import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, History, ArrowRight, User } from "lucide-react";
import { format } from "date-fns";

export function AuditLogManager() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_audit_logs" as any)
        .select(`
          *,
          changed_by_profile:profiles!task_audit_logs_changed_by_fkey(username, full_name),
          submission:task_submissions(
            user:profiles(username, full_name),
            task:tasks(title)
          )
        `)
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Event</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">User</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-center">Status Change</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Timestamp</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-right">Modified By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground font-medium">
                  No audit logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs?.map((log: any) => (
                <TableRow key={log.id} className="border-border/40 hover:bg-accent/5 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <History className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-bold">{log.submission?.task?.title || "Unknown Task"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <User className="h-3 w-3 text-muted-foreground" />
                      {log.submission?.user?.username || log.submission?.user?.full_name || "Unknown User"}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {log.old_status ? (
                        <Badge variant="outline" className="text-[9px] font-bold uppercase py-0 px-1.5 opacity-50">
                          {log.old_status}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] font-bold uppercase py-0 px-1.5 opacity-50 bg-accent">
                          NEW
                        </Badge>
                      )}
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <Badge 
                        className={cn(
                          "text-[9px] font-black uppercase py-0 px-1.5",
                          log.new_status === 'pending' && "bg-orange-500/10 text-orange-600",
                          log.new_status === 'verified' && "bg-green-500/10 text-green-600",
                          log.new_status === 'rejected' && "bg-destructive/10 text-destructive"
                        )}
                      >
                        {log.new_status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-[10px] text-muted-foreground font-medium">
                    {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-tight">
                    {log.changed_by_profile?.username || "System"}
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}