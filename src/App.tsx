import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { Toaster } from "sonner";

import { api } from "../convex/_generated/api";

import { HabitTracker } from "./components/HabitTracker";
import { ModeToggle } from "./components/theme-toggle";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white/80 px-4 shadow-sm backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-primary">Habit Tracker</h2>
        <Authenticated>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <SignOutButton />
          </div>
        </Authenticated>
      </header>
      <main className="flex-1 p-4">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Authenticated>
        <HabitTracker />
      </Authenticated>
      <Unauthenticated>
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-8">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-primary">
              Habit Tracker
            </h1>
            <p className="text-xl text-secondary">
              Track your daily habits and build better routines
            </p>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>
    </div>
  );
}
