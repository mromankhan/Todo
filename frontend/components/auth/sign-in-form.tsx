"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Sign in failed");
        return;
      }

      // Redirect to dashboard on success
      router.push("/dashboard");
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          {error}
        </div>
      )}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-medium text-zinc-900 dark:text-zinc-50 hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
