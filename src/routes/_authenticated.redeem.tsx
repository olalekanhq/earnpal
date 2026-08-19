import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Gift, Coins, ShoppingBag, CreditCard, Ticket, ArrowRight, Wallet, History } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/redeem")({
  head: () => ({
    title: "Redeem Rewards | Earn Pal",
    meta: [
      { name: "description", content: "Exchange your earned points for gift cards, vouchers, and premium products." },
      { property: "og:title", content: "Redeem Points | Earn Pal" },
      { property: "og:description", content: "Browse our marketplace and pick your favorite rewards." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `https://earnpal.lovable.app/api/public/og?title=Redeem Rewards&description=Exchange points for gift cards.` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RedeemPage,
});

function RedeemPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: rewards, isLoading } = useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      const { data } = await supabase.from("rewards").select("*").eq("is_active", true);
      return data || [];
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

  const filteredRewards = activeCategory === "All" 
    ? rewards 
    : rewards?.filter((r: any) => r.category === activeCategory);

  return (
    <div className="pb-12 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground">Redeem Rewards</h1>
          <p className="text-muted-foreground font-medium">Exchange your points for amazing gift cards and rewards.</p>
        </div>
        
        <Card className="border-none shadow-sm bg-card p-4 flex items-center gap-4 min-w-[200px]">
          <div className="bg-primary/10 p-3 rounded-2xl text-primary">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Available Balance</p>
            <p className="text-xl font-black">{profile?.points_balance?.toLocaleString() || 0} <span className="text-[10px] text-primary">PTS</span></p>
          </div>
        </Card>
      </header>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          {categories.map((cat) => (
            <Button 
              key={cat.name} 
              variant={activeCategory === cat.name ? 'default' : 'outline'} 
              className={cn(
                "rounded-xl font-bold h-10 px-6 shrink-0 transition-all",
                activeCategory === cat.name ? "shadow-md shadow-primary/20" : "bg-card border-none shadow-sm"
              )}
              onClick={() => setActiveCategory(cat.name)}
            >
              <cat.icon className={cn("mr-2 h-4 w-4", activeCategory === cat.name ? "text-primary-foreground" : "text-primary")} />
              {cat.name}
            </Button>
          ))}
        </div>
        
        <Button variant="ghost" className="rounded-xl font-bold gap-2 text-muted-foreground hover:text-primary transition-colors">
          <History className="h-4 w-4" />
          Redemption History
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRewards?.length ? filteredRewards.map((reward) => (
          <Card key={reward.id} className="group border-none shadow-sm bg-card overflow-hidden flex flex-col transition-all hover:shadow-md">
            <div className="aspect-[16/9] bg-accent/30 relative overflow-hidden">
              {reward.image_url ? (
                <img 
                  src={reward.image_url} 
                  alt={reward.title} 
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary/20">
                  <Gift className="h-12 w-12" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <Badge className="bg-card/90 backdrop-blur-sm text-foreground border-none shadow-sm font-bold rounded-lg px-2.5 py-1">
                  <Coins className="h-3 w-3 mr-1.5 text-primary inline" />
                  {reward.cost_points.toLocaleString()}
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className="bg-primary/5 text-primary border-none rounded-lg px-2 py-0.5 font-bold uppercase text-[9px]">
                  {(reward as any).category || 'Featured'}
                </Badge>
              </div>
              <CardTitle className="text-lg font-black group-hover:text-primary transition-colors">{reward.title}</CardTitle>
              <CardDescription className="text-sm font-medium line-clamp-2 mt-1">{reward.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-0 pb-6 px-6">
              <Button 
                className="w-full rounded-xl font-bold h-11 transition-all"
                disabled={(profile?.points_balance || 0) < reward.cost_points}
                variant={(profile?.points_balance || 0) < reward.cost_points ? "outline" : "default"}
              >
                {(profile?.points_balance || 0) < reward.cost_points ? 'Need more points' : 'Redeem Now'}
              </Button>
            </CardContent>
          </Card>
        )) : !isLoading && (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="bg-card w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-sm text-primary/20">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-foreground">No rewards found</p>
              <p className="text-sm text-muted-foreground font-medium">Try another category or check back later.</p>
            </div>
          </div>
        )}

        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-none shadow-sm bg-card h-[320px] animate-pulse">
            <div className="aspect-[16/9] bg-muted/50 w-full" />
            <div className="p-6 space-y-4">
              <div className="h-4 w-16 bg-muted rounded" />
              <div className="h-6 w-3/4 bg-muted rounded" />
              <div className="h-10 w-full bg-muted rounded mt-auto" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}