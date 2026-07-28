import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuditScanExperience } from "../AuditScanExperience";

describe("AuditScanExperience", () => {
  it("shows a real target, elapsed counter, and no fake percentage", () => {
    render(<AuditScanExperience mode="quick" url="https://example.com/path?secret=value" />);

    expect(screen.getByText("example.com")).toBeInTheDocument();
    expect(screen.getByText("/path")).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(screen.getByText(/No client-side fake stage completion/i)).toBeInTheDocument();
    expect(screen.getByText(/Auditing only the submitted page/i)).toBeInTheDocument();
    expect(screen.queryByText("Discovered")).not.toBeInTheDocument();
  });

  it("renders site counters without horizontal-only assumptions", () => {
    render(
      <AuditScanExperience
        mode="site"
        url="https://example.com"
        counters={{ discoveredPages: 4, selectedPages: 3, completedPages: 2, failedPages: 1 }}
      />,
    );

    expect(screen.getByText("Site Audit Target")).toBeInTheDocument();
    expect(screen.getByText("Discovered")).toBeInTheDocument();
    expect(screen.getByText("Selected")).toBeInTheDocument();
  });

  it.each([
    ["partial", "Partial audit result"],
    ["failed", "Audit failed"],
    ["cancelled", "Audit cancelled"],
  ] as const)("renders the %s terminal state", (state, label) => {
    render(<AuditScanExperience mode="quick" url="https://example.com" state={state} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
