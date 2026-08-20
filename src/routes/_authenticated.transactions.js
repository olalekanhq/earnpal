import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
export const Route = createFileRoute("/_authenticated/transactions")({
    head: () => ({
        meta: [
            { title: "Transaction History | Earn Pal" },
            { name: "description", content: "Detailed view of your point earnings and spending on Earn Pal." }
        ],
    }),
    component: TransactionsPage,
});
function TransactionsPage() {
    const { data: transactions, isLoading: isTransactionsLoading } = useQuery({
        queryKey: ["transactions"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user)
                return [];
            const { data } = await supabase
                .from("points_transactions")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });
            return data || [];
        },
    });
    return (<div className="pb-12 px-4 md:px-8 max-w-4xl mx-auto space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Transaction History</h1>
        <p className="text-muted-foreground font-medium">Detailed view of your point earnings and spending.</p>
      </header>

      <Card className="border-none shadow-sm bg-card overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
              <TrendingUp className="h-5 w-5"/>
            </div>
            <CardTitle className="text-lg font-black uppercase tracking-tight">Full History</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isTransactionsLoading ? (<div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin"/></div>) : transactions?.length ? (<div className="divide-y divide-border/40">
              {transactions.map((tx) => (<div key={tx.id} className="flex items-center justify-between p-5 hover:bg-accent/5 transition-colors cursor-pointer group" onClick={() => {
                    toast.info(<div className="space-y-2">
                        <p className="font-bold text-sm">Transaction Details</p>
                        <div className="text-xs space-y-1 font-medium">
                          <p><span className="text-muted-foreground uppercase text-[10px] font-black mr-2">Description:</span> {tx.description}</p>
                          <p><span className="text-muted-foreground uppercase text-[10px] font-black mr-2">Amount:</span> {tx.amount > 0 ? '+' : ''}{tx.amount} PTS</p>
                          <p><span className="text-muted-foreground uppercase text-[10px] font-black mr-2">Type:</span> {tx.type}</p>
                          <p><span className="text-muted-foreground uppercase text-[10px] font-black mr-2">Date:</span> {new Date(tx.created_at).toLocaleString()}</p>
                          <p><span className="text-muted-foreground uppercase text-[10px] font-black mr-2">ID:</span> {tx.id}</p>
                        </div>
                      </div>, { duration: 6000 });
                }}>
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-foreground leading-none group-hover:text-primary transition-colors">{tx.description}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{new Date(tx.created_at).toLocaleString()}</p>
                  </div>
                  <div className={cn("font-black text-sm px-3 py-1 rounded-lg", tx.amount > 0 ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive")}>
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} PTS
                  </div>
                </div>))}
            </div>) : (<div className="p-12 text-center text-muted-foreground">No transactions recorded yet.</div>)}
        </CardContent>
      </Card>
    </div>);
}
