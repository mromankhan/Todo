"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { prefetchToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
];

export function SignUpForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const callbackURL =
      typeof window !== "undefined"
        ? `${window.location.origin}/dashboard`
        : "http://localhost:3000/dashboard";

    const result = await signUp.email({ email, password, name, callbackURL });

    if (result?.error) {
      setError(result.error.message ?? "Sign up failed. Please try again.");
      setLoading(false);
      return;
    }

    await prefetchToken();
    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Jane Smith"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className="h-10 text-sm"
          required
        />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="h-10 text-sm"
          required
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPasswordTouched(true)}
            autoComplete="new-password"
            className="h-10 pr-10 text-sm"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Password strength indicators */}
        {passwordTouched && password.length > 0 && (
          <div className="space-y-1 pt-0.5">
            {passwordRules.map((rule) => {
              const passes = rule.test(password);
              return (
                <div
                  key={rule.label}
                  className={cn(
                    "flex items-center gap-1.5 text-xs transition-colors",
                    passes ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                  )}
                >
                  <Check className={cn("h-3 w-3 shrink-0", !passes && "opacity-30")} />
                  {rule.label}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <Label htmlFor="confirm-password" className="text-sm font-medium">
          Confirm password
        </Label>
        <Input
          id="confirm-password"
          type={showPassword ? "text" : "password"}
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          className={cn(
            "h-10 text-sm",
            confirmPassword.length > 0 && confirmPassword !== password &&
              "border-destructive/60 focus-visible:ring-destructive/30"
          )}
          required
        />
        {confirmPassword.length > 0 && confirmPassword !== password && (
          <p className="text-xs text-destructive">Passwords don&apos;t match</p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/8 px-3.5 py-2.5 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        className={cn("w-full h-10 font-medium transition-all mt-1", loading && "opacity-80")}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account…
          </span>
        ) : (
          "Create account"
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground leading-relaxed">
        By signing up you agree to our{" "}
        <Link href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">Terms</Link>
        {" & "}
        <Link href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">Privacy Policy</Link>
      </p>

      <p className="text-center text-sm text-muted-foreground border-t border-border pt-4">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
