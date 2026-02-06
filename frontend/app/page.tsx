import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-8 bg-background sm:items-start">
        <div className="flex flex-col items-center gap-8 text-center sm:items-start sm:text-left w-full">
          <div className="flex w-full justify-end mb-4 items-center gap-2">
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
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Todo App
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-md">
              A simple, fast, and secure way to manage your tasks.
              Sign up today and start getting things done.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get Started
            </Link>
            <Link
              href="/sign-in"
              className="flex h-12 items-center justify-center rounded-full border border-input px-8 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3 w-full">
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Simple</h3>
            <p className="text-sm text-muted-foreground">
              Create, update, and complete tasks with ease. No complexity, just productivity.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Secure</h3>
            <p className="text-sm text-muted-foreground">
              Your data is protected with modern authentication and encryption.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Fast</h3>
            <p className="text-sm text-muted-foreground">
              Built with performance in mind. Your tasks load instantly.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
