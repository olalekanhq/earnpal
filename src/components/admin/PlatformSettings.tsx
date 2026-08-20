import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save, Settings2 } from "lucide-react";
import { useState, useEffect } from "react";

// Define local interfaces since types might not be regenerated yet
interface AppSetting {
  id: string;
  key: string;
  value: any;
  description: string | null;
  updated_at: string | null;
}

import { useAuth } from "@/hooks/use-auth";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function PlatformSettings() {
  const { isAdmin, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const [localValues, setLocalValues] = useState<Record<string, any>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ["appSettings"],
    queryFn: async () => {
      // Use any cast to bypass type check for new table
      const { data, error } = await (supabase.from("app_settings" as any) as any)
        .select("*");
      if (error) throw error;
      return data as AppSetting[];
    }
  });

  useEffect(() => {
    if (settings) {
      const vals: Record<string, any> = {};
      settings.forEach(s => {
        vals[s.key] = s.value;
      });
      setLocalValues(vals);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: any }) => {
      const { error } = await (supabase.from("app_settings" as any) as any)
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appSettings"] });
      toast.success("Setting updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update setting");
    }
  });

  const handleSave = (key: string) => {
    updateMutation.mutate({ key, value: localValues[key] });
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Alert variant="destructive" className="border-destructive/20 bg-destructive/5 rounded-2xl">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-black uppercase tracking-tight ml-2">Access Denied</AlertTitle>
          <AlertDescription className="font-medium ml-2">
            You do not have the required permissions to view or edit platform settings. Only administrators can access this section.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Settings2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-black uppercase tracking-tight">Welcome Bonus Settings</CardTitle>
              <CardDescription className="font-medium">Configure eligibility and rewards for new referred users</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-accent/5 border border-border/50">
            <div className="space-y-0.5">
              <Label className="text-sm font-black uppercase tracking-wider">Enable Welcome Bonus</Label>
              <p className="text-xs text-muted-foreground font-medium">Show the welcome popup to new referred users</p>
            </div>
            <div className="flex items-center gap-4">
              <Switch 
                checked={localValues['welcome_bonus_enabled'] === true}
                onCheckedChange={(checked) => {
                  setLocalValues(prev => ({ ...prev, welcome_bonus_enabled: checked }));
                  updateMutation.mutate({ key: 'welcome_bonus_enabled', value: checked });
                }}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Referee Amount (Points)</Label>
              <div className="flex gap-2">
                <Input 
                  type="number"
                  value={localValues['welcome_bonus_amount_referee'] || 0}
                  onChange={(e) => setLocalValues(prev => ({ ...prev, welcome_bonus_amount_referee: parseInt(e.target.value) }))}
                  className="rounded-xl font-bold"
                />
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="rounded-xl flex-shrink-0"
                  onClick={() => handleSave('welcome_bonus_amount_referee')}
                  disabled={updateMutation.isPending}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Referrer Amount (Points)</Label>
              <div className="flex gap-2">
                <Input 
                  type="number"
                  value={localValues['welcome_bonus_amount_referrer'] || 0}
                  onChange={(e) => setLocalValues(prev => ({ ...prev, welcome_bonus_amount_referrer: parseInt(e.target.value) }))}
                  className="rounded-xl font-bold"
                />
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="rounded-xl flex-shrink-0"
                  onClick={() => handleSave('welcome_bonus_amount_referrer')}
                  disabled={updateMutation.isPending}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 rounded-2xl bg-accent/5 border border-border/50">
            <Label className="text-sm font-black uppercase tracking-wider block mb-2">Required Social Profiles</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['twitter', 'telegram', 'instagram', 'facebook'].map(social => (
                <div key={social} className="flex items-center gap-2">
                  <Switch 
                    id={`social-${social}`}
                    checked={Array.isArray(localValues['welcome_bonus_required_socials']) && localValues['welcome_bonus_required_socials'].includes(social)}
                    onCheckedChange={(checked) => {
                      const current = Array.isArray(localValues['welcome_bonus_required_socials']) ? [...localValues['welcome_bonus_required_socials']] : [];
                      let next;
                      if (checked) {
                        next = [...new Set([...current, social])];
                      } else {
                        next = current.filter(s => s !== social);
                      }
                      setLocalValues(prev => ({ ...prev, welcome_bonus_required_socials: next }));
                      updateMutation.mutate({ key: 'welcome_bonus_required_socials', value: next });
                    }}
                  />
                  <Label htmlFor={`social-${social}`} className="text-xs font-bold capitalize cursor-pointer">{social}</Label>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium italic">Users must complete these social handles in their profile before they can claim the bonus.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
