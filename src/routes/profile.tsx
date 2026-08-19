import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Mail, Calendar, Coins, Share2, Award, Shield, Settings as SettingsIcon, Camera, Loader2, Check, Lock, Gift, ArrowRight, Edit3 } from "lucide-react";
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
    if (!session) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const { data: { session: retrySession } } = await supabase.auth.getSession();
      if (!retrySession) throw redirect({ to: "/auth", search: { redirect: window.location.pathname } });
    }
  },
  component: ProfilePage,
});

function ProfilePage() {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated!");
      setIsEditing(false);
    },
    onError: (error: any) => toast.error(error.message || "Failed to update profile"),
  });

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<string | undefined> => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      setIsUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile.mutateAsync({ avatar_url: data.publicUrl });
      return data.publicUrl;
    } catch (error: any) {
      toast.error(error.message || "Failed to upload avatar");
      return undefined;
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!newPassword) {
      toast.error("Enter a new password");
      return;
    }
    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated!");
      setNewPassword("");
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
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("referred_by", user.id);
      return count || 0;
    },
  });

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="pb-12 px-4 md:px-8 max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-foreground">My Profile</h1>
        <p className="text-muted-foreground">Manage your identity and account settings.</p>
      </header>

      <div className="grid gap-8 md:grid-cols-12 items-start">
        {/* Profile Card */}
        <Card className="md:col-span-5 border-none shadow-sm overflow-hidden bg-white">
          <div className="h-24 bg-primary/10" />
          <CardContent className="relative pt-0 pb-8 px-6 text-center">
            <div className="inline-block relative -mt-12 mb-4 group">
              <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {profile?.username?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <button 
                onClick={() => document.getElementById('avatar-upload')?.click()}
                className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                <Camera className="h-5 w-5" />
              </button>
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploading} />
            </div>
            
            <div className="space-y-1 mb-6">
              <h2 className="text-xl font-black text-foreground">{profile?.full_name || "New User"}</h2>
              <p className="text-sm font-medium text-muted-foreground">@{profile?.username}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50 mb-6">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Points</p>
                <p className="font-black text-primary">{profile?.points_balance?.toLocaleString() || 0}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Referrals</p>
                <p className="font-black">{referralCount}</p>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full rounded-xl font-bold gap-2"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="h-4 w-4" />
              {isEditing ? "View Profile" : "Edit Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Action Area */}
        <div className="md:col-span-7 space-y-6">
          {isEditing ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Edit Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full-name" className="text-sm font-semibold">Full Name</Label>
                    <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-xl h-11" />
                  </div>
                  <Button 
                    className="w-full rounded-xl font-bold h-11 mt-2" 
                    onClick={() => updateProfile.mutate({ full_name: fullName })}
                    disabled={updateProfile.isPending || fullName === profile?.full_name}
                  >
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Security</CardTitle>
                  <CardDescription>Update your password to keep your account safe.</CardDescription>
                </CardHeader>
                <form onSubmit={handlePasswordChange}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password text-sm font-semibold">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-10 rounded-xl h-11" placeholder="Min 6 characters" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full rounded-xl font-bold h-11 mt-2" disabled={isChangingPassword}>
                      Update Password
                    </Button>
                  </CardContent>
                </form>
              </Card>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Card className="border-none shadow-sm bg-white p-6">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-black text-lg">Earning Summary</h3>
                  <div className="bg-primary/10 px-3 py-1 rounded-full text-xs font-bold text-primary">LVL {Math.floor((profile?.points_balance || 0) / 1000) + 1}</div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-muted-foreground">Progress to Next Reward</span>
                      <span>{(profile?.points_balance || 0) % 1000} / 1000</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${((profile?.points_balance || 0) % 1000) / 10}%` }}
                      />
                    </div>
                  </div>

                  <Link to="/redeem" className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between group cursor-pointer hover:bg-primary/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary p-2 rounded-xl text-primary-foreground shadow-sm group-hover:scale-110 transition-transform">
                        <Gift className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-foreground leading-tight">Ready to redeem?</p>
                        <p className="text-xs text-muted-foreground font-medium">Check available rewards</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-none shadow-sm bg-white p-4 flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email</p>
                    <p className="text-sm font-semibold truncate max-w-[150px]">{profile?.email || 'N/A'}</p>
                  </div>
                </Card>
                <Card className="border-none shadow-sm bg-white p-4 flex items-center gap-4">
                  <div className="bg-green-50 p-3 rounded-xl text-green-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Joined</p>
                    <p className="text-sm font-semibold">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}