import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Coins, Calendar, Tag, Hash, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface Transaction {
  id: string;
  description: string | null;
  amount: number;
  type: string;
  status?: string | null;
  created_at: string;
}

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  const isPositive = transaction.amount > 0;
  const isPending = transaction.status === 'pending';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden p-0 gap-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              Transaction Details
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground font-medium pt-1">
            Full record of this movement in your account.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Hero Amount Card */}
          <div className={cn(
            "rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-2 border shadow-sm relative overflow-hidden",
            isPending
              ? "bg-amber-500/5 border-amber-500/10 text-amber-600"
              : isPositive 
                ? "bg-green-500/5 border-green-500/10 text-green-600" 
                : "bg-destructive/5 border-destructive/10 text-destructive"
          )}>
            <div className={cn(
              "p-3 rounded-full mb-1",
              isPending ? "bg-amber-500/10" : isPositive ? "bg-green-500/10" : "bg-destructive/10"
            )}>
              {isPending ? <Clock className="h-6 w-6" /> : isPositive ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownRight className="h-6 w-6" />}
            </div>
            <span className="text-4xl font-black tracking-tighter">
              {isPending ? "" : isPositive ? "+" : ""}{transaction.amount}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
              {isPending ? "Pending Points" : "Points Total"}
            </span>
            {isPending && (
              <div className="absolute top-2 right-2">
                <Badge variant="outline" className="text-[8px] border-amber-500/30 text-amber-600 bg-amber-500/10 uppercase font-black">Pending</Badge>
              </div>
            )}
          </div>

          {/* Details List */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-accent/5 transition-colors">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Tag className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Description</p>
                <p className="text-sm font-bold text-foreground break-words">{transaction.description || "No description"}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-accent/5 transition-colors">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Coins className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Type</p>
                <p className="text-sm font-bold text-foreground capitalize">{transaction.type.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-accent/5 transition-colors">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Date & Time</p>
                <p className="text-sm font-bold text-foreground">{new Date(transaction.created_at).toLocaleString(undefined, {
                  dateStyle: 'long',
                  timeStyle: 'medium'
                })}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-accent/5 transition-colors">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Hash className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Transaction ID</p>
                <p className="text-[10px] font-mono font-medium text-muted-foreground truncate">{transaction.id}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted/30 border-t border-border/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-foreground text-background font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            Close Details
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
