import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "@tanstack/react-router";

export function Onboarding() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Don't show onboarding on auth page
    if (location.pathname === '/auth') {
      setIsOpen(false);
      return;
    }

    const checkOnboarding = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const hasSeen = typeof window !== 'undefined' ? localStorage.getItem(`onboarding_seen_${user.id}`) : null;
      if (!hasSeen) setIsOpen(true);
    };
    checkOnboarding();
  }, [location.pathname]);

  const finish = () => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && typeof window !== 'undefined') localStorage.setItem(`onboarding_seen_${user.id}`, "true");
      setIsOpen(false);
    });
  };

  const steps = [
    {
      title: "Welcome to Earn Pal!",
      description: "Start earning points today by completing simple tasks, referring friends, and participating in our daily activities.",
    },
    {
      title: "Earn & Redeem",
      description: "Points can be redeemed for gift cards, merchandise, and exclusive rewards. The more you earn, the better the rewards!",
    },
    {
      title: "Daily Streaks",
      description: "Log in every day to maintain your streak and earn bonus points. Don't break the chain!",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-black tracking-tight">{steps[step - 1]?.title || "Welcome"}</DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium text-lg leading-relaxed">
            {steps[step - 1]?.description || ""}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          {step > 1 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)} className="font-bold rounded-xl">
              Back
            </Button>
          )}
          {step < steps.length ? (
            <Button onClick={() => setStep(step + 1)} className="font-bold rounded-xl px-8 shadow-md shadow-primary/10">Next</Button>
          ) : (
            <Button onClick={finish} className="font-bold rounded-xl px-8 shadow-md shadow-primary/10">Get Started</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
