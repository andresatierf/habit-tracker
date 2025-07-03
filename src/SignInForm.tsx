"use client";
import { useState } from "react";

import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";

import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { Input } from "@/components/input";
import { Label } from "@/components/label";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl">
          {flow === "signIn" ? "Sign In" : "Sign Up"}
        </CardTitle>
        <CardDescription className="text-center">
          {flow === "signIn"
            ? "Enter your email and password to sign in"
            : "Create an account to get started"}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitting(true);
            const formData = new FormData(e.target as HTMLFormElement);
            formData.set("flow", flow);
            void signIn("password", formData).catch((error) => {
              let toastTitle = "";
              if (error.message.includes("Invalid password")) {
                toastTitle = "Invalid password. Please try again.";
              } else {
                toastTitle =
                  flow === "signIn"
                    ? "Could not sign in, did you mean to sign up?"
                    : "Could not sign up, did you mean to sign in?";
              }
              toast.error(toastTitle);
              setSubmitting(false);
            });
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" name="password" required />
          </div>
          <Button type="submit" disabled={submitting}>
            {flow === "signIn" ? "Sign in" : "Sign up"}
          </Button>
        </form>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <Button variant="outline" onClick={() => void signIn("anonymous")}>
          Sign in anonymously
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        {flow === "signIn"
          ? "Don't have an account? "
          : "Already have an account? "}
        <Button
          variant="link"
          type="button"
          onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          className="px-1"
        >
          {flow === "signIn" ? "Sign up" : "Sign in"}
        </Button>
      </CardFooter>
    </Card>
  );
}
