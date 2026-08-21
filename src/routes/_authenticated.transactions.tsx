import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { History, Coins, Loader2, Gift, TrendingUp, ArrowRight, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TransactionDetailModal, Transaction } from "@/components/TransactionDetailModal";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { z } from "zod";

const transactionSearchSchema = z.object({
  transactionId: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/transactions")({
  validateSearch: (search) => transactionSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Transaction History | Earn Pal" },
      { name: "description", content: "Detailed view of your point earnings and spending on Earn Pal." }
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const { transactionId } = Route.useSearch();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: transactions, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("points_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  useEffect(() => {
    if (transactionId && transactions) {
      const tx = transactions.find((t: any) => t.id === transactionId);
      if (tx) {
        setSelectedTx(tx);
        setIsModalOpen(true);
      } else {
        // If not in the current list (e.g. pagination or old), fetch it individually
        const fetchIndividual = async () => {
          const { data, error } = await supabase
            .from("points_transactions")
            .select("*")
            .eq("id", transactionId)
            .single();
          
          if (data && !error) {
            setSelectedTx(data);
            setIsModalOpen(true);
          }
        };
        fetchIndividual();
      }
    }
  }, [transactionId, transactions]);

  const handleTxClick = (tx: Transaction) => {
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  return (
    <div className="pb-12 px-4 md:px-8 max-w-4xl mx-auto space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Transaction History</h1>
        <p className="text-muted-foreground font-medium">Detailed view of your point earnings and spending.</p>
      </header>

      <Card className="border-none shadow-sm bg-card overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg font-black uppercase tracking-tight">Full History</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isTransactionsLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : transactions?.length ? (
            <div className="divide-y divide-border/40">
              {transactions.map((tx: any) => (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between p-5 hover:bg-accent/5 transition-colors cursor-pointer group"
                  onClick={() => handleTxClick(tx)}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2 rounded-lg",
                      tx.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                      tx.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    )}>
                      {tx.status === 'pending' ? <Clock className="h-4 w-4" /> : 
                       tx.amount > 0 ? <TrendingUp className="h-4 w-4" /> : <Gift className="h-4 w-4" />}
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-foreground leading-none group-hover:text-primary transition-colors">
                        {tx.description}
                        {tx.status === 'pending' && <span className="ml-2 text-[8px] font-black uppercase text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">Pending</span>}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{new Date(tx.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "font-black text-sm px-3 py-1 rounded-lg",
                    tx.status === 'pending' ? "bg-amber-100 text-amber-600" :
                    tx.amount > 0 ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"
                  )}>
                    {tx.status === 'pending' ? "" : tx.amount > 0 ? "+" : ""}{tx.amount} PTS
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">No transactions recorded yet.</div>
          )}
        </CardContent>
      </Card>

      <TransactionDetailModal 
        transaction={selectedTx} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
