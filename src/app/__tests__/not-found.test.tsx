import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFoundPage from "@/app/not-found";

describe("Not found page", () => {
  it("renders heading", () => {
    render(<NotFoundPage />);
    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });

  it("provides home link", () => {
    render(<NotFoundPage />);
    expect(screen.getByRole("link", { name: /go home/i })).toBeInTheDocument();
  });

  it("has no console errors", () => {
    const spy = vi.spyOn(console, "error");
    render(<NotFoundPage />);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
