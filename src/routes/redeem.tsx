import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Gift, Coins, ShoppingBag, CreditCard, Ticket } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/redeem")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/auth" });
  },
  component: RedeemPage,
});

function RedeemPage() {
  const { data: rewards } = useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      const { data } = await supabase.from("rewards").select("*").eq("is_active", true);
      return data;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      return data;
    },
  });

  const categories = [
    { name: "All", icon: Gift },
    { name: "Gift Cards", icon: CreditCard },
    { name: "Vouchers", icon: Ticket },
    { name: "Products", icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-accent/5 pb-12">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">Redeem Rewards</h1>
            <p className="text-muted-foreground font-medium">Exchange your points for amazing rewards.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 bg-card px-6 py-3 rounded-2xl shadow-sm border border-border">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Coins className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground leading-none mb-1">Available Balance</p>
                <p className="text-2xl font-black text-foreground leading-none">{profile?.points_balance?.toLocaleString() || 0} <span className="text-xs font-bold text-primary align-top ml-1">PTS</span></p>
              </div>
            </div>
          </div>
        </div>

      <Tabs defaultValue="All" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-transparent gap-2 mb-6">
          {categories.map((cat) => (
            <TabsTrigger 
              key={cat.name} 
              value={cat.name}
              className="rounded-full border border-input data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2 px-4"
            >
              <cat.icon className="mr-2 h-4 w-4" />
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="All" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rewards?.length ? rewards.map((reward) => (
              <Card key={reward.id} className="overflow-hidden flex flex-col group">
                <div className="aspect-video bg-muted relative">
                  {reward.image_url ? (
                    <img src={reward.image_url} alt={reward.title} className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Gift className="h-12 w-12 opacity-20" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                      <Coins className="h-3 w-3 mr-1" />
                      {reward.cost_points}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>{reward.title}</CardTitle>
                  <CardDescription>{reward.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-4">
                  <Button className="w-full" disabled={(profile?.points_balance || 0) < reward.cost_points}>
                    {(profile?.points_balance || 0) < reward.cost_points ? 'Insufficient Points' : 'Redeem Now'}
                  </Button>
                </CardContent>
              </Card>
            )) : (
              <>
                <Card className="overflow-hidden flex flex-col group">
                  <div className="aspect-video bg-blue-500 relative flex items-center justify-center text-white">
                    <CreditCard className="h-16 w-16" />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-white/90 text-blue-600">
                        <Coins className="h-3 w-3 mr-1" />
                        1000
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle>$10 Amazon Gift Card</CardTitle>
                    <CardDescription>Digital gift card delivered via email.</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-4">
                    <Button className="w-full" variant="outline">Redeem Now</Button>
                  </CardContent>
                </Card>
                <Card className="overflow-hidden flex flex-col group">
                  <div className="aspect-video bg-green-500 relative flex items-center justify-center text-white">
                    <CreditCard className="h-16 w-16" />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-white/90 text-green-600">
                        <Coins className="h-3 w-3 mr-1" />
                        2500
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle>$25 Google Play Card</CardTitle>
                    <CardDescription>Great for games and apps.</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-4">
                    <Button className="w-full" variant="outline">Redeem Now</Button>
                  </CardContent>
                </Card>
                <Card className="overflow-hidden flex flex-col group">
                  <div className="aspect-video bg-red-500 relative flex items-center justify-center text-white">
                    <CreditCard className="h-16 w-16" />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-white/90 text-red-600">
                        <Coins className="h-3 w-3 mr-1" />
                        5000
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle>$50 Netflix Voucher</CardTitle>
                    <CardDescription>Enjoy 3 months of premium streaming.</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-4">
                    <Button className="w-full" variant="outline">Redeem Now</Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}