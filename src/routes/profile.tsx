import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Mail, Calendar, Coins, Share2, Award, Shield, Settings as SettingsIcon, Camera, Loader2, Check, Lock, Gift, ArrowRight } from "lucide-react";
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

  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="min-h-screen bg-accent/5 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <Card className="border-none shadow-xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary to-primary/60" />
          <CardContent className="relative pt-0 pb-8 px-6 md:px-10">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12">
              <div className="relative inline-block">
                <Avatar className="h-32 w-32 border-4 border-background shadow-2xl">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-black">
                    {profile?.full_name?.[0] || profile?.username?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 space-y-1 mb-2">
                <h1 className="text-3xl font-black text-foreground">{profile?.full_name || "New User"}</h1>
                <p className="text-primary font-bold">@{profile?.username || "username"}</p>
              </div>
              <div className="flex gap-2 mb-2">
                <Button 
                  variant="outline" 
                  className="font-bold"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  {isEditing ? "View Profile" : "Edit Profile"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isEditing ? (
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-none shadow-md">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="text-xl font-black uppercase">Edit Profile Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name" className="font-bold">Full Name</Label>
                  <Input 
                    id="full-name" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-muted-foreground">Username</Label>
                  <div className="p-2 bg-muted rounded-md text-sm font-medium">@{profile?.username}</div>
                </div>
                <div className="space-y-2">
                   <Label className="font-bold">Profile Picture</Label>
                   <div className="flex items-center gap-4">
                     <Button variant="secondary" onClick={() => document.getElementById('avatar-upload')?.click()}>
                        <Camera className="mr-2 h-4 w-4" /> Change Image
                     </Button>
                     <input 
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={isUploading}
                      />
                   </div>
                </div>
                <Button 
                  onClick={() => updateProfile.mutate({ full_name: fullName })}
                  disabled={updateProfile.isPending || fullName === profile?.full_name}
                  className="w-full font-black uppercase shadow-lg shadow-primary/20"
                >
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="text-xl font-black uppercase">Security</CardTitle>
              </CardHeader>
              <form onSubmit={handlePasswordChange}>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="new-password"
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 font-medium"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full font-black uppercase shadow-lg shadow-primary/20"
                  >
                    {isChangingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
             <Card className="border-none shadow-md">
               <CardHeader className="pb-2"><CardTitle className="text-xs font-black uppercase text-muted-foreground">Points</CardTitle></CardHeader>
               <CardContent><div className="text-3xl font-black text-primary">{(profile?.points_balance || 0).toLocaleString()}</div></CardContent>
             </Card>
             <Card className="border-none shadow-md">
               <CardHeader className="pb-2"><CardTitle className="text-xs font-black uppercase text-muted-foreground">Referrals</CardTitle></CardHeader>
               <CardContent><div className="text-3xl font-black">{referralCount}</div></CardContent>
             </Card>
             <Card className="border-none shadow-md">
               <CardHeader className="pb-2"><CardTitle className="text-xs font-black uppercase text-muted-foreground">Level</CardTitle></CardHeader>
               <CardContent><div className="text-3xl font-black">{Math.floor((profile?.points_balance || 0) / 1000) + 1}</div></CardContent>
             </Card>
          </div>
        )}
      </div>
    </div>
  );
}
