import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock, ExternalLink, User, ListTodo, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TaskApprovals() {
  const queryClient = useQueryClient();
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("pending");

  const { data: pendingTasks, isLoading } = useQuery({
    queryKey: ["admin-task-submissions", statusFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_submissions")
        .select(`
          id,
          task_id,
          user_id,
          status,
          created_at,
          tasks (id, title, points, category),
          profiles (id, full_name, username)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        const filtered = await supabase
          .from("task_submissions")
          .select(`
            id,
            task_id,
            user_id,
            status,
            created_at,
            tasks (id, title, points, category),
            profiles (id, full_name, username)
          `)
          .eq("status", statusFilter)
          .order("created_at", { ascending: false });
        if (filtered.error) throw filtered.error;
        return filtered.data as any[];
      }
      
      if (error) {
        console.error("Error fetching tasks:", error);
        throw error;
      }
      return data as any[];
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, approve }: { id: string, approve: boolean }) => {
      setProcessingId(id);
      const note = adminNotes[id] || "";
      const { data, error } = await (supabase.rpc as any)("verify_task_submission", {
        _submission_id: id,
        _approve: approve,
        _admin_note: note
      });
      
      if (error) throw error;
      if (data && !data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-task-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      toast.success(data.message || "Task verification processed");
      setAdminNotes(prev => {
        const next = { ...prev };
        delete next[variables.id];
        return next;
      });
      setProcessingId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Error processing verification");
      setProcessingId(null);
    }
  });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Task Submissions
          </h3>
          <p className="text-sm text-muted-foreground font-medium">Review task completions and approval history.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-52">
          <Label htmlFor="submission-status" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Status filter
          </Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="submission-status" className="h-11 w-full rounded-xl">
              <SelectValue placeholder="Filter submissions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="all">All history</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/50 bg-card">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">User</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Task</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Status</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-center">Date</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingTasks?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground font-medium">
                  No {statusFilter === "all" ? "task submissions" : `${statusFilter} submissions`} found.
                </TableCell>
              </TableRow>
            ) : (
              pendingTasks?.map((sub) => (
                <TableRow key={sub.id} className="border-border/40 hover:bg-accent/5 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-bold text-sm">{sub.profiles?.full_name || 'Unknown User'}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-black">@{sub.profiles?.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ListTodo className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-bold text-sm">{sub.tasks?.title}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[9px] font-black border-primary/20 text-primary px-1 h-4">
                            +{sub.tasks?.points} PTS
                          </Badge>
                          <Badge variant="secondary" className="text-[9px] font-black px-1 h-4 uppercase">
                            {sub.tasks?.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge variant={sub.status === "verified" ? "default" : sub.status === "rejected" ? "destructive" : "secondary"} className="uppercase text-[9px] font-black">
                      {sub.status === "verified" ? "Completed" : sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <div className="text-xs font-medium text-muted-foreground">
                      {format(new Date(sub.created_at), "MMM d, HH:mm")}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex flex-col gap-2 items-end">
                      {sub.status === "pending" && <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/5 font-bold text-xs"
                          onClick={() => verifyMutation.mutate({ id: sub.id, approve: false })}
                          disabled={processingId === sub.id}
                        >
                          {processingId === sub.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                          Reject
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-8 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-xs"
                          onClick={() => verifyMutation.mutate({ id: sub.id, approve: true })}
                          disabled={processingId === sub.id}
                        >
                          {processingId === sub.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
                          Approve
                        </Button>
                      </div>}
                      {sub.status === "pending" && <Input 
                        placeholder="Add rejection reason..."
                        className="h-7 text-[10px] w-32 rounded-md"
                        value={adminNotes[sub.id] || ""}
                        onChange={(e) => setAdminNotes(prev => ({ ...prev, [sub.id]: e.target.value }))}
                      />}
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
