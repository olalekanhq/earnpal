import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useCallback } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Coins, Loader2, Mail, Lock, User, CheckCircle2, ArrowLeft, Eye, EyeOff, Share2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { z } from "zod";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

export const Route = createFileRoute("/auth")({
  head: () => ({
    title: "Secure Login & Registration | Earn Pal",
    meta: [
      { name: "description", content: "Access your Earn Pal account or sign up to start earning rewards. Secure login for the most trusted points-earning community." },
      { property: "og:title", content: "Join Earn Pal | Secure Access" },
      { property: "og:description", content: "Sign in to manage your rewards or create a new account and get a 50-point welcome bonus with a referral code!" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://earnpal.lovable.app/logo.png" },
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
    if (search.mode && search.mode !== activeTab) {
      setActiveTab(search.mode);
    }
  }, [search.mode]);

  useEffect(() => {
    if (search.ref) {
      setReferralCode(search.ref);
      validateReferral(search.ref);
    }
  }, [search.ref]);

  const validateReferral = async (code: string) => {
    if (!code || code.trim().length < 3) {
      setReferralStatus({ loading: false, owner: null, error: false, message: null });
      return;
    }
    
    setReferralStatus(prev => ({ ...prev, loading: true, error: false, message: null }));
    try {
      const { data, error: rpcError } = await supabase.rpc('check_referral_code', { _code: code.trim() });
      
      if (rpcError) throw rpcError;
      
      const result = Array.isArray(data) ? data[0] : data;
      
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
    
    // Manual debounce using a simple ref-like approach via window for stability in this env
    const timeoutKey = '_auth_ref_timeout';
    if ((window as any)[timeoutKey]) clearTimeout((window as any)[timeoutKey]);
    (window as any)[timeoutKey] = setTimeout(() => {
      validateReferral(val);
    }, 500);
  };

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
            referral_code_used: referralCode || null,
            fingerprint: (window as any)._ep_fingerprint || null,
            ip_address: 'client_side_placeholder' // IP is usually handled by Supabase Auth metadata or server-side detection
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



  const shellClass =
    "auth-shell relative min-h-screen w-full px-4 py-2 flex flex-col items-center justify-center bg-background text-foreground";

  const Brand = () => (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="auth-mark flex size-10 items-center justify-center rounded-2xl">
        <img src="/logo.png" alt="Earn Pal" className="size-6 object-contain" />
      </div>
    </div>
  );

  const BackLink = () => (
    <button
      type="button"
      onClick={() => navigate({ to: "/" })}
      className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to home
    </button>
  );

  if (showVerification) {
    return (
      <div className={shellClass}>
        <div className="w-full max-w-md">
          <BackLink />
          <div className="auth-card rounded-[2rem] bg-card p-5 shadow-2xl sm:px-7 sm:py-6">
            <Brand />
            <h1 className="mt-3 text-center text-2xl font-black tracking-tight text-foreground">Verify email</h1>
            <p className="mt-1.5 text-center text-base text-muted-foreground">
              We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>
            </p>

            <form onSubmit={handleVerifyOtp} className="mt-4 space-y-3">
              {error && (
                <div className="rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">{error}</div>
              )}
              <Input
                id="otp"
                inputMode="numeric"
                placeholder="000000"
                className="h-12 rounded-2xl text-center text-xl font-black tracking-[0.5em]"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
              />
              <Button type="submit" className="h-12 w-full rounded-full text-base font-semibold" disabled={isVerifying}>
                {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify account
              </Button>
              <div className="flex flex-col items-center gap-2 text-sm">
                <button
                  type="button"
                  className="font-semibold text-primary hover:underline disabled:opacity-50"
                  onClick={handleResendOtp}
                  disabled={resending}
                >
                  {resending ? "Resending..." : "Resend code"}
                </button>
                <button
                  type="button"
                  className="font-medium text-muted-foreground hover:underline"
                  onClick={() => setShowVerification(false)}
                >
                  Back to sign up
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const fieldLabel = "text-sm font-semibold text-foreground";
  const fieldInput = "auth-input h-11 rounded-2xl border-border/70 bg-background px-4 text-base shadow-sm";

  return (
    <div className={cn(shellClass, "px-4 sm:px-6")}>
      <div className="w-full max-w-[92%] sm:max-w-md">
        <div className="auth-card rounded-[2rem] bg-card p-5 shadow-2xl sm:px-7 sm:py-6">
          <Brand />

          <h1 className="mt-3 text-center text-2xl font-black tracking-tight text-foreground">
            {showReset ? "Reset password" : activeTab === "login" ? "Welcome" : "Create account"}
          </h1>
          <p className="mx-auto mt-1.5 max-w-xs text-center text-base leading-snug text-muted-foreground">
            {showReset
              ? "Enter your email or username and we'll send you a reset link."
              : activeTab === "login"
                ? "Sign in to track your points and rewards. Browsing needs no account."
                : "Join Earn Pal and start earning points from simple tasks today."}
          </p>

          {!showReset && (
            <>
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                className="mt-4 h-11 w-full rounded-full border-border/70 bg-background text-base font-semibold shadow-sm hover:bg-muted/50"
              >
                <img src="https://www.google.com/favicon.ico" className="mr-3 h-4 w-4" alt="" />
                Continue with Google
              </Button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/70" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-3 text-xs text-muted-foreground uppercase tracking-wider font-semibold">or email</span>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="mb-3 rounded-xl bg-destructive/10 p-2.5 text-sm font-medium text-destructive">{error}</div>
          )}

          {showReset ? (
            <form onSubmit={handlePasswordReset} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className={fieldLabel}>Email or username</Label>
                <Input
                  id="reset-email"
                  type="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  className={fieldInput}
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="h-11 w-full rounded-full text-base font-semibold" disabled={resetLoading}>
                {resetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {resetSent ? "Resend link" : "Send reset link"}
              </Button>
              <button
                type="button"
                className="w-full text-center text-sm font-semibold text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setShowReset(false);
                  setError("");
                }}
              >
                Back to sign in
              </button>
            </form>
          ) : (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid h-11 w-full grid-cols-2 rounded-full bg-muted/70 p-1">
                <TabsTrigger
                  value="login"
                  className="rounded-full text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Sign in
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-full text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Sign up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-4">
                <form onSubmit={handleEmailLogin} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="identifier" className={fieldLabel}>Email</Label>
                    <Input
                      id="identifier"
                      className={fieldInput}
                      autoCapitalize="none"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className={fieldLabel}>Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className={cn(fieldInput, "pr-12")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="rememberMe"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                      />
                      <Label htmlFor="rememberMe" className="cursor-pointer text-sm font-medium text-muted-foreground">
                        Remember me
                      </Label>
                    </div>
                    <button
                      type="button"
                      className="text-sm font-semibold text-primary hover:underline"
                      onClick={() => {
                        setShowReset(true);
                        setResetEmail(identifier.trim());
                        setError("");
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button type="submit" className="h-11 w-full rounded-full text-base font-semibold" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign in
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-4">
                <form onSubmit={handleEmailSignUp} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="full-name" className={fieldLabel}>Full name</Label>
                    <Input
                      id="full-name"
                      className={fieldInput}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className={fieldLabel}>Username</Label>
                    <Input
                      id="signup-username"
                      className={fieldInput}
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className={fieldLabel}>Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      className={fieldInput}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className={fieldLabel}>Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        className={cn(fieldInput, "pr-12")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={showSignupPassword ? "Hide password" : "Show password"}
                      >
                        {showSignupPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referral-code" className={fieldLabel}>Referral code (optional)</Label>
                    <div className="relative">
                      <Input
                        id="referral-code"
                        className={cn(
                          fieldInput,
                          "pr-12",
                          referralStatus.owner && "border-green-500/60",
                          referralStatus.error && "border-destructive/60",
                        )}
                        value={referralCode}
                        onChange={handleReferralChange}
                      />
                      {referralStatus.loading && (
                        <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                      )}
                      {referralStatus.owner && (
                        <CheckCircle2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green-500" />
                      )}
                    </div>
                    {referralStatus.message && (
                      <p
                        id="referral-status-msg"
                        className={cn(
                          "text-xs font-semibold",
                          referralStatus.error ? "text-destructive" : "text-green-600",
                        )}
                      >
                        {referralStatus.error ? "✕ " : "✓ "}
                        {referralStatus.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="h-11 w-full rounded-full text-base font-semibold" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
