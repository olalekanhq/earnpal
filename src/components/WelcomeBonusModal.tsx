import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, Coins, Loader2 } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useQueryClient } from "@tanstack/react-query";

export function WelcomeBonusModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [bonusAmount, setBonusAmount] = useState(50);
  const queryClient = useQueryClient();

  useEffect(() => {
    checkEligibility();
  }, []);

  const checkEligibility = async () => {
    try {
      // Check session storage first for immediate one-time display enforcement per session
      const hasShownThisSession = sessionStorage.getItem("welcome_bonus_shown");
      if (hasShownThisSession) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData && profileData.referred_by && !profileData.has_claimed_welcome_bonus && !profileData.welcome_banner_dismissed) {
        setProfile(profileData);
        setIsOpen(true);
        sessionStorage.setItem("welcome_bonus_shown", "true");
      }
    } catch (error) {
      console.error("Error checking welcome bonus eligibility:", error);
    }
  };

  const handleClaim = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc("claim_welcome_bonus", {
        _user_id: user.id,
      });

      const result = data as any;

      if (error || !result.success) {
        throw new Error(result?.message || error?.message || "Failed to claim bonus");
      }

      // Success!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#7c3aed", "#10b981", "#fbbf24"],
      });

      toast.success("Welcome bonus claimed! +50 points");
      // Use any cast to bypass type errors until types are regenerated
      (supabase.from('analytics_events' as any) as any).insert({ 
        user_id: user.id,
        event_name: 'welcome_bonus_claimed', 
        metadata: { amount: 50 } 
      }).then();
      setIsOpen(false);
      
      // Invalidate queries to update balance
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["recentTransactions"] });
      
    } catch (error: any) {
      if (error.message.includes("complete your social profiles")) {
        toast.error(error.message, {
          action: {
            label: "Go to Profile",
            onClick: () => window.location.href = "/profile"
          }
        });
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    setIsOpen(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ welcome_banner_dismissed: true } as any)
          .eq("id", user.id);
        
        // Update local query cache
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
    } catch (error) {
      console.error("Error dismissing welcome banner:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-card mx-auto">
        <div className="relative h-24 md:h-32 bg-primary flex items-center justify-center overflow-hidden">
          <Sparkles className="absolute top-4 left-4 h-6 w-6 text-white/20 animate-pulse" />
          <Sparkles className="absolute bottom-4 right-8 h-4 w-4 text-white/30 animate-bounce" />
          <div className="bg-white/20 p-3 md:p-4 rounded-3xl backdrop-blur-sm relative z-10 border border-white/20">
            <img src="/logo.png" alt="Earn Pal" className="h-10 w-10 md:h-12 md:w-12 object-contain" />
          </div>
          {/* Decorative shapes */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-black/10 rounded-full blur-xl" />
        </div>

        <div className="p-6 md:p-8 text-center space-y-4 md:space-y-6">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-black tracking-tight text-foreground uppercase">
              Welcome Bonus!
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base font-medium text-muted-foreground pt-1 md:pt-2">
              Thanks for joining Earn Pal via referral! You've unlocked a special welcome gift.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-primary/5 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center border border-primary/10 gap-1 md:gap-2 scale-100 md:scale-105 transition-transform duration-500 hover:scale-110">
            <div className="text-3xl md:text-4xl font-black text-primary tracking-tighter flex items-center gap-2">
              <Coins className="h-6 w-6 md:h-8 md:w-8" />
              50
              <span className="text-xs md:text-sm opacity-60 font-black uppercase tracking-widest ml-1">Points</span>
            </div>
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Ready to claim</p>
          </div>

          <DialogFooter className="sm:justify-center pt-1 md:pt-2">
            <Button 
              onClick={handleClaim} 
              disabled={loading}
              className="w-full h-12 md:h-14 rounded-2xl text-base md:text-lg font-black uppercase tracking-tight shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Claiming...
                </>
              ) : (
                "Claim My Bonus"
              )}
            </Button>
          </DialogFooter>
          
          <button 
            onClick={handleClose}
            className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            Claim later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
