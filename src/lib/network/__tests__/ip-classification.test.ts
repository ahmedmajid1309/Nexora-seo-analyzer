import { describe, it, expect, vi } from "vitest";
import { safeFetch } from "@/lib/network/safe-fetch";

vi.mock("@/lib/network/fetch-url", () => ({
  fetchUrl: vi.fn(() => Promise.reject(new Error("Mock connection"))),
}));

describe("literal IP handling", () => {
  it("allows public IPv4 literal through IP check", async () => {
    try {
      await safeFetch("https://8.8.8.8");
    } catch (err) {
      expect((err as { code: string }).code).not.toBe("IP_ADDRESS_NOT_ALLOWED");
    }
  });

  it("allows public IPv6 literal through IP check", async () => {
    try {
      await safeFetch("https://[2606:4700:4700::1111]");
    } catch (err) {
      expect((err as { code: string }).code).not.toBe("IP_ADDRESS_NOT_ALLOWED");
    }
  });

  it("blocks private IPv4 literal", async () => {
    try {
      await safeFetch("https://192.168.1.1");
    } catch (err) {
      expect((err as { code: string }).code).toBe("IP_ADDRESS_NOT_ALLOWED");
    }
  });

  it("blocks numeric IPv4 representation (loopback)", async () => {
    try {
      await safeFetch("https://2130706433");
    } catch (err) {
      expect((err as { code: string }).code).toBe("IP_ADDRESS_NOT_ALLOWED");
    }
  });

  it("blocks loopback IPv6", async () => {
    try {
      await safeFetch("https://[::1]");
    } catch (err) {
      expect((err as { code: string }).code).toBe("IP_ADDRESS_NOT_ALLOWED");
    }
  });

  it("blocks IPv4-mapped IPv6 private", async () => {
    try {
      await safeFetch("https://[::ffff:192.168.1.1]");
    } catch (err) {
      expect((err as { code: string }).code).toBe("IP_ADDRESS_NOT_ALLOWED");
    }
  });
});
