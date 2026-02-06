import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-8 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-8 text-center sm:items-start sm:text-left w-full">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
              Todo App
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md">
              A simple, fast, and secure way to manage your tasks.
              Sign up today and start getting things done.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Get Started
            </Link>
            <Link
              href="/sign-in"
              className="flex h-12 items-center justify-center rounded-full border border-zinc-200 px-8 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3 w-full">
          <div className="space-y-2">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Simple</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Create, update, and complete tasks with ease. No complexity, just productivity.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Secure</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Your data is protected with modern authentication and encryption.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Fast</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Built with performance in mind. Your tasks load instantly.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
