import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Check, X, Loader2, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function RedemptionsManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: redemptions, isLoading } = useQuery({
    queryKey: ["admin-redemptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("redemptions")
        .select(`
          *,
          profiles:user_id(full_name, email, username),
          rewards:reward_id(title, cost_points)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, userId, rewardTitle }: { id: string; status: string; userId: string; rewardTitle: string }) => {
      const { data, error } = await supabase.rpc('process_redemption_status_change', {
        _redemption_id: id,
        _new_status: status
      });
      
      if (error) throw error;
      
      const result = data as any;
      if (!result.success) {
        throw new Error(result.message);
      }

      // Create notification for user
      await supabase.from("notifications").insert({
        user_id: userId,
        title: status === 'approved' ? "Redemption Approved!" : "Redemption Rejected",
        message: status === 'approved' 
          ? `Your request for "${rewardTitle}" has been approved.${result.re_deducted ? ' The points were re-deducted from your balance.' : ''}` 
          : `Your request for "${rewardTitle}" was rejected.${result.refunded ? ' The points have been returned to your balance.' : ''}`,
        type: "redemption"
      });

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      
      let message = "Redemption status updated";
      if (result.refunded) message += " and points refunded";
      if (result.re_deducted) message += " and points re-deducted";
      
      toast.success(message);
    },
    onError: (error) => {
      toast.error("Failed to update status: " + error.message);
    }
  });

  const filteredRedemptions = redemptions?.filter((r: any) => {
    const matchesSearch = 
      r.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rewards?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search users or rewards..." 
            className="pl-10 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px] rounded-xl">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">User</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Reward</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Cost</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-center">Date</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-center">Status</TableHead>
              
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRedemptions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground font-medium">
                  No redemptions found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredRedemptions?.map((r: any) => (
                <TableRow key={r.id} className="border-border/40 hover:bg-accent/5 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="font-bold">{r.profiles?.full_name || r.profiles?.username}</div>
                    <div className="text-xs text-muted-foreground">{r.profiles?.email}</div>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-medium">{r.rewards?.title}</TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge variant="outline" className="font-bold text-primary border-primary/20 bg-primary/5">
                      {r.rewards?.cost_points} pts
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-xs text-muted-foreground font-medium text-center">
                    {format(new Date(r.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="focus:outline-none">
                          <Badge 
                            className={cn(
                              "font-black uppercase text-[10px] tracking-wider px-2 py-0.5 cursor-pointer",
                              r.status === 'pending' && "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20",
                              r.status === 'approved' && "bg-green-500/10 text-green-600 hover:bg-green-500/20",
                              r.status === 'rejected' && "bg-destructive/10 text-destructive hover:bg-destructive/20"
                            )}
                          >
                            {r.status}
                          </Badge>
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl border-border/50">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-black text-xl">Update Status</AlertDialogTitle>
                          <AlertDialogDescription className="font-medium text-sm space-y-4">
                            <div>Update the status for <span className="text-primary font-bold">"{r.rewards?.title}"</span> by <span className="font-bold">{r.profiles?.full_name || r.profiles?.username}</span>.</div>
                            <div className="flex flex-col gap-2 pt-2">
                              <Button 
                                className="w-full justify-start rounded-xl font-bold uppercase text-[10px] tracking-widest bg-green-600 hover:bg-green-700"
                                onClick={() => updateStatusMutation.mutate({ 
                                  id: r.id, 
                                  status: 'approved', 
                                  userId: r.user_id,
                                  rewardTitle: r.rewards?.title 
                                })}
                                disabled={r.status === 'approved' || updateStatusMutation.isPending}
                              >
                                <Check className="mr-2 h-4 w-4" /> Approve Redemption
                              </Button>
                              <Button 
                                variant="destructive"
                                className="w-full justify-start rounded-xl font-bold uppercase text-[10px] tracking-widest"
                                onClick={() => updateStatusMutation.mutate({ 
                                  id: r.id, 
                                  status: 'rejected', 
                                  userId: r.user_id,
                                  rewardTitle: r.rewards?.title 
                                })}
                                disabled={r.status === 'rejected' || updateStatusMutation.isPending}
                              >
                                <X className="mr-2 h-4 w-4" /> Reject Redemption
                              </Button>
                              <Button 
                                variant="outline"
                                className="w-full justify-start rounded-xl font-bold uppercase text-[10px] tracking-widest"
                                onClick={() => updateStatusMutation.mutate({ 
                                  id: r.id, 
                                  status: 'pending', 
                                  userId: r.user_id,
                                  rewardTitle: r.rewards?.title 
                                })}
                                disabled={r.status === 'pending' || updateStatusMutation.isPending}
                              >
                                <Loader2 className="mr-2 h-4 w-4" /> Set to Pending
                              </Button>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl font-bold uppercase text-[10px] tracking-widest w-full">Close</AlertDialogCancel>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
