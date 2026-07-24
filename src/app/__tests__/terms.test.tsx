import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TermsPage from "@/app/terms/page";

describe("Terms page", () => {
  it("renders heading", () => {
    render(<TermsPage />);
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
  });

  it("mentions no warranty", () => {
    render(<TermsPage />);
    expect(screen.getByText(/no warranty/i)).toBeInTheDocument();
  });

  it("shows legal review badge", () => {
    render(<TermsPage />);
    expect(screen.getByText(/requires professional legal review/i)).toBeInTheDocument();
  });
});
