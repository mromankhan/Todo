import { SignUpForm } from "@/components/auth/sign-up-form";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create an account
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Enter your details to get started
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
