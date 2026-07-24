import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

vi.mock("@/components/layout/SiteHeader", () => ({
  SiteHeader: () => <header data-testid="site-header" />,
}));

vi.mock("@/components/layout/SiteFooter", () => ({
  SiteFooter: () => <footer data-testid="site-footer" />,
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { src, alt, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src as string} alt={alt as string} {...rest} />;
  },
}));

describe("HomePage", () => {
  it("renders the hero headline", () => {
    render(<HomePage />);
    expect(screen.getByText(/Evidence-Backed/i)).toBeInTheDocument();
    const verdicts = screen.getAllByText(/Verdict/i);
    expect(verdicts.length).toBeGreaterThanOrEqual(1);
  });

  it("renders URL input field", () => {
    render(<HomePage />);
    expect(screen.getByLabelText(/website url/i)).toBeInTheDocument();
  });

  it("renders trust line", () => {
    render(<HomePage />);
    expect(screen.getByText(/free.*no signup.*actionable results/i)).toBeInTheDocument();
  });

  it("renders category ticker", () => {
    render(<HomePage />);
    expect(screen.getAllByText(/Technical SEO/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders every audit checks section", () => {
    render(<HomePage />);
    expect(screen.getByText(/85\+/)).toBeInTheDocument();
    expect(screen.getByText(/Evidence-based checks/i)).toBeInTheDocument();
  });

  it("renders methodology transparency section", () => {
    render(<HomePage />);
    const links = screen.getAllByText(/methodology/i);
    expect(links.length).toBeGreaterThan(0);
  });

  it("renders Nexora Creation CTA", () => {
    render(<HomePage />);
    expect(screen.getByText(/built by nexora creation/i)).toBeInTheDocument();
  });

  it("renders Demo data label on sample dashboard", () => {
    render(<HomePage />);
    expect(screen.getByText(/Demo data/i)).toBeInTheDocument();
  });

  it("renders sample SEO score 78 in hero dashboard", () => {
    render(<HomePage />);
    const seventyEights = screen.getAllByText("78");
    expect(seventyEights.length).toBeGreaterThanOrEqual(1);
  });

  it("renders critical finding in hero dashboard", () => {
    render(<HomePage />);
    const findings = screen.getAllByText(/missing meta description/i);
    expect(findings.length).toBeGreaterThanOrEqual(1);
  });

  it("renders quick win finding in hero dashboard", () => {
    render(<HomePage />);
    const findings = screen.getAllByText(/alt text missing/i);
    expect(findings.length).toBeGreaterThanOrEqual(1);
  });

  it("has no unexpected console errors", () => {
    const spy = vi.spyOn(console, "error");
    render(<HomePage />);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
