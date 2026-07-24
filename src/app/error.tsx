"use client";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="flex flex-1 items-center justify-center py-20">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-critical/10">
          <span className="text-2xl text-critical" aria-hidden="true">
            !
          </span>
        </div>
        <h1 className="mt-6 text-2xl font-bold text-text-primary">Something went wrong</h1>
        <p className="mt-2 text-text-secondary">
          An unexpected error occurred. Please try again later.
        </p>
        <Button onClick={reset} variant="primary" className="mt-6">
          Try again
        </Button>
      </div>
    </Container>
  );
}
