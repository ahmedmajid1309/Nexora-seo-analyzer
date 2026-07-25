import { beforeEach, describe, it, expect, vi } from "vitest";
import type { HostResolver, ResolvedAddress } from "@/lib/network/types";
import { checkResolvedAddresses } from "@/lib/network/network-policy";
import { resolveHost } from "@/lib/network/resolve-host";

const hoisted = vi.hoisted(() => ({
  resolve: vi.fn(),
  lookup: vi.fn(),
}));

vi.mock("dns/promises", () => ({
  resolve: hoisted.resolve,
  lookup: hoisted.lookup,
}));

beforeEach(() => {
  vi.useRealTimers();
  hoisted.resolve.mockReset();
  hoisted.lookup.mockReset();
});

describe("resolveHost", () => {
  it("returns A and AAAA record results", async () => {
    hoisted.resolve.mockImplementation((hostname: string, rrtype: string) => {
      expect(hostname).toBe("example.com");
      if (rrtype === "A") return Promise.resolve(["93.184.216.34"]);
      return Promise.resolve(["2606:2800:220:1:248:1893:25c8:1946"]);
    });

    await expect(resolveHost("example.com")).resolves.toEqual([
      { family: "IPv4", address: "93.184.216.34" },
      { family: "IPv6", address: "2606:2800:220:1:248:1893:25c8:1946" },
    ]);
    expect(hoisted.lookup).not.toHaveBeenCalled();
  });

  it("uses AAAA when A is unavailable", async () => {
    hoisted.resolve.mockImplementation((_hostname: string, rrtype: string) => {
      if (rrtype === "A") return Promise.reject(new Error("no A"));
      return Promise.resolve(["2606:4700:4700::1111"]);
    });

    await expect(resolveHost("example.com")).resolves.toEqual([
      { family: "IPv6", address: "2606:4700:4700::1111" },
    ]);
    expect(hoisted.lookup).not.toHaveBeenCalled();
  });

  it("falls back to system lookup for public IPv4 when A and AAAA are empty", async () => {
    hoisted.resolve.mockRejectedValue(new Error("resolver unavailable"));
    hoisted.lookup.mockResolvedValue([{ address: "145.79.24.64", family: 4 }]);

    await expect(resolveHost("nexoracreation.com")).resolves.toEqual([
      { family: "IPv4", address: "145.79.24.64" },
    ]);
  });

  it("falls back to system lookup for public IPv6", async () => {
    hoisted.resolve.mockResolvedValue([]);
    hoisted.lookup.mockResolvedValue([
      { address: "2a02:4780:60:bb3c:647d:ed74:1a44:7645", family: 6 },
    ]);

    await expect(resolveHost("nexoracreation.com")).resolves.toEqual([
      { family: "IPv6", address: "2a02:4780:60:bb3c:647d:ed74:1a44:7645" },
    ]);
  });

  it("removes duplicate addresses", async () => {
    hoisted.resolve.mockResolvedValue([]);
    hoisted.lookup.mockResolvedValue([
      { address: "145.79.24.64", family: 4 },
      { address: "145.79.24.64", family: 4 },
    ]);

    await expect(resolveHost("example.com")).resolves.toEqual([
      { family: "IPv4", address: "145.79.24.64" },
    ]);
  });

  it("returns lookup private addresses for existing policy checks to block", async () => {
    hoisted.resolve.mockResolvedValue([]);
    hoisted.lookup.mockResolvedValue([{ address: "10.0.0.1", family: 4 }]);

    const addresses = await resolveHost("internal.example");
    expect(checkResolvedAddresses(addresses).allowed).toBe(false);
  });

  it("returns mixed lookup addresses for existing policy checks to block", async () => {
    hoisted.resolve.mockResolvedValue([]);
    hoisted.lookup.mockResolvedValue([
      { address: "8.8.8.8", family: 4 },
      { address: "10.0.0.1", family: 4 },
    ]);

    const addresses = await resolveHost("mixed.example");
    const result = checkResolvedAddresses(addresses);
    expect(result.allowed).toBe(false);
    expect(result.error).toContain("Mixed");
  });

  it("rejects when every resolver returns nothing", async () => {
    hoisted.resolve.mockResolvedValue([]);
    hoisted.lookup.mockResolvedValue([]);

    await expect(resolveHost("missing.example")).rejects.toThrow(/no records found/i);
  });

  it("rejects lookup timeout", async () => {
    vi.useFakeTimers();
    hoisted.resolve.mockResolvedValue([]);
    hoisted.lookup.mockReturnValue(new Promise(() => {}));

    const promise = resolveHost("slow.example", { timeout: 10 });
    const assertion = expect(promise).rejects.toThrow(/timed out/i);
    await vi.advanceTimersByTimeAsync(11);
    await assertion;
    vi.useRealTimers();
  });

  it("rejects aborted resolution", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(resolveHost("example.com", { signal: controller.signal })).rejects.toThrow(
      /aborted/i,
    );
  });
});

describe("checkResolvedAddresses", () => {
  it("allows public IPv4", () => {
    const addrs: ResolvedAddress[] = [{ family: "IPv4", address: "8.8.8.8" }];
    expect(checkResolvedAddresses(addrs).allowed).toBe(true);
  });

  it("allows public IPv6", () => {
    const addrs: ResolvedAddress[] = [{ family: "IPv6", address: "2606:4700:4700::1111" }];
    expect(checkResolvedAddresses(addrs).allowed).toBe(true);
  });

  it("allows mixed A and AAAA public", () => {
    const addrs: ResolvedAddress[] = [
      { family: "IPv4", address: "8.8.8.8" },
      { family: "IPv6", address: "2001:4860:4860::8888" },
    ];
    expect(checkResolvedAddresses(addrs).allowed).toBe(true);
  });

  it("rejects private IPv4", () => {
    const addrs: ResolvedAddress[] = [{ family: "IPv4", address: "192.168.1.1" }];
    expect(checkResolvedAddresses(addrs).allowed).toBe(false);
  });

  it("rejects mixed public and private", () => {
    const addrs: ResolvedAddress[] = [
      { family: "IPv4", address: "8.8.8.8" },
      { family: "IPv4", address: "10.0.0.1" },
    ];
    const result = checkResolvedAddresses(addrs);
    expect(result.allowed).toBe(false);
    expect(result.error).toContain("Mixed");
  });

  it("rejects empty list", () => {
    expect(checkResolvedAddresses([]).allowed).toBe(false);
  });

  it("rejects loopback", () => {
    const addrs: ResolvedAddress[] = [{ family: "IPv4", address: "127.0.0.1" }];
    expect(checkResolvedAddresses(addrs).allowed).toBe(false);
  });

  it("rejects metadata endpoint", () => {
    const addrs: ResolvedAddress[] = [{ family: "IPv4", address: "169.254.169.254" }];
    expect(checkResolvedAddresses(addrs).allowed).toBe(false);
  });
});

describe("HostResolver mock", () => {
  it("mock resolver can return controlled results", async () => {
    const mockResolver: HostResolver = {
      async resolve(): Promise<ResolvedAddress[]> {
        return [{ family: "IPv4", address: "1.2.3.4" }];
      },
    };
    const result = await mockResolver.resolve("example.com");
    expect(result).toHaveLength(1);
    expect(result[0].address).toBe("1.2.3.4");
  });
});
