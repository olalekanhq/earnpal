"use client";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
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
import {
  Dialog,
  DialogContent,
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
      let query = supabase.from("profiles").select("*", { count: "exact" });
      if (searchQuery) {
        query = query.or(`username.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
      }
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      const { data: profiles, count, error: profilesError } = await query.order("created_at", { ascending: false }).range(from, to);
      if (profilesError) throw profilesError;
      const { data: roles, error: rolesError } = await supabase.from("user_roles").select("user_id, role").in("user_id", profiles.map(p => p.id));
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
        finalUsers = mappedUsers.filter(user => (roleFilter === "admin" && user.isAdmin) || (roleFilter === "user" && !user.isAdmin));
      }
      return { users: finalUsers, totalCount: count || 0 };
    }
  });

  const handleRoleChange = async (uid: string, r: string) => {
    try {
      await assignRoleFn({ data: { userId: uid, role: r as any } });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User role updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update user role");
    }
  };

  const users = data?.users || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const { data: userDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["user-details", selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser) return null;
      const [txs, refs, reds] = await Promise.all([
        supabase.from("points_transactions").select("*").eq("user_id", selectedUser.id).order("created_at", { ascending: false }),
        supabase.from("referrals").select("*, profiles!referrals_referred_id_fkey(username, full_name, email)").eq("referrer_id", selectedUser.id).order("created_at", { ascending: false }),
        supabase.from("redemptions").select("*, rewards(title, points_cost)").eq("user_id", selectedUser.id).order("created_at", { ascending: false })
      ]);
      return { transactions: txs.data || [], referrals: refs.data || [], redemptions: reds.data || [] };
    },
    enabled: !!selectedUser && isDetailsOpen
  });

  if (isLoading) {
    return <div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-10 rounded-xl h-11" />
        </div>
        <div className="flex items-center gap-3">
          <Select value={roleFilter} onValueChange={(val) => { setRoleFilter(val); setCurrentPage(1); }}>
            <SelectTrigger className="w-[140px] rounded-xl"><SelectValue placeholder="All Roles" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Roles</SelectItem><SelectItem value="admin">Admins</SelectItem><SelectItem value="user">Users</SelectItem></SelectContent>
          </Select>
          <Badge variant="secondary" className="h-11 px-4 rounded-xl">{totalCount} Users</Badge>
        </div>
      </div>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Contact</TableHead><TableHead>Balance</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8"><AvatarImage src={user.avatar_url || ""} /><AvatarFallback><User className="h-3 w-3" /></AvatarFallback></Avatar>
                    <div><div className="font-bold flex items-center gap-2">{user.username || "User"} {user.isAdmin && <ShieldAlert className="h-3 w-3 text-primary" />}</div><div className="text-xs text-muted-foreground">{user.full_name}</div></div>
                  </div>
                </TableCell>
                <TableCell><div className="text-xs">{user.email}</div></TableCell>
                <TableCell><Badge variant="outline">{user.points_balance || 0} pts</Badge></TableCell>
                <TableCell className="text-xs">{format(new Date(user.created_at), "MMM d, yyyy")}</TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => { setSelectedUser(user); setIsDetailsOpen(true); }}><Eye className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto rounded-[2rem] p-4 sm:p-6">
          <DialogHeader><DialogTitle>User Details: {selectedUser?.username}</DialogTitle></DialogHeader>
          {selectedUser && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between p-4 bg-accent/5 rounded-2xl border">
                <div><h3 className="font-black uppercase text-sm">Role Management</h3><p className="text-xs text-muted-foreground">Change permissions for this user.</p></div>
                <Select defaultValue={selectedUser.currentRole} onValueChange={(val) => handleRoleChange(selectedUser.id, val)}>
                  <SelectTrigger className="w-[180px] rounded-xl"><SelectValue placeholder="Select Role" /></SelectTrigger>
                  <SelectContent><SelectItem value="user">Standard User</SelectItem><SelectItem value="moderator">Moderator</SelectItem><SelectItem value="admin">Administrator</SelectItem><SelectItem value="task_manager">Task Manager</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <Card><CardHeader><CardTitle className="text-xs uppercase font-black">History</CardTitle></CardHeader><CardContent className="h-64 overflow-y-auto">{userDetails?.transactions.map((tx: any) => <div key={tx.id} className="text-xs py-2 border-b last:border-0 flex justify-between"><span>{tx.description}</span><span className="font-black">{tx.amount}</span></div>)}</CardContent></Card>
                <Card><CardHeader><CardTitle className="text-xs uppercase font-black">Referrals</CardTitle></CardHeader><CardContent className="h-64 overflow-y-auto">{userDetails?.referrals.map((ref: any) => <div key={ref.id} className="text-xs py-2 border-b last:border-0">{ref.profiles?.username} - {ref.status}</div>)}</CardContent></Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
