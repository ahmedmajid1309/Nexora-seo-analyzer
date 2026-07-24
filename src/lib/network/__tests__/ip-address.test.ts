import { describe, it, expect } from "vitest";
import {
  classifyIpv4,
  classifyIpv6,
  classifyAddress,
  parseIpv4ToBigInt,
} from "@/lib/network/ip-address";

describe("IPv4 parsing", () => {
  it("parses dotted decimal", () => {
    expect(parseIpv4ToBigInt("192.168.1.1")).toBe(BigInt("0xc0a80101"));
  });

  it("parses decimal integer", () => {
    expect(parseIpv4ToBigInt("2130706433")).toBe(BigInt("0x7f000001"));
  });

  it("parses hex integer", () => {
    expect(parseIpv4ToBigInt("0x7f000001")).toBe(BigInt("0x7f000001"));
  });

  it("parses octal integer", () => {
    expect(parseIpv4ToBigInt("017700000001")).toBe(BigInt("0x7f000001"));
  });

  it("parses mixed notation", () => {
    expect(parseIpv4ToBigInt("127.0.0.1")).toBe(BigInt("0x7f000001"));
  });

  it("parses shortened notation 127.1", () => {
    const n = parseIpv4ToBigInt("127.1");
    expect(n).not.toBeNull();
  });

  it("rejects invalid input", () => {
    expect(parseIpv4ToBigInt("not-an-ip")).toBeNull();
  });
});

describe("IPv4 classification", () => {
  it("classifies 127.0.0.1 as loopback", () => {
    const result = classifyIpv4("127.0.0.1");
    expect(result.isPublic).toBe(false);
    expect(result.category).toBe("loopback");
  });

  it("classifies 127.1 as loopback", () => {
    expect(classifyIpv4("127.1").isPublic).toBe(false);
  });

  it("classifies 2130706433 as loopback", () => {
    expect(classifyIpv4("2130706433").isPublic).toBe(false);
  });

  it("classifies 0x7f000001 as loopback", () => {
    expect(classifyIpv4("0x7f000001").isPublic).toBe(false);
  });

  it("classifies 017700000001 as loopback", () => {
    expect(classifyIpv4("017700000001").isPublic).toBe(false);
  });

  it("classifies 10.0.0.1 as private", () => {
    expect(classifyIpv4("10.0.0.1").isPublic).toBe(false);
  });

  it("classifies 172.16.0.1 as private", () => {
    expect(classifyIpv4("172.16.0.1").isPublic).toBe(false);
  });

  it("classifies 192.168.1.1 as private", () => {
    expect(classifyIpv4("192.168.1.1").isPublic).toBe(false);
  });

  it("classifies 169.254.169.254 as link-local (metadata)", () => {
    expect(classifyIpv4("169.254.169.254").isPublic).toBe(false);
  });

  it("classifies 100.64.0.1 as CGNAT", () => {
    expect(classifyIpv4("100.64.0.1").isPublic).toBe(false);
  });

  it("classifies 8.8.8.8 as public", () => {
    expect(classifyIpv4("8.8.8.8").isPublic).toBe(true);
  });

  it("classifies 1.1.1.1 as public", () => {
    expect(classifyIpv4("1.1.1.1").isPublic).toBe(true);
  });

  it("classifies 0.0.0.0 as blocked", () => {
    expect(classifyIpv4("0.0.0.0").isPublic).toBe(false);
  });

  it("classifies 224.0.0.1 as multicast", () => {
    expect(classifyIpv4("224.0.0.1").isPublic).toBe(false);
  });

  it("classifies 240.0.0.1 as reserved", () => {
    expect(classifyIpv4("240.0.0.1").isPublic).toBe(false);
  });
});

describe("IPv6 classification", () => {
  it("classifies ::1 as loopback", () => {
    expect(classifyIpv6("::1").isPublic).toBe(false);
  });

  it("classifies fc00:: as unique-local", () => {
    expect(classifyIpv6("fc00::").isPublic).toBe(false);
  });

  it("classifies fd00::1 as unique-local", () => {
    expect(classifyIpv6("fd00::1").isPublic).toBe(false);
  });

  it("classifies fe80::1 as link-local", () => {
    expect(classifyIpv6("fe80::1").isPublic).toBe(false);
  });

  it("classifies ff02::1 as multicast", () => {
    expect(classifyIpv6("ff02::1").isPublic).toBe(false);
  });

  it("classifies 2001:db8:: as documentation", () => {
    expect(classifyIpv6("2001:db8::").isPublic).toBe(false);
  });

  it("classifies ::ffff:127.0.0.1 as loopback (IPv4-mapped)", () => {
    expect(classifyIpv6("::ffff:127.0.0.1").isPublic).toBe(false);
  });

  it("classifies ::ffff:192.168.1.1 as private (IPv4-mapped)", () => {
    expect(classifyIpv6("::ffff:192.168.1.1").isPublic).toBe(false);
  });

  it("classifies 2606:4700:4700::1111 as public (Cloudflare)", () => {
    expect(classifyIpv6("2606:4700:4700::1111").isPublic).toBe(true);
  });

  it("classifies 2001:4860:4860::8888 as public (Google)", () => {
    expect(classifyIpv6("2001:4860:4860::8888").isPublic).toBe(true);
  });

  it("classifies 2001:db8::1 as documentation", () => {
    expect(classifyIpv6("2001:db8::1").isPublic).toBe(false);
  });

  it("rejects invalid IPv6", () => {
    expect(classifyIpv6("not-an-ip").isPublic).toBe(false);
  });
});

describe("classifyAddress", () => {
  it("classifies IPv4 address", () => {
    expect(classifyAddress("8.8.8.8").family).toBe("IPv4");
  });

  it("classifies IPv6 address", () => {
    expect(classifyAddress("2606:4700:4700::1111").family).toBe("IPv6");
  });
});
