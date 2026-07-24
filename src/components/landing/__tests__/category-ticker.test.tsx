import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryTicker } from "@/components/landing/CategoryTicker";

describe("CategoryTicker", () => {
  it("renders category names", () => {
    render(<CategoryTicker />);
    expect(screen.getAllByText(/Technical SEO/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Performance/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Accessibility/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders all expected categories", () => {
    render(<CategoryTicker />);
    expect(screen.getAllByText(/AEO Readiness/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/GEO Readiness/i).length).toBeGreaterThanOrEqual(1);
  });

  it("has accessible region label", () => {
    render(<CategoryTicker />);
    const region = screen.getByRole("region");
    expect(region).toHaveAttribute("aria-label", "Audit categories");
  });

  it("hides duplicated ticker content from screen readers", () => {
    render(<CategoryTicker />);
    const tickerDiv = document.querySelector(".animate-marquee");
    expect(tickerDiv).toHaveAttribute("aria-hidden", "true");
  });

  it("provides a screen-reader-only category list", () => {
    render(<CategoryTicker />);
    const srList = document.querySelector(".sr-only");
    expect(srList).toBeTruthy();
    expect(srList?.tagName).toBe("UL");
  });
});
