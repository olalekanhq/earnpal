import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Loader2, Mail, ShieldAlert, Search, UserPlus, X, Shield, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UsersManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [assignSearchTerm, setAssignSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "moderator" | "task_manager">("admin");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch only users with roles (admins, moderators, etc.)
  const { data: adminUsers, isLoading: isLoadingAdmins } = useQuery({
    queryKey: ["admin-privileged-users"],
    queryFn: async () => {
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");
      
      if (rolesError) throw rolesError;

      const userIds = roles.map(r => r.user_id);
      
      if (userIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);
      
      if (profilesError) throw profilesError;

      return profiles.map(profile => ({
        ...profile,
        roles: roles.filter(r => r.user_id === profile.id).map(r => r.role)
      }));
    }
  });

  // Search for users to assign a role to
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["user-search", assignSearchTerm],
    queryFn: async () => {
      if (!assignSearchTerm || assignSearchTerm.length < 3) return [];
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, email, avatar_url")
        .or(`username.ilike.%${assignSearchTerm}%,email.ilike.%${assignSearchTerm}%,full_name.ilike.%${assignSearchTerm}%`)
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: assignSearchTerm.length >= 3
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: string }) => {
      const { error } = await supabase.rpc("assign_role", {
        target_user_id: userId,
        new_role: role as any
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-privileged-users"] });
      setIsDialogOpen(false);
      setAssignSearchTerm("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to assign role");
    }
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: string }) => {
      const { error } = await supabase.rpc("remove_role", {
        target_user_id: userId,
        role_to_remove: role as any
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role removed successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-privileged-users"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove role");
    }
  });

  const filteredAdmins = adminUsers?.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search admins..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-11 rounded-xl border-border/50 bg-background"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-11 px-6 font-black uppercase text-[10px] tracking-widest">
              <UserPlus className="h-4 w-4 mr-2" />
              Assign New Role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl border-border/50 bg-card">
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tight">Assign Role</DialogTitle>
              <DialogDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Search for a user and select a role to assign.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Search User
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Username, email or name..." 
                    value={assignSearchTerm}
                    onChange={(e) => setAssignSearchTerm(e.target.value)}
                    className="pl-9 h-11 rounded-xl border-border/50 bg-background"
                  />
                </div>
                {isSearching && <div className="text-[10px] font-bold text-center py-2">Searching...</div>}
                {searchResults && searchResults.length > 0 && (
                  <div className="mt-2 rounded-xl border border-border/40 bg-muted/30 overflow-hidden">
                    {searchResults.map(user => (
                      <div 
                        key={user.id} 
                        className="flex items-center justify-between p-3 hover:bg-accent/50 cursor-pointer transition-colors border-b border-border/20 last:border-0"
                        onClick={() => {
                          assignRoleMutation.mutate({ userId: user.id, role: selectedRole });
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url || ""} />
                            <AvatarFallback className="bg-primary/5 text-primary text-[10px]">
                              <User className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold">{user.username || "Unknown"}</span>
                            <span className="text-[10px] text-muted-foreground">{user.email}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg">
                          <UserPlus className="h-4 w-4 text-primary" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Select Role
                </label>
                <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                  <SelectTrigger className="h-11 rounded-xl border-border/50 bg-background">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/50 bg-card">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="task_manager">Task Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Staff Member</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Contact</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-right">Roles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingAdmins ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : filteredAdmins?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  No staff members found
                </TableCell>
              </TableRow>
            ) : (
              filteredAdmins?.map((user) => (
                <TableRow key={user.id} className="border-border/40 hover:bg-accent/5 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border shadow-sm">
                        <AvatarImage src={user.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/5 text-primary text-[10px]">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          {user.username ? (user.username.charAt(0).toUpperCase() + user.username.slice(1)) : "User"}
                          {user.roles.includes('admin') && <ShieldCheck className="h-3 w-3 text-primary" />}
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
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {user.roles.map((role: string) => (
                        <Badge 
                          key={role}
                          variant="outline"
                          className={cn(
                            "font-black uppercase text-[9px] tracking-wider px-2 py-0.5 rounded-lg flex items-center gap-1.5",
                            role === 'admin' ? "bg-primary/10 text-primary border-primary/20" : 
                            role === 'moderator' ? "bg-violet-500/10 text-violet-600 border-violet-500/20" :
                            "bg-blue-500/10 text-blue-600 border-blue-500/20"
                          )}
                        >
                          {role === 'admin' ? <Shield className="h-2.5 w-2.5" /> : <ShieldAlert className="h-2.5 w-2.5" />}
                          {role.replace('_', ' ')}
                          <button 
                            onClick={() => removeRoleMutation.mutate({ userId: user.id, role })}
                            className="ml-1 hover:text-destructive transition-colors"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </Badge>
                      ))}
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
