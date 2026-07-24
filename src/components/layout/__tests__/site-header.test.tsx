import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteHeader } from "@/components/layout/SiteHeader";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { src, alt, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src as string} alt={alt as string} {...rest} />;
  },
}));

describe("SiteHeader", () => {
  it("renders the navigation with brand link", () => {
    render(<SiteHeader />);
    const links = screen.getAllByRole("link");
    const brandLink = links.find((l) => l.getAttribute("href") === "/");
    expect(brandLink).toBeTruthy();
  });

  it("renders navigation links", () => {
    render(<SiteHeader />);
    expect(screen.getByText(/Methodology/i)).toBeInTheDocument();
    expect(screen.getByText(/Privacy/i)).toBeInTheDocument();
  });

  it("renders analyze CTA link", () => {
    render(<SiteHeader />);
    const links = screen.getAllByRole("link");
    const analyzeLink = links.find((l) => l.textContent === "Analyze");
    expect(analyzeLink).toBeTruthy();
  });

  it("has fixed positioning", () => {
    render(<SiteHeader />);
    const header = document.querySelector("header");
    expect(header).toHaveClass("fixed");
  });

  it("renders mobile menu button", () => {
    render(<SiteHeader />);
    expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument();
  });
});
