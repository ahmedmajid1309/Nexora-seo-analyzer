import { describe, it, expect } from "vitest";
import { makeElementRef, buildDomPath } from "../selectors";

function fakeEl(overrides: { tagName?: string; id?: string; className?: string }): {
  tagName: string;
  attribs: Record<string, string>;
} {
  const attribs: Record<string, string> = {};
  if (overrides.id) attribs.id = overrides.id;
  if (overrides.className) attribs.class = overrides.className;
  return { tagName: overrides.tagName ?? "div", attribs };
}

describe("makeElementRef", () => {
  it("creates a ref with tag and order", () => {
    const ref = makeElementRef(fakeEl({ tagName: "p" }), 0);
    expect(ref).toEqual({ tag: "p", order: 0 });
  });

  it("includes id when present", () => {
    const ref = makeElementRef(fakeEl({ tagName: "div", id: "main" }), 1);
    expect(ref).toEqual({ tag: "div", id: "main", order: 1 });
  });

  it("includes up to 3 class names", () => {
    const ref = makeElementRef(fakeEl({ tagName: "span", className: "a b c d" }), 2);
    expect(ref.classNames).toEqual(["a", "b", "c"]);
  });

  it("omits classNames when no class attribute", () => {
    const ref = makeElementRef(fakeEl({ tagName: "div" }), 3);
    expect(ref.classNames).toBeUndefined();
  });

  it("lowercases the tag name", () => {
    const ref = makeElementRef(fakeEl({ tagName: "H1" }), 4);
    expect(ref.tag).toBe("h1");
  });

  it("falls back to name property when tagName missing", () => {
    const el = { name: "custom", attribs: {} };
    const ref = makeElementRef(el, 5);
    expect(ref.tag).toBe("custom");
  });

  it("falls back to unknown when neither tagName nor name", () => {
    const el = { attribs: {} };
    const ref = makeElementRef(el, 6);
    expect(ref.tag).toBe("unknown");
  });
});

describe("buildDomPath", () => {
  it("uses tag name for element without id or class", () => {
    expect(buildDomPath(fakeEl({ tagName: "div" }))).toBe("div");
  });

  it("uses id selector when id is present", () => {
    expect(buildDomPath(fakeEl({ tagName: "section", id: "content" }))).toBe("section#content");
  });

  it("uses class selector when class is present without id", () => {
    expect(buildDomPath(fakeEl({ tagName: "div", className: "container" }))).toBe("div.container");
  });

  it("uses up to 2 class names", () => {
    expect(buildDomPath(fakeEl({ tagName: "div", className: "a b c" }))).toBe("div.a.b");
  });

  it("prepends parent path when provided", () => {
    expect(buildDomPath(fakeEl({ tagName: "span", className: "inner" }), "div.container")).toBe(
      "div.container > span.inner",
    );
  });

  it("lowercases tag name", () => {
    expect(buildDomPath(fakeEl({ tagName: "A" }))).toBe("a");
  });

  it("falls back to name property", () => {
    const el = { name: "CUSTOM", attribs: {} };
    expect(buildDomPath(el)).toBe("custom");
  });

  it("falls back to unknown", () => {
    const el = { attribs: {} };
    expect(buildDomPath(el)).toBe("unknown");
  });

  it("prefers id over class even when both present", () => {
    expect(buildDomPath(fakeEl({ tagName: "div", id: "main", className: "container" }))).toBe(
      "div#main",
    );
  });
});
