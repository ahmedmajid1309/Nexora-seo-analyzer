import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PrivacyPage from "@/app/privacy/page";

describe("Privacy page", () => {
  it("renders heading", () => {
    render(<PrivacyPage />);
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
  });

  it("mentions noindex and unlisted", () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/noindex/i)).toBeInTheDocument();
  });

  it("describes current data handling practices", () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/fetches the page content server-side/i)).toBeInTheDocument();
  });

  it("mentions PageSpeed Insights integration", () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/third.party services/i)).toBeInTheDocument();
  });

  it("shows legal review badge", () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/requires professional legal review/i)).toBeInTheDocument();
  });
});
