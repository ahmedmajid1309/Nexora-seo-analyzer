import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function NotFoundPage() {
  return (
    <Container className="flex flex-1 items-center justify-center py-20">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-bg-tertiary">
          <span className="text-2xl text-text-tertiary" aria-hidden="true">
            ?
          </span>
        </div>
        <h1 className="mt-6 text-2xl font-bold text-text-primary">Page not found</h1>
        <p className="mt-2 text-text-secondary">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-medium text-black hover:bg-brand-hover transition-colors"
        >
          Go home
        </Link>
      </div>
    </Container>
  );
}
