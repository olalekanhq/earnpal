import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Coins, Loader2, Mail, Lock, User, CheckCircle2, ArrowLeft, Eye, EyeOff, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { z } from "zod";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

export const Route = createFileRoute("/auth")({
  head: () => ({
    title: "Secure Access | Earn Pal",
    meta: [
      { name: "description", content: "Sign in or create your Earn Pal account to start earning rewards today." },
      { property: "og:title", content: "Secure Access | Earn Pal" },
      { property: "og:description", content: "Join the Earn Pal community and turn your time into rewards." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `https://earnpal.lovable.app/api/public/og?title=Secure Access&description=Sign in to start earning.` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search) => z.object({
    redirect: z.string().optional(),
    mode: z.enum(["login", "signup"]).optional(),
    ref: z.string().optional(),
  }).parse(search),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const [activeTab, setActiveTab] = useState<"login" | "signup">(search.mode || "login");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState(""); // Can be email or username
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [referralCode, setReferralCode] = useState(search.ref || "");
  const [referralStatus, setReferralStatus] = useState<{ loading: boolean; owner: string | null; error: boolean; message: string | null }>({ 
    loading: false, 
    owner: null, 
    error: false,
    message: null
  });
  const [showVerification, setShowVerification] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (search.mode) {
      setActiveTab(search.mode);
    }
    if (search.ref) {
      setReferralCode(search.ref);
      validateReferral(search.ref);
    }
  }, [search.mode, search.ref]);

  const validateReferral = async (code: string) => {
    console.log("VALIDATING REFERRAL:", code);
    if (!code || code.trim().length < 3) {
      setReferralStatus({ loading: false, owner: null, error: false, message: null });
      return;
    }
    
    setReferralStatus(prev => ({ ...prev, loading: true, error: false, message: null }));
    try {
      const rpcArgs: any = { _code: code.trim() };
      const { data, error: rpcError } = await supabase.rpc('check_referral_code', rpcArgs);
      
      if (rpcError) {
        console.error("RPC ERROR:", rpcError);
        throw rpcError;
      }
      
      const result = Array.isArray(data) ? data[0] : data;
      console.log("RPC RESULT:", result);
      
      if (result && result.is_valid) {
        setReferralStatus({ 
          loading: false, 
          owner: result.username, 
          error: false, 
          message: result.message || `Referrer found: ${result.username}` 
        });
      } else {
        setReferralStatus({ 
          loading: false, 
          owner: null, 
          error: true, 
          message: result?.message || "This referral code does not exist or is invalid." 
        });
      }
    } catch (err) {
      console.error("Referral validation error:", err);
      setReferralStatus({ 
        loading: false, 
        owner: null, 
        error: true, 
        message: "Unable to validate referral code. Please try again." 
      });
    }
  };

  const handleReferralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
    setReferralCode(val);
  };

  const debouncedValidate = useDebouncedCallback((code: string) => {
    validateReferral(code);
  }, 500);

  useEffect(() => {
    if (referralCode.trim().length >= 3) {
      debouncedValidate(referralCode);
    } else if (referralCode.trim().length === 0) {
      setReferralStatus({ loading: false, owner: null, error: false, message: null });
    }
  }, [referralCode, debouncedValidate]);


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
      let loginEmail = identifier.trim();
      
      if (!loginEmail.includes("@")) {
        const { data, error: rpcError } = await supabase.rpc('lookup_login_email', {
          _username: loginEmail
        });

        if (rpcError || !data) {
          throw new Error("Incorrect username/email or password.");
        }
        loginEmail = data;
      }

      // The session is stored in localStorage and persists across refreshes and
      // browser restarts until the user signs out manually.
      localStorage.removeItem('earn-pal-session-transient');
      sessionStorage.removeItem('earn-pal-session-active');


      const { error } = await supabase.auth.signInWithPassword({ 
        email: loginEmail, 
        password,
      });

      if (error) throw error;
      
      navigate({ to: (search.redirect as any) || "/dashboard" });
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
            referral_code_used: referralCode || null
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
      // Use any cast to bypass type errors until types are regenerated
      (supabase.from('analytics_events' as any) as any).insert({ 
        event_name: 'signup_complete', 
        metadata: { email, username } 
      }).then();
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
    const input = resetEmail.trim();
    if (!input) {
      setError("Please enter your email or username.");
      return;
    }
    setError("");
    setResetLoading(true);
    try {
      let targetEmail = input;

      if (!targetEmail.includes("@")) {
        const { data } = await supabase.rpc('lookup_login_email', {
          _username: targetEmail
        });
        targetEmail = (data as string | null) ?? "";
      }

      if (targetEmail) {
        const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
          redirectTo: window.location.origin + "/auth",
        });
        if (error) throw error;
      }

      setResetSent(true);
      toast.success("If an account exists, a reset link has been sent.");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setResetLoading(false);
    }
  };


  if (showVerification) {
    return (
      <div className="flex min-h-[100dvh] md:h-screen items-center justify-center bg-accent/5 p-4 overflow-hidden">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary my-auto">
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
    <div className="flex min-h-[100dvh] md:h-screen w-full items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
      
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center justify-items-center relative z-10">
        {/* Auth Card Side */}
        <div className="flex justify-center order-2 lg:order-1">
          <Card className="w-full max-w-md shadow-2xl shadow-primary/5 border-none bg-card p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex flex-col max-h-[85dvh]">
            <CardHeader className="space-y-1 text-center pb-4 p-0 flex-shrink-0">
              <div className="flex justify-center mb-4 md:mb-6 lg:hidden">
                <div className="flex items-center gap-2 font-black text-2xl md:text-3xl text-primary tracking-tighter">
                  <Coins className="h-7 w-7" />
                  <span>EARN PAL</span>
                </div>
              </div>
              <CardTitle className="text-2xl font-black tracking-tight text-foreground">
                {showReset 
                  ? "Reset Password" 
                  : activeTab === "login" 
                    ? "Welcome back" 
                    : "Create Account"}
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium">
                {showReset 
                  ? "Enter your email to receive a reset link" 
                  : activeTab === "login"
                    ? "Access your dashboard to start earning rewards"
                    : "Join the Earn Pal community and start earning 75 bonus points today"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 overflow-hidden flex-grow p-0">
          {!showReset && (
            <>
              <Button variant="outline" onClick={handleGoogleLogin} className="w-full font-bold h-12 rounded-xl border-border/50 bg-accent/5 hover:bg-accent/10 transition-all">
                <img src="https://www.google.com/favicon.ico" className="mr-3 h-4 w-4" alt="Google" />
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
                <Label htmlFor="reset-email">Email or Username</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    className="pl-9"
                    id="reset-email" 
                    type="text" 
                    autoCapitalize="none"
                    autoCorrect="off"
                    placeholder="email or username" 
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required 
                  />
                </div>

              </div>
              <Button type="submit" className="w-full h-12 rounded-xl font-bold uppercase shadow-md shadow-primary/10" disabled={resetLoading}>
                {resetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {resetSent ? "Resend Link" : "Send Reset Link"}
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
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full flex flex-col h-full overflow-hidden">
              <div className="px-1 flex-shrink-0">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl h-12">
                  <TabsTrigger value="login" className="font-bold rounded-lg data-[state=active]:shadow-sm">Log in</TabsTrigger>
                  <TabsTrigger value="signup" className="font-bold rounded-lg data-[state=active]:shadow-sm">Sign up</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="login">
                <form onSubmit={handleEmailLogin} className="space-y-3 pt-4">
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
                          setResetEmail(identifier.trim());
                          setError("");
                        }}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        className="pl-9 pr-10"
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 py-1">
                    <Checkbox 
                      id="rememberMe" 
                      checked={rememberMe} 
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <Label 
                      htmlFor="rememberMe" 
                      className="text-sm font-medium leading-none cursor-pointer text-muted-foreground"
                    >
                      Remember me
                    </Label>
                  </div>
                   <Button type="submit" className="w-full h-11 md:h-12 rounded-xl font-bold shadow-md shadow-primary/10 mt-2" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign in
                  </Button>
                  <div className="text-center pt-2">
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <button 
                        type="button" 
                        onClick={() => setActiveTab("signup")}
                        className="text-primary font-bold hover:underline"
                      >
                        Sign up
                      </button>
                    </p>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="signup" className="flex-grow overflow-y-auto px-1 pr-2 custom-scrollbar">
                <form onSubmit={handleEmailSignUp} className="space-y-3 pt-4 pb-2">
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
                        className="pl-9 pr-10"
                        id="signup-password" 
                        type={showSignupPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="referral-code">Referral Code (Optional)</Label>
                    <div className="relative">
                      <Share2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        className={cn(
                          "pl-9",
                          referralStatus.owner && "border-green-500/50 ring-green-500/20",
                          referralStatus.error && "border-destructive/50 ring-destructive/20"
                        )}
                        id="referral-code" 
                        placeholder="e.g. 5a2b3c"
                        value={referralCode}
                        onChange={handleReferralChange}
                      />
                      {referralStatus.loading && (
                        <div className="absolute right-3 top-3">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                      {referralStatus.owner && (
                        <div className="absolute right-3 top-3">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </div>
                     {referralStatus.message && (
                       <p 
                         id="referral-status-msg"
                         className={cn(
                           "text-[10px] font-black uppercase tracking-widest mt-1",
                           referralStatus.error ? "text-destructive" : "text-green-600"
                         )}
                       >
                         {referralStatus.error ? "✕ " : "✓ "}{referralStatus.message}
                       </p>
                     )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl font-bold shadow-md shadow-primary/10 mt-4" 
                    disabled={loading || referralStatus.error}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create account
                  </Button>
                  <div className="text-center pt-2">
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <button 
                        type="button" 
                        onClick={() => setActiveTab("login")}
                        className="text-primary font-bold hover:underline"
                      >
                        Log in
                      </button>
                    </p>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
          </Card>
        </div>

        {/* Mockup Image Side (Desktop Only) */}
        <div className="hidden lg:flex flex-col justify-center animate-in fade-in slide-in-from-right duration-1000 order-1 lg:order-2">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-violet-600/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-card rounded-[2.5rem] border border-border/50 overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000" 
                alt="Earn Pal Dashboard Preview" 
                className="w-full h-auto object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Coins className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-3xl font-black tracking-tight text-white uppercase drop-shadow-sm">Earn Pal</h3>
                </div>
                <p className="text-xl font-bold text-white/90 leading-relaxed max-w-md drop-shadow-md">
                  Join thousands of users earning daily rewards through simple tasks and referrals.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { label: "Daily Tasks", value: "20+ active" },
              { label: "Total Users", value: "50k+" },
              { label: "Paid Out", value: "$250k+" }
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-2xl bg-card/50 border border-border/30 backdrop-blur-sm">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}