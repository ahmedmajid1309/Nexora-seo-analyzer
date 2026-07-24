import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MethodologyPage from "@/app/methodology/page";

describe("Methodology page", () => {
  it("renders heading", () => {
    render(<MethodologyPage />);
    expect(screen.getByText("Methodology")).toBeInTheDocument();
  });

  it("explains deterministic checks", () => {
    render(<MethodologyPage />);
    expect(screen.getByText("Deterministic Checks")).toBeInTheDocument();
  });

  it("explains N/A and unavailable states", () => {
    render(<MethodologyPage />);
    expect(screen.getByText("Not-Applicable and Unavailable States")).toBeInTheDocument();
  });

  it("explains AI does not control scores", () => {
    render(<MethodologyPage />);
    expect(screen.getByText("AI Is Not in Control")).toBeInTheDocument();
  });
});
