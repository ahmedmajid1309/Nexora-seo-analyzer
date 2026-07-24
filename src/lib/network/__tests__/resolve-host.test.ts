import { describe, it, expect } from "vitest";
import type { HostResolver, ResolvedAddress } from "@/lib/network/types";
import { checkResolvedAddresses } from "@/lib/network/network-policy";

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
