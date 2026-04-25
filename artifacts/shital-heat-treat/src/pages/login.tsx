import React, { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff } from "lucide-react";
// @ts-ignore
import shtLogoUrl from "@/assets/sht-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { setAuthTokenGetter, useLogin } from "@workspace/api-client-react";
import { saveSession } from "@/lib/auth-session";
import { getPlaceholderCredentials, tryPlaceholderLogin } from "@/lib/placeholder-auth";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [, navigate] = useLocation();
  const loginMutation = useLogin();
  const placeholder = getPlaceholderCredentials("client");

  const emailError =
    email.length === 0
      ? ""
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? ""
        : "Please enter a valid email address.";
  const passwordError =
    password.length === 0
      ? ""
      : password.length >= 8
        ? ""
        : "Password must be at least 8 characters.";
  const isFormValid = !emailError && !passwordError && email.length > 0 && password.length > 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid || loginMutation.isPending) {
      return;
    }

    try {
      const placeholderSession = tryPlaceholderLogin("client", email, password);
      if (placeholderSession) {
        saveSession(placeholderSession.token, placeholderSession.user);
        setAuthTokenGetter(() => placeholderSession.token);
        toast({
          title: "Logged in with placeholder client account",
          description: "Redirecting to your client portal.",
        });
        navigate("/client-portal");
        return;
      }

      const response = await loginMutation.mutateAsync({
        data: { email, password },
      });
      saveSession(response.token, response.user);
      setAuthTokenGetter(() => response.token);
      toast({
        title: "Logged in successfully",
        description: "Redirecting to your client portal.",
      });
      navigate("/client-portal");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in right now.";
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(243,146,0,0.15)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>
      
      <div className="z-10 w-full max-w-md mx-auto px-6 py-10 bg-card/80 backdrop-blur border border-border">
        <div className="flex justify-center mb-8">
          <img
            src={shtLogoUrl}
            alt="Shital Heat Treat Pvt. Ltd."
            className="h-20 w-20 object-contain"
          />
        </div>
        <h1 className="text-center text-2xl font-bold text-foreground mb-4 font-sans tracking-tight">
          Client Portal Login
        </h1>
        <div className="h-px w-12 bg-primary mx-auto mb-6"></div>
        <p className="text-center text-muted-foreground mb-8 text-sm">
          Access order status, certifications, and treatment history in one place.
        </p>
        <p className="text-center text-xs text-muted-foreground mb-4">
          Placeholder: {placeholder.email} / {placeholder.password}
        </p>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="client-email">Business Email</Label>
            <Input
              id="client-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              aria-invalid={Boolean(emailError)}
            />
            {emailError ? <p className="text-xs text-destructive">{emailError}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-password">Password</Label>
            <div className="relative">
              <Input
                id="client-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="pr-10"
                aria-invalid={Boolean(passwordError)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-3 inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordError ? <p className="text-xs text-destructive">{passwordError}</p> : null}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!isFormValid || loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-7 text-xs text-muted-foreground text-center space-y-2">
          <p>
            Need access?{" "}
            <a
              href="mailto:info@shitalheattreat.com"
              className="text-foreground hover:text-primary underline underline-offset-2"
            >
              Request an account
            </a>
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2 border border-border bg-background hover:bg-secondary font-medium transition-colors text-foreground"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;