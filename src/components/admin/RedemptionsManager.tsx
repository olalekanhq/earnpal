import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
          profiles(full_name, email, username),
          rewards(title, cost_points)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, userId, rewardTitle }: { id: string; status: string; userId: string; rewardTitle: string }) => {
      const { error } = await supabase
        .from("redemptions")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;

      // Create notification for user
      await supabase.from("notifications").insert({
        user_id: userId,
        title: status === 'approved' ? "Redemption Approved!" : "Redemption Rejected",
        message: status === 'approved' 
          ? `Your request for "${rewardTitle}" has been approved.` 
          : `Your request for "${rewardTitle}" was rejected. Please contact support for details.`,
        type: "redemption"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      toast.success("Redemption status updated");
    },
    onError: (error) => {
      toast.error("Failed to update status: " + error.message);
    }
  });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">User</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Reward</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Cost</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Date</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Status</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {redemptions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground font-medium">
                  No redemptions found.
                </TableCell>
              </TableRow>
            ) : (
              redemptions?.map((r: any) => (
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
                  <TableCell className="px-6 py-4 text-xs text-muted-foreground font-medium">
                    {format(new Date(r.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge 
                      className={cn(
                        "font-black uppercase text-[10px] tracking-wider px-2 py-0.5",
                        r.status === 'pending' && "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20",
                        r.status === 'approved' && "bg-green-500/10 text-green-600 hover:bg-green-500/20",
                        r.status === 'rejected' && "bg-destructive/10 text-destructive hover:bg-destructive/20"
                      )}
                    >
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    {r.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => updateStatusMutation.mutate({ 
                            id: r.id, 
                            status: 'approved', 
                            userId: r.user_id,
                            rewardTitle: r.rewards?.title 
                          })}
                          disabled={updateStatusMutation.isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/5"
                          onClick={() => updateStatusMutation.mutate({ 
                            id: r.id, 
                            status: 'rejected', 
                            userId: r.user_id,
                            rewardTitle: r.rewards?.title 
                          })}
                          disabled={updateStatusMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
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
