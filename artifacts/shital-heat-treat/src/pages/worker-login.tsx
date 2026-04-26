import React, { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { setAuthTokenGetter, useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { saveSession } from "@/lib/auth-session";
import { getPlaceholderCredentials, tryPlaceholderLogin } from "@/lib/placeholder-auth";

export default function WorkerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, navigate] = useLocation();
  const placeholder = getPlaceholderCredentials("worker");
  const loginMutation = useLogin();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password || loginMutation.isPending) return;
    const session = tryPlaceholderLogin("worker", email, password);
    if (session) {
      saveSession(session.token, session.user);
      setAuthTokenGetter(() => session.token);
      navigate("/worker");
      return;
    }

    try {
      const response = await loginMutation.mutateAsync({
        data: { email, password },
      });
      if (response.user.role !== "operator" && response.user.role !== "admin") {
        toast({
          title: "Worker access required",
          description: "This account is not allowed to access the worker page.",
          variant: "destructive",
        });
        return;
      }
      saveSession(response.token, response.user);
      setAuthTokenGetter(() => response.token);
      navigate("/worker");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in right now.";
      toast({
        title: "Sign in failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-[#1A202C] bg-[#0D111A] p-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Worker Login</h1>
          <p className="text-sm text-gray-400 mt-1">
            Hidden single-PC access for operations updates.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Placeholder: {placeholder.email} / {placeholder.password}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="worker-email">Email</Label>
            <Input
              id="worker-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="worker@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="worker-password">Password</Label>
            <Input
              id="worker-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Signing in..." : "Sign in as worker"}
          </Button>
        </form>

        <Link href="/" className="inline-block text-sm text-gray-300 hover:text-white">
          Return home
        </Link>
      </div>
    </div>
  );
}

