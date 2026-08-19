import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Loader2, Mail, ShieldAlert, Search } from "lucide-react";
import { format } from "date-fns";

import { useState } from "react";
import { Input } from "@/components/ui/input";

export function UsersManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // First get profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (profilesError) throw profilesError;

      // Then get roles for these users
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");
      
      if (rolesError) throw rolesError;

      // Merge data
      return profiles.map(profile => ({
        ...profile,
        isAdmin: roles?.some(r => r.user_id === profile.id && r.role === 'admin')
      }));
    }
  });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const filteredUsers = users?.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search users..." 
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
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Contact</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Balance</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-center">Joined</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-right">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((user) => (
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
                        {user.isAdmin && <ShieldAlert className="h-3 w-3 text-primary" />}
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
                  <Badge 
                    className={cn(
                      "font-black uppercase text-[10px] tracking-wider px-2 py-0.5",
                      user.isAdmin ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {user.isAdmin ? "Admin" : "User"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
