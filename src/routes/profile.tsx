import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Mail, Calendar, Coins, Share2, Award, Shield, Settings as SettingsIcon, Camera, Loader2, Check, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/auth" });
  },
  component: ProfilePage,
});

function ProfilePage() {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      return data;
    },
  });

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async (updates: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile.mutateAsync({ avatar_url: data.publicUrl });
    } catch (error: any) {
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    
    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      
      toast.success("Password updated successfully!");
      setNewPassword("");
      setCurrentPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const { data: referralCount } = useQuery({
    queryKey: ["referralCount"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("referred_by", user.id);
      return count || 0;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent/5 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <Card className="border-none shadow-xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary to-primary/60" />
          <CardContent className="relative pt-0 pb-8 px-6 md:px-10">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12">
              <Avatar className="h-32 w-32 border-4 border-background shadow-2xl">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-black">
                  {profile?.full_name?.[0] || profile?.username?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1 mb-2">
                <h1 className="text-3xl font-black text-foreground">{profile?.full_name || "New User"}</h1>
                <p className="text-primary font-bold">@{profile?.username || "username"}</p>
              </div>
              <div className="flex gap-2 mb-2">
                <Button asChild variant="outline" className="font-bold">
                  <Link to="/settings">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Coins className="h-3 w-3" />
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-primary">{(profile?.points_balance || 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Share2 className="h-3 w-3" />
                Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground">{referralCount}</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Award className="h-3 w-3" />
                Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground">{Math.floor((profile?.points_balance || 0) / 1000) + 1}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="border-none shadow-md">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-xl font-black uppercase">Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Full Name</p>
                  <p className="font-bold">{profile?.full_name || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Email Address</p>
                  <p className="font-bold">{profile?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Joined On</p>
                  <p className="font-bold">{new Date(profile?.created_at || "").toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-primary/10 to-transparent border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-xl font-black uppercase">Referral Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-background/50 rounded-xl border border-border/50">
                <span className="text-sm font-bold text-muted-foreground">Clicks</span>
                <span className="text-xl font-black">{profile?.referral_clicks || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background/50 rounded-xl border border-border/50">
                <span className="text-sm font-bold text-muted-foreground">Signups</span>
                <span className="text-xl font-black">{referralCount}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background/50 rounded-xl border border-border/50">
                <span className="text-sm font-bold text-muted-foreground">Bonus Points</span>
                <span className="text-xl font-black text-primary">{(referralCount || 0) * 50}</span>
              </div>
              <Button asChild className="w-full font-black uppercase mt-2">
                <Link to="/refer">View Referral Details</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
