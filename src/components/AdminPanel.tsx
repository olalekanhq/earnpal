import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Users, Gift, ShoppingBag } from "lucide-react";

export function AdminPanel() {
  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: 'admin' });
      if (error) return false;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["adminStats"],
    enabled: !!isAdmin,
    queryFn: async () => {
      // These would ideally be more complex aggregations
      const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { data: transactions } = await supabase.from('points_transactions').select('amount');
      const totalPoints = transactions?.reduce((acc, tx) => acc + (tx.amount > 0 ? tx.amount : 0), 0) || 0;
      
      const { count: redemptions } = await supabase.from('redemptions').select('*', { count: 'exact', head: true });
      
      return { totalUsers, totalPoints, redemptions };
    }
  });

  const { data: recentRedemptions } = useQuery({
    queryKey: ["adminRedemptions"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data } = await supabase
        .from('redemptions')
        .select('*, profiles(full_name, email), rewards(title)')
        .order('created_at', { ascending: false })
        .limit(10);
      return data as any[];
    }
  });

  if (checkingAdmin) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8" /></div>;
  if (!isAdmin) return <div className="p-12 text-center">Access Denied. Admins only.</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Total Users</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats?.totalUsers || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Points Issued</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats?.totalPoints.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Redemptions</CardTitle>
            <ShoppingBag className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats?.redemptions || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="redemptions" className="w-full">
        <TabsList>
          <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
          <TabsTrigger value="rewards">Manage Rewards</TabsTrigger>
        </TabsList>
        <TabsContent value="redemptions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Redemptions</CardTitle>
              <CardDescription>Review and approve user requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRedemptions?.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium">{r.profiles?.full_name}</div>
                        <div className="text-xs text-muted-foreground">{r.profiles?.email}</div>
                      </TableCell>
                      <TableCell>{r.rewards?.title}</TableCell>
                      <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={r.status === 'pending' ? 'outline' : r.status === 'approved' ? 'default' : 'destructive'}>
                          {r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
