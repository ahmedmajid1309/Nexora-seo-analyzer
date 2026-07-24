import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuditForm } from "@/components/landing/AuditForm";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("AuditForm", () => {
  it("renders URL input", () => {
    render(<AuditForm />);
    expect(screen.getByLabelText(/website url/i)).toBeInTheDocument();
  });

  it("renders optional keyword input", () => {
    render(<AuditForm />);
    expect(screen.getByLabelText(/target keyword/i)).toBeInTheDocument();
  });

  it("submit button is not disabled (audit is live)", () => {
    render(<AuditForm />);
    const btn = screen.getByRole("button", { name: /analyze website/i });
    expect(btn).not.toBeDisabled();
  });

  it("does not show the placeholder 'not yet enabled' message", () => {
    render(<AuditForm />);
    expect(screen.queryByText(/audit engine is not yet enabled/i)).not.toBeInTheDocument();
  });
});
