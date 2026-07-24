import { describe, it, expect } from "vitest";
import { normalizeText, countWords, countSentences } from "../normalize-text";

describe("normalizeText", () => {
  it("collapses multiple whitespace characters", () => {
    expect(normalizeText("hello   world")).toBe("hello world");
  });

  it("replaces non-breaking spaces with regular spaces", () => {
    expect(normalizeText("hello\u00a0world")).toBe("hello world");
  });

  it("removes zero-width spaces", () => {
    expect(normalizeText("hello\u200bworld")).toBe("helloworld");
  });

  it("removes BOM characters", () => {
    expect(normalizeText("\ufeffhello")).toBe("hello");
  });

  it("trims leading and trailing whitespace", () => {
    expect(normalizeText("  hello world  ")).toBe("hello world");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(normalizeText("   ")).toBe("");
  });

  it("returns empty string for empty input", () => {
    expect(normalizeText("")).toBe("");
  });

  it("handles mixed special whitespace characters", () => {
    const input = " \u00a0hello\u200b \ufeffworld\u00a0 ";
    expect(normalizeText(input)).toBe("hello world");
  });

  it("preserves single spaces between words", () => {
    expect(normalizeText("a b c")).toBe("a b c");
  });

  it("handles newlines and tabs", () => {
    expect(normalizeText("line1\n\tline2\n  line3")).toBe("line1 line2 line3");
  });
});

describe("countWords", () => {
  it("counts words in a simple sentence", () => {
    expect(countWords("hello world")).toBe(2);
  });

  it("returns 0 for empty string", () => {
    expect(countWords("")).toBe(0);
  });

  it("returns 0 for whitespace-only string", () => {
    expect(countWords("   ")).toBe(0);
  });

  it("counts words separated by multiple spaces", () => {
    expect(countWords("one   two   three")).toBe(3);
  });

  it("counts a single word", () => {
    expect(countWords("hello")).toBe(1);
  });

  it("handles punctuation attached to words", () => {
    expect(countWords("hello, world!")).toBe(2);
  });

  it("handles leading and trailing whitespace", () => {
    expect(countWords("  hello world  ")).toBe(2);
  });
});

describe("countSentences", () => {
  it("counts sentences terminated by periods", () => {
    expect(countSentences("Hello world. How are you?")).toBe(2);
  });

  it("counts sentences with exclamation marks", () => {
    expect(countSentences("Stop! Go!")).toBe(2);
  });

  it("handles ellipsis as sentence terminator", () => {
    expect(countSentences("Hmm... Okay.")).toBe(2);
  });

  it("returns 1 for a single sentence without punctuation", () => {
    expect(countSentences("hello world")).toBe(1);
  });

  it("returns 0 for empty string", () => {
    expect(countSentences("")).toBe(0);
  });

  it("returns 0 for whitespace-only string", () => {
    expect(countSentences("   ")).toBe(0);
  });

  it("counts multiple sentence terminators", () => {
    expect(countSentences("A. B! C?")).toBe(3);
  });

  it("handles trailing whitespace after punctuation", () => {
    expect(countSentences("A. B. ")).toBe(2);
  });
});
