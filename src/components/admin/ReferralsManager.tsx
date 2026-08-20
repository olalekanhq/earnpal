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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Loader2, 
  Mail, 
  Settings2, 
  RefreshCw, 
  Plus, 
  Minus,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ReferralsManager() {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>("0");
  const [adjustType, setAdjustType] = useState<"earn" | "redemption">("earn");
  const [adjustDescription, setAdjustDescription] = useState<string>("Referral points adjustment");

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-referrals-users"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;

      const { data: referrals, error: refError } = await supabase
        .from("referrals")
        .select("referrer_id");
      
      if (refError) throw refError;

      const refCounts = (referrals || []).reduce((acc: any, curr: any) => {
        if (curr.referrer_id) {
          acc[curr.referrer_id] = (acc[curr.referrer_id] || 0) + 1;
        }
        return acc;
      }, {});

      return profiles.map(profile => ({
        ...profile,
        referralCount: refCounts[profile.id] || 0
      }));
    }
  });

  const adjustPointsMutation = useMutation({
    mutationFn: async ({ userId, amount, type, description }: any) => {
      const { error } = await supabase
        .from("points_transactions")
        .insert({
          user_id: userId,
          amount: amount,
          type: type,
          description: description
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-referrals-users"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      toast.success("Points adjusted successfully");
      setSelectedUser(null);
      setAdjustAmount("0");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to adjust points");
    }
  });

  const resendNotificationMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("notifications")
        .insert({
          user_id: userId,
          title: "Referral Validation",
          message: "Your referral code has been validated. You can now track your progress in the Referral Dashboard.",
          type: "referral"
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Validation notification sent");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send notification");
    }
  });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight">Referral Management</h3>
          <p className="text-sm text-muted-foreground font-medium">Adjust points and resend validation alerts.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">User</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Referrals</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-center">Referral Code</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id} className="border-border/40 hover:bg-accent/5 transition-colors">
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-border shadow-sm">
                      <AvatarImage src={user.avatar_url || ""} />
                      <AvatarFallback className="bg-primary/5 text-primary text-[10px]">
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        {user.username ? (user.username.charAt(0).toUpperCase() + user.username.slice(1)) : "User"}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                        {user.points_balance?.toLocaleString()} PTS
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Badge variant="outline" className="font-black text-primary border-primary/20 bg-primary/5">
                    {user.referralCount} <span className="ml-1 text-[8px] uppercase">refs</span>
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 text-center">
                  <code className="text-[10px] font-black bg-muted px-2 py-1 rounded-md uppercase tracking-wider">
                    {user.referral_code || "None"}
                  </code>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                      title="Adjust Points"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 transition-colors"
                      title="Resend Validation Notification"
                      onClick={() => resendNotificationMutation.mutate(user.id)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Adjust Points</DialogTitle>
            <DialogDescription className="font-medium">
              Manually adjust points for <span className="text-foreground font-bold">{selectedUser?.username || "this user"}</span>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Type</label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  type="button"
                  variant={adjustType === 'earn' ? 'default' : 'outline'}
                  className="rounded-xl font-bold"
                  onClick={() => setAdjustType('earn')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Points
                </Button>
                <Button 
                  type="button"
                  variant={adjustType === 'redemption' ? 'default' : 'outline'}
                  className="rounded-xl font-bold"
                  onClick={() => setAdjustType('redemption')}
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Deduct
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Amount</label>
              <Input 
                type="number" 
                value={adjustAmount} 
                onChange={(e) => setAdjustAmount(e.target.value)}
                className="rounded-xl border-border/50 h-11 font-bold"
                placeholder="Enter amount..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
              <Input 
                value={adjustDescription} 
                onChange={(e) => setAdjustDescription(e.target.value)}
                className="rounded-xl border-border/50 h-11 font-bold"
                placeholder="Reason for adjustment..."
              />
            </div>
            
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="text-[10px] text-amber-800 font-medium">
                This will create a transaction record and update the user's balance instantly.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              className="w-full rounded-xl font-bold h-12 shadow-lg shadow-primary/10" 
              disabled={adjustPointsMutation.isPending || !adjustAmount || adjustAmount === "0"}
              onClick={() => adjustPointsMutation.mutate({
                userId: selectedUser.id,
                amount: adjustType === 'earn' ? parseInt(adjustAmount) : -Math.abs(parseInt(adjustAmount)),
                type: adjustType,
                description: adjustDescription
              })}
            >
              {adjustPointsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Adjustment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
