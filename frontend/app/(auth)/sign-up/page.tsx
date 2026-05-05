import { SignUpForm } from "@/components/auth/sign-up-form";
import { CheckCircle2, Sparkles, Shield, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

const features = [
  { icon: Zap, title: "Lightning fast", desc: "Create and organize tasks in seconds" },
  { icon: Shield, title: "Secure by default", desc: "Enterprise-grade auth, your data stays yours" },
  { icon: Sparkles, title: "AI-powered", desc: "Smart chat assistant built right in" },
];

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary flex-col justify-between p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(68%_0.20_300)_0%,transparent_60%)] opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,oklch(40%_0.20_240)_0%,transparent_60%)] opacity-30" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(oklch(100% 0 0 / 0.6) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-white tracking-tight">Todo App</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white leading-tight">
              Stay on top of everything, always.
            </h2>
            <p className="text-white/70 text-base">
              Join thousands of people who trust Todo App to manage their day.
            </p>
          </div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <div className="text-xs text-white/60 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background">
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">Todo App</span>
        </div>

        <div className="w-full max-w-sm fade-in">
          <div className="mb-8 space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Free forever. No credit card required.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
            <SignUpForm />
          </div>
        </div>
      </div>
    </div>
  );
}
