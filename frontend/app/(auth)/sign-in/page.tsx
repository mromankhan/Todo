import { SignInForm } from "@/components/auth/sign-in-form";
import { CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary flex-col justify-between p-12">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(68%_0.20_300)_0%,transparent_60%)] opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,oklch(40%_0.20_240)_0%,transparent_60%)] opacity-30" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,oklch(100%_0_0/0.04)_100%)]" />

        {/* Grid dots */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(oklch(100% 0 0 / 0.6) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-white tracking-tight">Todo App</span>
        </div>

        {/* Quote */}
        <div className="relative z-10 space-y-6">
          <blockquote className="space-y-3">
            <p className="text-2xl font-medium text-white/90 leading-relaxed">
              &ldquo;The key is not to prioritize what&apos;s on your schedule, but to schedule your priorities.&rdquo;
            </p>
            <footer className="text-sm text-white/60">— Stephen Covey</footer>
          </blockquote>

          <div className="flex items-center gap-4 pt-4">
            {[
              { label: "Tasks Done", value: "10k+" },
              { label: "Active Users", value: "2.4k" },
              { label: "Uptime", value: "99.9%" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/60 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">Todo App</span>
        </div>

        <div className="w-full max-w-sm fade-in">
          <div className="mb-8 space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to continue to your workspace
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
            <SignInForm />
          </div>
        </div>
      </div>
    </div>
  );
}
