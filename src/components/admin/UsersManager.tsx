import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Loader2, 
  Mail, 
  ShieldAlert, 
  Eye, 
  TrendingUp, 
  Gift, 
  Users as UsersIcon,
  Calendar,
  Phone,
  Hash,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Shield
} from "lucide-react";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignUserRole } from "@/lib/admin.functions";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";

export function UsersManager() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();
  const assignRoleFn = useServerFn(assignUserRole);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", searchQuery, roleFilter, currentPage],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*", { count: "exact" });
      
      if (searchQuery) {
        query = query.or(`username.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
      }

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data: profiles, count, error: profilesError } = await query
        .order("created_at", { ascending: false })
        .range(from, to);
      
      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", profiles.map(p => p.id));
      
      if (rolesError) throw rolesError;

      const mappedUsers = profiles.map(profile => ({
        ...profile,
        isAdmin: roles?.some(r => r.user_id === profile.id && r.role === 'admin'),
        isModerator: roles?.some(r => r.user_id === profile.id && r.role === 'moderator'),
        isTaskManager: roles?.some(r => r.user_id === profile.id && r.role === 'task_manager'),
        currentRole: roles?.find(r => r.user_id === profile.id)?.role || 'user'
      }));
      
      let finalUsers = mappedUsers;
      if (roleFilter !== "all") {
        finalUsers = mappedUsers.filter(user => 
          (roleFilter === "admin" && user.isAdmin) || 
          (roleFilter === "user" && !user.isAdmin)
        );
      }

      return { users: finalUsers, totalCount: count || 0 };
    }
  });

  const roleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return assignRoleFn({ data: { userId, role: role as any } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User role updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user role");
    },
  });

  const users = data?.users || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const paginatedUsers = users;

  const { data: userDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["user-details", selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser) return null;

      const [transactionsRes, referralsRes, redemptionsRes] = await Promise.all([
        supabase
          .from("points_transactions")
          .select("*")
          .eq("user_id", selectedUser.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("referrals")
          .select("*, profiles!referrals_referred_id_fkey(username, full_name, email)")
          .eq("referrer_id", selectedUser.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("redemptions")
          .select("*, rewards(title, points_cost)")
          .eq("user_id", selectedUser.id)
          .order("created_at", { ascending: false })
      ]);

      return {
        transactions: transactionsRes.data || [],
        referrals: referralsRes.data || [],
        redemptions: redemptionsRes.data || []
      };
    },
    enabled: !!selectedUser && isDetailsOpen
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or username..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 rounded-xl bg-card border-border/50 h-11 font-medium"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-card border border-border/50 rounded-xl px-3 py-1.5">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select 
              value={roleFilter} 
              onValueChange={(val) => {
                setRoleFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="border-none bg-transparent h-8 w-[120px] focus:ring-0 font-bold text-xs uppercase tracking-widest">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50">
                <SelectItem value="all" className="text-xs font-bold uppercase tracking-widest">All Roles</SelectItem>
                <SelectItem value="admin" className="text-xs font-bold uppercase tracking-widest">Admins</SelectItem>
                <SelectItem value="user" className="text-xs font-bold uppercase tracking-widest">Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Badge variant="secondary" className="h-11 px-4 rounded-xl border-none bg-primary/5 text-primary font-black uppercase text-[10px] tracking-widest flex items-center shrink-0">
            {totalCount} Users
          </Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 min-w-[150px]">User</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 min-w-[200px]">Contact</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Balance</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-center">Joined</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => (
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
                        {user.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "User"}
                        {user.isAdmin && <ShieldAlert className="h-3 w-3 text-primary" />}
                        {user.isModerator && !user.isAdmin && <Shield className="h-3 w-3 text-violet-500" />}
                        {user.isTaskManager && !user.isAdmin && !user.isModerator && <Shield className="h-3 w-3 text-emerald-500" />}
                      </div>
                      <div className="text-xs text-muted-foreground">{user.full_name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </div>
                    {user.phone_number && (
                      <div className="text-[10px] font-bold text-muted-foreground/60">{user.phone_number}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Badge variant="outline" className="font-black text-primary border-primary/20 bg-primary/5">
                    {user.points_balance?.toLocaleString()} <span className="ml-1 text-[8px] uppercase">pts</span>
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 text-center text-xs text-muted-foreground font-medium">
                  {format(new Date(user.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => {
                      setSelectedUser(user);
                      setIsDetailsOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4 border-t border-border/40">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-9 px-3 font-bold border-border/50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-9 w-9 rounded-xl font-bold p-0 border-border/50",
                    currentPage === i + 1 && "shadow-md shadow-primary/20"
                  )}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-9 px-3 font-bold border-border/50"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl p-0 bg-background sm:rounded-[32px]">
          {selectedUser && (
            <div className="relative">
              <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-b border-border/50" />
              
              <div className="px-6 pb-8">
                <div className="flex flex-col md:flex-row gap-6 -mt-10 mb-8 items-start">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-xl rounded-[28px]">
                    <AvatarImage src={selectedUser.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/5 text-primary">
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="pt-10 flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-black tracking-tight">
                        {selectedUser.username ? (selectedUser.username.charAt(0).toUpperCase() + selectedUser.username.slice(1)) : "User Details"}
                      </h2>
                      {selectedUser.isAdmin && (
                        <Badge className="bg-primary text-primary-foreground font-black uppercase text-[10px] px-2 py-0.5 rounded-lg">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                        <Mail className="h-4 w-4 text-primary/60" />
                        {selectedUser.email}
                      </div>
                      {selectedUser.phone_number && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                          <Phone className="h-4 w-4 text-primary/60" />
                          {selectedUser.phone_number}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                        <Calendar className="h-4 w-4 text-primary/60" />
                        Joined {format(new Date(selectedUser.created_at), "MMMM d, yyyy")}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                        <Hash className="h-4 w-4 text-primary/60" />
                        ID: {selectedUser.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>

                  <div className="pt-10">
                    <div className="bg-primary/5 border border-primary/10 rounded-2xl px-6 py-4 text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">Current Balance</p>
                      <p className="text-3xl font-black text-primary">{selectedUser.points_balance?.toLocaleString()}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mt-1">Earn Pal Points</p>
                    </div>
                  </div>
                </div>

                <div className="mb-8 p-6 rounded-[28px] border border-border/50 bg-accent/5 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <h3 className="font-black uppercase tracking-tight text-sm">Role Management</h3>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Assign a system role to this user to grant administrative permissions.</p>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <Select 
                      defaultValue={selectedUser.currentRole}
                      onValueChange={(val) => roleMutation.mutate({ userId: selectedUser.id, role: val })}
                      disabled={roleMutation.isPending}
                    >
                      <SelectTrigger className="w-full md:w-[200px] rounded-xl font-bold bg-background border-border/50 h-11">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/50">
                        <SelectItem value="user" className="font-bold">Standard User</SelectItem>
                        <SelectItem value="moderator" className="font-bold">Moderator</SelectItem>
                        <SelectItem value="admin" className="font-bold text-primary">Administrator</SelectItem>
                        <SelectItem value="task_manager" className="font-bold">Task Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    {roleMutation.isPending && <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>}
                  </div>
                </div>

                {isDetailsLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Transactions History */}
                    <Card className="md:col-span-2 border-none shadow-sm bg-card/50 overflow-hidden rounded-2xl">
                      <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <CardTitle className="text-sm font-black uppercase tracking-widest">Points History</CardTitle>
                        </div>
                        <Badge variant="outline" className="rounded-lg text-[10px] font-bold">
                          {userDetails?.transactions.length} Records
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="max-h-[400px] overflow-y-auto divide-y divide-border/40 scrollbar-thin scrollbar-thumb-primary/10">
                          {userDetails?.transactions.length ? (
                            userDetails.transactions.map((tx: any) => (
                              <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-accent/5 transition-colors">
                                <div className="space-y-1">
                                  <p className="font-bold text-sm leading-none">{tx.description}</p>
                                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                    {format(new Date(tx.created_at), "MMM d, yyyy")} &middot; {format(new Date(tx.created_at), "HH:mm")}
                                  </p>
                                </div>
                                <div className={cn(
                                  "font-black text-sm px-2.5 py-1 rounded-lg",
                                  tx.amount > 0 ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"
                                )}>
                                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center text-muted-foreground text-sm font-medium italic">
                              No transaction history found.
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-6">
                      {/* Referrals */}
                      <Card className="border-none shadow-sm bg-card/50 overflow-hidden rounded-2xl">
                        <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-2">
                            <UsersIcon className="h-4 w-4 text-primary" />
                            <CardTitle className="text-sm font-black uppercase tracking-widest">Referrals</CardTitle>
                          </div>
                          <Badge variant="outline" className="rounded-lg text-[10px] font-bold">
                            {userDetails?.referrals.length}
                          </Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="max-h-[250px] overflow-y-auto divide-y divide-border/40">
                            {userDetails?.referrals.length ? (
                              userDetails.referrals.map((ref: any) => (
                                <div key={ref.id} className="p-4 hover:bg-accent/5 transition-colors">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="font-bold text-sm truncate max-w-[120px]">
                                      {ref.profiles?.username || "Referred User"}
                                    </p>
                                    <Badge className="bg-green-500/10 text-green-600 border-none font-black text-[9px] uppercase">
                                      {ref.status}
                                    </Badge>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground font-medium">
                                    {format(new Date(ref.created_at), "MMM d, yyyy")}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <div className="p-8 text-center text-muted-foreground text-xs font-medium">
                                No referrals yet.
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Redemptions */}
                      <Card className="border-none shadow-sm bg-card/50 overflow-hidden rounded-2xl">
                        <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Gift className="h-4 w-4 text-primary" />
                            <CardTitle className="text-sm font-black uppercase tracking-widest">Redeemed</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="max-h-[250px] overflow-y-auto divide-y divide-border/40">
                            {userDetails?.redemptions.length ? (
                              userDetails.redemptions.map((red: any) => (
                                <div key={red.id} className="p-4 hover:bg-accent/5 transition-colors">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="font-bold text-sm truncate max-w-[120px]">
                                      {red.rewards?.title}
                                    </p>
                                    <p className="text-primary font-black text-[10px]">{red.rewards?.points_cost} PTS</p>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-muted-foreground font-medium">
                                      {format(new Date(red.created_at), "MMM d, yyyy")}
                                    </p>
                                    <span className={cn(
                                      "text-[9px] font-black uppercase tracking-wider",
                                      red.status === 'approved' ? "text-green-600" : "text-orange-600"
                                    )}>
                                      {red.status}
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-8 text-center text-muted-foreground text-xs font-medium">
                                No redemptions.
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
