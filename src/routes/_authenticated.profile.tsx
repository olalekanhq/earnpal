import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Mail, Calendar, Coins, Share2, Award, Shield, Settings as SettingsIcon, Camera, Loader2, Check, Lock, Gift, ArrowRight, Edit3, Eye, EyeOff, Globe, X, History as HistoryIcon, LayoutDashboard } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ImageCropper } from "@/components/ImageCropper";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    title: "My Identity & Account Details | Earn Pal",
    meta: [
      { name: "description", content: "View and manage your Earn Pal public identity, social handles, and personal reward milestones." },
      { property: "og:title", content: "My Profile | Earn Pal" },
      { property: "og:description", content: "Check your earning stats, social connections, and profile details." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://earnpal.lovable.app/logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [countryCode, setCountryCode] = useState("+234");
  const [phoneBody, setPhoneBody] = useState("");
  const [twitter, setTwitter] = useState("");
  const [facebook, setFacebook] = useState("");
  const [telegram, setTelegram] = useState("");
  const [instagram, setInstagram] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      return data;
    },
  });

  const resetForm = () => {
    if (profile?.full_name) setFullName(profile.full_name);
    if (profile?.username) setUsername(profile.username);
    if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
    if (profile?.twitter_handle) setTwitter(profile.twitter_handle);
    if (profile?.facebook_handle) setFacebook(profile.facebook_handle);
    if (profile?.telegram_handle) setTelegram(profile.telegram_handle);
    if (profile?.instagram_handle) setInstagram(profile.instagram_handle);
    if (profile?.phone_number) {
      const parts = profile.phone_number.split(" ");
      if (parts.length >= 2 && parts[0]) {
        setCountryCode(parts[0]);
        setPhoneBody(parts.slice(1).join(" "));
      } else {
        setPhoneBody(profile.phone_number);
      }
    }
  };

  useEffect(() => {
    resetForm();
  }, [profile]);

  const validateHandle = (handle: string, type: string) => {
    if (!handle) return true;
    const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;
    
    if (type === 'twitter') return /^[a-zA-Z0-9_]{1,15}$/.test(cleanHandle);
    if (type === 'telegram') return /^[a-zA-Z0-9_]{5,32}$/.test(cleanHandle);
    return true;
  };

  const updateProfile = useMutation({
    mutationFn: async (updates: any) => {
      // Frontend validation
      if (updates.twitter_handle && !validateHandle(updates.twitter_handle, 'twitter')) {
        throw new Error("Invalid Twitter handle format");
      }
      if (updates.telegram_handle && !validateHandle(updates.telegram_handle, 'telegram')) {
        throw new Error("Invalid Telegram handle format");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["social-verification"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Profile updated!");
      setIsEditing(false);
    },
    onError: (error: any) => toast.error(error.message || "Failed to update profile"),
  });

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(reader.result as string);
      setIsCropOpen(true);
    };
    reader.readAsDataURL(file);
    // Reset the input value so the same file can be selected again if needed
    event.target.value = "";
  };

  const handleAvatarUpload = async (blob: Blob) => {
    try {
      setIsCropOpen(false);
      setIsUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const filePath = `${user.id}/${Math.random()}.jpg`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, blob, {
        contentType: 'image/jpeg'
      });
      
      if (uploadError) {
        console.error("Avatar upload error details:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log("Generated avatar URL:", data.publicUrl);
      // The URL stored in the DB will be the base public URL.
      const url = data.publicUrl || "";
      setAvatarUrl(url);
      await updateProfile.mutateAsync({ avatar_url: url });

    } catch (error: any) {
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
      setCropImage(null);
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
  const { data: authInfo } = useQuery({
    queryKey: ["authInfo"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { isAdmin: false, isModerator: false, isTasker: false };
      
      const [{ data: isAdmin }, { data: isModerator }, { data: isTasker }] = await Promise.all([
        supabase.rpc("has_role", { _user_id: user.id, _role: 'admin' }),
        supabase.rpc("has_role", { _user_id: user.id, _role: 'moderator' }),
        supabase.rpc("has_role", { _user_id: user.id, _role: 'tasker' })
      ]);
      
      return { isAdmin, isModerator, isTasker };
    },
  });

  const isAdmin = authInfo?.isAdmin || false;
  const isModerator = authInfo?.isModerator || false;
  const isTasker = (authInfo?.isTasker as boolean) || false;
  const hasSpecialRole = isAdmin || isModerator || isTasker;

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 w-full">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-foreground">My Profile</h1>
        <p className="text-muted-foreground">Manage your identity and account settings.</p>
      </header>

      <div className="grid gap-8 md:grid-cols-12 items-start">
        {/* Profile Card */}
        <Card className="md:col-span-5 border-none shadow-sm overflow-hidden bg-card">
          <div className="h-24 bg-primary/10" />
          <CardContent className="relative pt-0 pb-8 px-6 text-center">
            <div className="inline-block relative -mt-12 mb-4 group">
              <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {profile?.username?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <>
                  <button 
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  >
                    {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                  </button>
                  <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} disabled={isUploading} />
                </>
              )}
            </div>
            
            <div className="space-y-1 mb-6">
              <h2 className="text-xl font-black text-foreground">{profile?.full_name || "New User"}</h2>
              <p className="text-sm font-medium text-muted-foreground">@{profile?.username ? (profile.username.charAt(0).toUpperCase() + profile.username.slice(1)) : ''}</p>
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
              onClick={() => {
                if (isEditing) {
                  resetForm();
                  setIsEditing(false);
                } else {
                  setIsEditing(true);
                }
              }}
            >
              {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Action Area */}
        <div className="md:col-span-7 space-y-6">
          {isEditing ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Card className="border-none shadow-sm bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Edit Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full-name" className="text-sm font-semibold">Full Name</Label>
                    <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-semibold">Username</Label>
                    <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar-url" className="text-sm font-semibold">Avatar Image URL</Label>
                    <div className="flex gap-4 items-start">
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <Input 
                            id="avatar-url" 
                            value={avatarUrl} 
                            onChange={(e) => setAvatarUrl(e.target.value)} 
                            className="rounded-xl h-11 flex-1" 
                            placeholder="https://example.com/photo.jpg" 
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="rounded-xl h-11"
                            onClick={() => document.getElementById('avatar-upload')?.click()}
                          >
                            <Camera className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground ml-1">Paste a link or click the camera icon to upload.</p>
                      </div>
                      
                      {avatarUrl && (
                        <div className="h-11 w-11 rounded-xl border border-border overflow-hidden bg-accent flex-shrink-0">
                          <img 
                            src={avatarUrl} 
                            alt="Preview" 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone-number" className="text-sm font-semibold">Phone Number</Label>
                    <div className="flex gap-2">
                      <Select value={countryCode} onValueChange={setCountryCode}>
                        <SelectTrigger className="w-[110px] rounded-xl h-11">
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+234">+234 (NG)</SelectItem>
                          <SelectItem value="+1">+1 (US)</SelectItem>
                          <SelectItem value="+44">+44 (UK)</SelectItem>
                          <SelectItem value="+91">+91 (IN)</SelectItem>
                          <SelectItem value="+27">+27 (ZA)</SelectItem>
                          <SelectItem value="+254">+254 (KE)</SelectItem>
                          <SelectItem value="+233">+233 (GH)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input 
                        id="phone-number" 
                        value={phoneBody} 
                        onChange={(e) => setPhoneBody(e.target.value)} 
                        className="flex-1 rounded-xl h-11" 
                        placeholder="8123456789" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      Social Handles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="twitter" className="text-xs font-semibold text-muted-foreground uppercase">Twitter / X</Label>
                        <Input 
                          id="twitter" 
                          value={twitter} 
                          onChange={(e) => setTwitter(e.target.value)} 
                          className="rounded-xl h-11" 
                          placeholder="@username" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telegram" className="text-xs font-semibold text-muted-foreground uppercase">Telegram</Label>
                        <Input 
                          id="telegram" 
                          value={telegram} 
                          onChange={(e) => setTelegram(e.target.value)} 
                          className="rounded-xl h-11" 
                          placeholder="@username" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="facebook" className="text-xs font-semibold text-muted-foreground uppercase">Facebook</Label>
                        <Input 
                          id="facebook" 
                          value={facebook} 
                          onChange={(e) => setFacebook(e.target.value)} 
                          className="rounded-xl h-11" 
                          placeholder="profile link or username" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instagram" className="text-xs font-semibold text-muted-foreground uppercase">Instagram</Label>
                        <Input 
                          id="instagram" 
                          value={instagram} 
                          onChange={(e) => setInstagram(e.target.value)} 
                          className="rounded-xl h-11" 
                          placeholder="@username" 
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      * Complete these to be eligible for referral bonuses.
                    </p>
                  </div>

                  <div className="flex gap-3 mt-2">
                    <Button 
                      variant="outline"
                      className="flex-1 rounded-xl font-bold h-11"
                      onClick={() => {
                        resetForm();
                        setIsEditing(false);
                      }}
                      disabled={updateProfile.isPending}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-[2] rounded-xl font-bold h-11" 
                      onClick={() => {
                        const combinedPhone = `${countryCode} ${phoneBody}`.trim();
                        updateProfile.mutate({ 
                          full_name: fullName, 
                          username: username,
                          avatar_url: avatarUrl,
                          phone_number: combinedPhone,
                          twitter_handle: twitter,
                          facebook_handle: facebook,
                          telegram_handle: telegram,
                          instagram_handle: instagram
                        });
                      }}
                      disabled={updateProfile.isPending || (
                        fullName === profile?.full_name && 
                        username === profile?.username &&
                        avatarUrl === (profile?.avatar_url || "") &&
                        `${countryCode} ${phoneBody}`.trim() === (profile?.phone_number || "") &&
                        twitter === (profile?.twitter_handle || "") &&
                        facebook === (profile?.facebook_handle || "") &&
                        telegram === (profile?.telegram_handle || "") &&
                        instagram === (profile?.instagram_handle || "")
                      )}
                    >
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-card">
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
                        <Input 
                          id="new-password" 
                          type={showNewPassword ? "text" : "password"} 
                          value={newPassword} 
                          onChange={(e) => setNewPassword(e.target.value)} 
                          className="pl-10 pr-10 rounded-xl h-11" 
                          placeholder="Min 6 characters" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
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
              <Card className="border-none shadow-sm bg-card p-6">
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
                        <p className="text-sm font-black text-foreground leading-tight">Ready to redeem?</p>
                        <p className="text-xs text-muted-foreground font-medium">Check available rewards</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                  </Link>

                  <Link to="/transactions" className="p-4 bg-accent/30 rounded-2xl border border-border/50 flex items-center justify-between group cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-accent p-2 rounded-xl text-foreground shadow-sm group-hover:scale-110 transition-transform">
                        <HistoryIcon className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-foreground leading-tight">Transaction History</p>
                        <p className="text-xs text-muted-foreground font-medium">Track your points and claims</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-none shadow-sm bg-card p-4 flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email</p>
                    <p className="text-sm font-semibold truncate max-w-[150px]">{profile?.email || 'N/A'}</p>
                  </div>
                </Card>
                <Card className="border-none shadow-sm bg-card p-4 flex items-center gap-4">
                  <div className="bg-purple-50 p-3 rounded-xl text-purple-600">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phone</p>
                    <p className="text-sm font-semibold">{profile?.phone_number || 'Not added'}</p>
                  </div>
                </Card>
                <Card className="border-none shadow-sm bg-card p-4 flex items-center gap-4">
                  <div className="bg-sky-50 p-3 rounded-xl text-sky-600">
                    <Share2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Twitter / X</p>
                    <p className="text-sm font-semibold">{profile?.twitter_handle || 'Not added'}</p>
                  </div>
                </Card>
                <Card className="border-none shadow-sm bg-card p-4 flex items-center gap-4">
                  <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Telegram</p>
                    <p className="text-sm font-semibold">{profile?.telegram_handle || 'Not added'}</p>
                  </div>
                </Card>
                <Card className="border-none shadow-sm bg-card p-4 flex items-center gap-4 md:col-span-2">
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