import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { 
  Loader2, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function UserSubmissionsManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["admin-all-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_submissions")
        .select(`
          *,
          profiles(username, full_name, email),
          tasks(title, points, link_url)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'verified' | 'rejected' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("task_submissions")
        .update({ 
          status,
          verified_by: user?.id 
        } as any)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-submissions"] });
      toast.success(`Task ${variables.status === 'verified' ? 'verified' : 'rejected'}`);
    },
    onError: (error: any) => {
      toast.error("Failed to update status: " + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("task_submissions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-submissions"] });
      toast.success("Submission removed");
    },
    onError: (error: any) => {
      toast.error("Failed to delete: " + error.message);
    }
  });

  const filteredSubmissions = submissions?.filter((s: any) => 
    s.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.tasks?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by user or task..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-11 w-full md:w-64 rounded-xl border-border/50 bg-background"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">User</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Task</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-center">Status</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Submitted</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubmissions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground font-medium">
                  No submissions found.
                </TableCell>
              </TableRow>
            ) : (
              filteredSubmissions?.map((s: any) => (
                <TableRow key={s.id} className="border-border/40 hover:bg-accent/5 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="font-bold">{s.profiles?.username || s.profiles?.full_name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{s.profiles?.email}</div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="font-bold text-sm">{s.tasks?.title}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] font-black py-0 px-1.5 border-primary/20 text-primary bg-primary/5">
                          +{s.tasks?.points} PTS
                        </Badge>
                        {s.tasks?.link_url && (
                          <a href={s.tasks.link_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5 text-[10px] font-bold">
                            Link <ExternalLink className="h-2 w-2" />
                          </a>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Badge 
                      className={cn(
                        "text-[10px] font-black uppercase tracking-wider px-2 py-0.5",
                        s.status === 'pending' && "bg-orange-500/10 text-orange-600",
                        s.status === 'verified' && "bg-green-500/10 text-green-600",
                        s.status === 'rejected' && "bg-destructive/10 text-destructive"
                      )}
                    >
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase">
                    {format(new Date(s.created_at), "MMM d, HH:mm")}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {s.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => verifyMutation.mutate({ id: s.id, status: 'verified' })}
                            disabled={verifyMutation.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/5"
                            onClick={() => verifyMutation.mutate({ id: s.id, status: 'rejected' })}
                            disabled={verifyMutation.isPending}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm("Remove this submission? This will not deduct points if already verified.")) {
                            deleteMutation.mutate(s.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
