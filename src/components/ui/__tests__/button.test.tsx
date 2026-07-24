import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("accepts disabled state", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button", { name: "Disabled" })).toBeDisabled();
  });

  it("has keyboard focus styling", () => {
    render(<Button>Focusable</Button>);
    const button = screen.getByRole("button", { name: "Focusable" });
    expect(button).toHaveClass("focus-visible:ring-2");
  });
});
