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

export function Onboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const checkOnboarding = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const hasSeen = localStorage.getItem(`onboarding_seen_${user.id}`);
      if (!hasSeen) setIsOpen(true);
    };
    checkOnboarding();
  }, []);

  const finish = () => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) localStorage.setItem(`onboarding_seen_${user.id}`, "true");
      setIsOpen(false);
    });
  };

  const steps = [
    {
      title: "Welcome to PAID POINT!",
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{steps[step - 1].title}</DialogTitle>
          <DialogDescription className="pt-4 text-base">
            {steps[step - 1].description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < steps.length ? (
            <Button onClick={() => setStep(step + 1)}>Next</Button>
          ) : (
            <Button onClick={finish}>Get Started</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
