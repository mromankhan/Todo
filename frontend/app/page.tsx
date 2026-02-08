import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckCircle2, CheckSquare, Calendar, Shield, Zap, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Navigation */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Todo App</h1>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium uppercase">
                    T
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-foreground leading-none">
                      Guest User
                    </p>
                    <p className="text-xs text-muted-foreground leading-none">
                      Not logged in
                    </p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 sm:py-24">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
            <CheckSquare className="h-4 w-4 mr-2" />
            Productivity Redefined
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
            Simplify Your Tasks, Amplify Your <span className="text-primary">Productivity</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mb-10">
            A simple, fast, and secure way to manage your tasks. Organize your life, boost your efficiency, and achieve your goals with our intuitive platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link
              href="/sign-up"
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-in"
              className="flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-6 py-3.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Sign In
            </Link>
          </div>
          
          <div className="relative w-full max-w-2xl aspect-video rounded-xl bg-muted border overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="grid grid-cols-3 gap-4 w-full">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`h-3 w-3 rounded-full ${item % 3 === 0 ? 'bg-green-500' : item % 3 === 1 ? 'bg-yellow-500' : 'bg-muted-foreground'}`}></div>
                      <div className="h-3 bg-muted-foreground rounded-full w-3/4"></div>
                    </div>
                    <div className="h-2 bg-muted rounded-full w-full mb-1"></div>
                    <div className="h-2 bg-muted rounded-full w-5/6"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
            Everything you need to stay organized
          </h2>
          <p className="text-lg text-muted-foreground">
            Our platform offers powerful features designed to help you manage your tasks efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card rounded-2xl border p-6 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Lightning Fast</h3>
            <p className="text-muted-foreground">
              Built with performance in mind. Your tasks load instantly, so you can focus on what matters.
            </p>
          </div>
          
          <div className="bg-card rounded-2xl border p-6 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Secure</h3>
            <p className="text-muted-foreground">
              Your data is protected with modern authentication and encryption. Your privacy is our priority.
            </p>
          </div>
          
          <div className="bg-card rounded-2xl border p-6 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Organized</h3>
            <p className="text-muted-foreground">
              Create, update, and complete tasks with ease. No complexity, just productivity.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to boost your productivity?
          </h2>
          <p className="text-primary-foreground/90 max-w-xl mx-auto mb-6">
            Join thousands of users who trust our platform to manage their tasks and achieve their goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="flex items-center justify-center gap-2 rounded-lg bg-background px-6 py-3.5 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-background/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-in"
              className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 px-6 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Todo App. All rights reserved.</p>
      </footer>
    </div>
  );
}
