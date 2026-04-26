import React, { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { setAuthTokenGetter, useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { saveSession } from "@/lib/auth-session";
import { getPlaceholderCredentialList, tryPlaceholderLogin } from "@/lib/placeholder-auth";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, navigate] = useLocation();
  const placeholders = getPlaceholderCredentialList("admin");
  const loginMutation = useLogin();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loginMutation.isPending) return;
    const session = tryPlaceholderLogin("admin", email, password);
    if (session) {
      saveSession(session.token, session.user);
      setAuthTokenGetter(() => session.token);
      navigate("/admin");
      return;
    }

    try {
      const response = await loginMutation.mutateAsync({
        data: { email, password },
      });
      if (response.user.role !== "admin") {
        toast({
          title: "Admin access required",
          description: "This account is not allowed to access the admin page.",
          variant: "destructive",
        });
        return;
      }
      saveSession(response.token, response.user);
      setAuthTokenGetter(() => response.token);
      navigate("/admin");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in right now.";
      toast({
        title: "Admin sign in failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-[#1A202C] bg-[#0D111A] p-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-sm text-gray-400 mt-1">Hidden access for internal admin settings.</p>
          <div className="text-xs text-gray-400 mt-2 space-y-1">
            {placeholders.map((placeholder) => (
              <p key={placeholder.email}>
                {placeholder.name}: {placeholder.email} / {placeholder.password}
              </p>
            ))}
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Signing in..." : "Sign in as admin"}
          </Button>
        </form>

        <Link href="/" className="inline-block text-sm text-gray-300 hover:text-white">
          Return home
        </Link>
      </div>
    </div>
  );
}

