"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/auth/dev-signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setMessage(
      response.ok ? "Signed in. You can now claim and view report history." : "Sign-in failed.",
    );
  }

  return (
    <Container className="py-24">
      <Card className="mx-auto max-w-lg p-8">
        <meta name="robots" content="noindex" />
        <h1 className="font-display text-3xl font-semibold text-text-primary">Sign in</h1>
        <p className="mt-3 text-text-secondary">
          Optional local-development sign-in for saving and claiming reports. Anonymous audits still
          work without an account.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-text-primary"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
          <Button type="submit">Continue</Button>
        </form>
        {message ? <p className="mt-4 text-sm text-text-secondary">{message}</p> : null}
      </Card>
    </Container>
  );
}
