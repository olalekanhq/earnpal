import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Coins, Loader2, Mail, Lock, User, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/auth")({
  validateSearch: (search) => z.object({
    redirect: z.string().optional(),
  }).parse(search),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState(""); // Can be email or username
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setReferralCode(ref);
  }, []);

  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const validate = (type: 'login' | 'signup') => {
    if (type === 'login') {
      if (!identifier) {
        setError("Please enter your email or username.");
        return false;
      }
    } else {
      if (!email.includes("@")) {
        setError("Please enter a valid email address.");
        return false;
      }
      if (username.length < 3) {
        setError("Username must be at least 3 characters.");
        return false;
      }
      if (!fullName) {
        setError("Please enter your full name.");
        return false;
      }
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    setError("");
    return true;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate('login')) return;
    setLoading(true);
    try {
      let loginEmail = identifier;
      
      if (!identifier.includes("@")) {
        const { data, error: rpcError } = await supabase.rpc('get_user_email_by_username', {
          _username: identifier
        });

        if (rpcError || !data) {
          throw new Error("Could not find account with that username.");
        }
        loginEmail = data;
      }

      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
      if (error) throw error;
      navigate({ to: search.redirect || "/dashboard" });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate('signup')) return;
    setLoading(true);
    try {
      const options: any = { 
        email, 
        password,
        options: {
          data: {
            username,
            full_name: fullName,
            referred_by: referralCode || null
          }
        }
      };

      const { error } = await supabase.auth.signUp(options);
      if (error) throw error;
      
      setShowVerification(true);
      toast.success("Verification code sent to your email!");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    setIsVerifying(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });
      if (error) throw error;
      
      toast.success("Account verified successfully!");
      navigate({ to: "/dashboard" });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handleResendOtp = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (error) throw error;
      toast.success("Verification code resent!");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setResending(false);
    }
  };

  const handleGoogleLogin = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth/callback",
    });
    if (result.error) {
      setError(result.error.message);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + "/auth",
      });
      if (error) throw error;
      setResetSent(true);
      toast.success("Reset link sent to your email!");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setResetLoading(false);
    }
  };

  if (showVerification) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-accent/5 p-4">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <Mail className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black uppercase">Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a 6-digit verification code to <span className="font-bold text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input 
                  id="otp" 
                  placeholder="000000" 
                  className="text-center text-2xl tracking-[0.5em] font-black h-14"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required 
                />
              </div>
              <Button type="submit" className="w-full h-12 font-black uppercase" disabled={isVerifying}>
                {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Account
              </Button>
              <div className="flex flex-col gap-2 text-center">
                <button 
                  type="button"
                  className="text-sm font-bold text-primary hover:underline disabled:opacity-50"
                  onClick={handleResendOtp}
                  disabled={resending}
                >
                  {resending ? "Resending..." : "Resend Code"}
                </button>
                <button 
                  type="button"
                  className="text-sm font-bold text-muted-foreground hover:underline"
                  onClick={() => setShowVerification(false)}
                >
                  Back to Sign Up
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9FB] p-4 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      <Card className="w-full max-w-md shadow-2xl shadow-primary/5 border-none relative z-10 bg-white p-8 md:p-10 rounded-[2.5rem]">
        <CardHeader className="space-y-2 text-center pb-8 p-0">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 font-black text-3xl text-primary tracking-tighter">
              <Coins className="h-7 w-7" />
              <span>EARN PAL</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-black tracking-tight text-foreground">
            {showReset ? "Reset Password" : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-muted-foreground font-medium">
            {showReset 
              ? "Enter your email to receive a reset link" 
              : "Access your dashboard to start earning rewards"}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!showReset && (
            <>
              <Button variant="outline" onClick={handleGoogleLogin} className="w-full font-bold h-11">
                <img src="https://www.google.com/favicon.ico" className="mr-2 h-4 w-4" alt="Google" />
                Continue with Google
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground font-bold">OR</span>
                </div>
              </div>
            </>
          )}
          
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
              {error}
            </div>
          )}

          {showReset ? (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Reset Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    className="pl-9"
                    id="reset-email" 
                    type="email" 
                    placeholder="m@example.com" 
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl font-bold uppercase shadow-lg shadow-primary/10" disabled={resetLoading}>
                {resetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {resetSent ? "RESEND LINK" : "SEND RESET LINK"}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full font-bold rounded-xl text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setShowReset(false);
                  setError("");
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                BACK TO LOGIN
              </Button>
            </form>
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="login" className="font-bold rounded-lg data-[state=active]:shadow-sm">Log in</TabsTrigger>
                <TabsTrigger value="signup" className="font-bold rounded-lg data-[state=active]:shadow-sm">Sign up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleEmailLogin} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="identifier">Email or Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        className="pl-9"
                        id="identifier" 
                        placeholder="email or username" 
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button 
                        type="button"
                        className="text-sm font-bold text-primary hover:underline"
                        onClick={() => {
                          setShowReset(true);
                          setResetEmail(identifier.includes("@") ? identifier : "");
                          setError("");
                        }}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        className="pl-9"
                        id="password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl font-bold uppercase shadow-lg shadow-primary/10 mt-2" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Log in
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={handleEmailSignUp} className="space-y-3 pt-4">
                  <div className="space-y-1">
                    <Label htmlFor="full-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        className="pl-9"
                        id="full-name" 
                        placeholder="John Doe" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="signup-username">Username</Label>
                    <div className="relative">
                      <CheckCircle2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        className="pl-9"
                        id="signup-username" 
                        placeholder="johndoe123" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        className="pl-9"
                        id="signup-email" 
                        type="email" 
                        placeholder="m@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        className="pl-9"
                        id="signup-password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="referral-code">Referral Code (Optional)</Label>
                    <Input 
                      id="referral-code" 
                      placeholder="e.g. 5a2b3c"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl font-bold uppercase shadow-lg shadow-primary/10 mt-4" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}