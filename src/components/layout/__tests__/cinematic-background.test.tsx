import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { CinematicBackground } from "@/components/layout/CinematicBackground";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("CinematicBackground", () => {
  it("renders full decorative layers on homepage", () => {
    const { container } = render(<CinematicBackground />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass("pointer-events-none");
    expect(div).toHaveAttribute("aria-hidden", "true");
  });
});
