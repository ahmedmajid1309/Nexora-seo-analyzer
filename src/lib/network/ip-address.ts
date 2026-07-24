function biFromHex(hex: string): bigint {
  return BigInt("0x" + hex);
}

export interface IpClassification {
  isPublic: boolean;
  family: "IPv4" | "IPv6";
  category: string;
}

interface CidrRange {
  start: bigint;
  end: bigint;
  category: string;
  blocked: boolean;
}

const IPV4_RANGES: CidrRange[] = [
  {
    start: biFromHex("00000000"),
    end: biFromHex("00ffffff"),
    category: "unspecified/zero",
    blocked: true,
  },
  {
    start: biFromHex("0a000000"),
    end: biFromHex("0affffff"),
    category: "private-10",
    blocked: true,
  },
  { start: biFromHex("7f000000"), end: biFromHex("7fffffff"), category: "loopback", blocked: true },
  {
    start: biFromHex("a9fe0000"),
    end: biFromHex("a9feffff"),
    category: "link-local",
    blocked: true,
  },
  {
    start: biFromHex("ac100000"),
    end: biFromHex("ac1fffff"),
    category: "private-172.16",
    blocked: true,
  },
  {
    start: biFromHex("c0000000"),
    end: biFromHex("c00000ff"),
    category: "ietf-protocol",
    blocked: true,
  },
  {
    start: biFromHex("c0000200"),
    end: biFromHex("c00002ff"),
    category: "documentation",
    blocked: true,
  },
  {
    start: biFromHex("c0a80000"),
    end: biFromHex("c0a8ffff"),
    category: "private-192.168",
    blocked: true,
  },
  {
    start: biFromHex("c6120000"),
    end: biFromHex("c613ffff"),
    category: "benchmarking",
    blocked: true,
  },
  {
    start: biFromHex("64400000"),
    end: biFromHex("647fffff"),
    category: "carrier-grade-nat",
    blocked: true,
  },
  {
    start: biFromHex("c6336400"),
    end: biFromHex("c63364ff"),
    category: "documentation",
    blocked: true,
  },
  {
    start: biFromHex("cb007100"),
    end: biFromHex("cb0071ff"),
    category: "documentation",
    blocked: true,
  },
  {
    start: biFromHex("e0000000"),
    end: biFromHex("efffffff"),
    category: "multicast",
    blocked: true,
  },
  { start: biFromHex("f0000000"), end: biFromHex("ffffffff"), category: "reserved", blocked: true },
];

const IPV6_RANGES: CidrRange[] = [];

function ipv6ToBigInt(parts: number[]): bigint {
  let result = BigInt(0);
  for (const part of parts) {
    result = (result << BigInt(16)) + BigInt(part);
  }
  return result;
}

function initIpv6Ranges(): void {
  if (IPV6_RANGES.length > 0) return;

  const ranges: { start: number[]; end: number[]; category: string; blocked: boolean }[] = [
    {
      start: [0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000],
      end: [0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000],
      category: "unspecified",
      blocked: true,
    },
    {
      start: [0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0001],
      end: [0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0001],
      category: "loopback",
      blocked: true,
    },
    {
      start: [0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000],
      end: [0x0000, 0x0000, 0x0000, 0x0000, 0xffff, 0xffff, 0xffff, 0xffff],
      category: "ipv4-mapped",
      blocked: false,
    },
    {
      start: [0x0064, 0xff9b, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000],
      end: [0x0064, 0xff9b, 0x0000, 0x0000, 0xffff, 0xffff, 0xffff, 0xffff],
      category: "nat64",
      blocked: false,
    },
    {
      start: [0x2001, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000],
      end: [0x2001, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000],
      category: "teredo",
      blocked: false,
    },
    {
      start: [0x2001, 0x0db8, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000],
      end: [0x2001, 0x0db8, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff],
      category: "documentation",
      blocked: true,
    },
    {
      start: [0x2002, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000],
      end: [0x2002, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff],
      category: "6to4",
      blocked: false,
    },
    {
      start: [0xfc00, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000],
      end: [0xfdff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff],
      category: "unique-local",
      blocked: true,
    },
    {
      start: [0xfe80, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000],
      end: [0xfebf, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff],
      category: "link-local",
      blocked: true,
    },
    {
      start: [0xff00, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000],
      end: [0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff],
      category: "multicast",
      blocked: true,
    },
  ];

  for (const r of ranges) {
    IPV6_RANGES.push({
      start: ipv6ToBigInt(r.start),
      end: ipv6ToBigInt(r.end),
      category: r.category,
      blocked: r.blocked,
    });
  }
}

function parseIpv4Decimal(numStr: string): bigint | null {
  const trimmed = numStr.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const n = BigInt(trimmed);
  if (n > BigInt(4294967295)) return null;
  return n;
}

function parseIpv4Hex(hexStr: string): bigint | null {
  const trimmed = hexStr.trim().toLowerCase();
  const hex = trimmed.startsWith("0x") || trimmed.startsWith("0x") ? trimmed.slice(2) : trimmed;
  if (!/^[0-9a-f]+$/.test(hex)) return null;
  const n = BigInt("0x" + hex);
  if (n > BigInt(4294967295)) return null;
  return n;
}

function parseIpv4Octal(octStr: string): bigint | null {
  const trimmed = octStr.trim();
  if (!/^0[0-7]+$/.test(trimmed)) return null;
  const n = BigInt("0o" + trimmed.slice(1));
  if (n > BigInt(4294967295)) return null;
  return n;
}

export function parseIpv4ToBigInt(ip: string): bigint | null {
  const trimmed = ip.trim();

  if (/^\d+$/.test(trimmed) && !trimmed.startsWith("0")) {
    return parseIpv4Decimal(trimmed);
  }

  if (/^0[xX][0-9a-fA-F]+$/.test(trimmed)) {
    return parseIpv4Hex(trimmed);
  }

  if (/^0[0-7]+$/.test(trimmed)) {
    return parseIpv4Octal(trimmed);
  }

  const parts = trimmed.split(".");
  if (parts.length < 2 || parts.length > 4) {
    return null;
  }

  let result = BigInt(0);
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    let val: bigint | null;

    if (/^0[xX][0-9a-fA-F]+$/.test(part)) {
      val = parseIpv4Hex(part);
    } else if (/^0[0-7]+$/.test(part)) {
      val = parseIpv4Octal(part);
    } else if (/^\d+$/.test(part)) {
      val = parseIpv4Decimal(part);
    } else {
      return null;
    }

    if (val === null) return null;

    const remainingParts = parts.length - i - 1;
    if (remainingParts > 0) {
      if (val > BigInt(255)) return null;
      result = (result + val) << BigInt(8);
    } else {
      const maxVal = (BigInt(1) << BigInt(8 * (parts.length - i))) - BigInt(1);
      if (val > maxVal) return null;
      result = result + val;
    }
  }

  if (result > BigInt(4294967295)) return null;
  return result;
}

export function classifyIpv4(ip: string): IpClassification {
  const numeric = parseIpv4ToBigInt(ip);
  if (numeric === null) {
    return { isPublic: false, family: "IPv4", category: "invalid" };
  }

  for (const range of IPV4_RANGES) {
    if (numeric >= range.start && numeric <= range.end) {
      return {
        isPublic: !range.blocked,
        family: "IPv4",
        category: range.category,
      };
    }
  }

  return { isPublic: true, family: "IPv4", category: "public" };
}

export function parseIpv6ToParts(ip: string): number[] | null {
  let addr = ip.trim();

  if (addr.startsWith("[") && addr.endsWith("]")) {
    addr = addr.slice(1, -1);
  }

  if (addr.includes(".")) {
    const lastColon = addr.lastIndexOf(":");
    const ipv4Part = addr.slice(lastColon + 1);
    const ipv6Part = addr.slice(0, lastColon);
    const ipv4Parts = ipv4Part.split(".");
    if (ipv4Parts.length !== 4) return null;

    const ipv4Numeric = parseIpv4ToBigInt(ipv4Part);
    if (ipv4Numeric === null) return null;

    const high16 = Number((ipv4Numeric >> BigInt(16)) & BigInt(0xffff));
    const low16 = Number(ipv4Numeric & BigInt(0xffff));

    const baseParts = parseIpv6Hextets(ipv6Part);
    if (!baseParts) return null;

    baseParts.push(high16, low16);
    return baseParts;
  }

  return parseIpv6Hextets(addr);
}

function parseIpv6Hextets(addr: string): number[] | null {
  if (addr === "::") return [0, 0, 0, 0, 0, 0, 0, 0];
  let a = addr;
  if (a.startsWith("::")) a = "0" + a;
  if (a.endsWith("::")) a = a + "0";

  const parts = a.split(":");

  if (parts.length > 8) return null;

  const result: number[] = [];
  let hasDoubleColon = false;

  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === "") {
      if (hasDoubleColon) return null;
      hasDoubleColon = true;
      const remaining = parts.length - i - 1;
      const zeros = 8 - result.length - remaining;
      if (zeros < 0) return null;
      for (let j = 0; j < zeros; j++) result.push(0);
    } else {
      if (!/^[0-9a-fA-F]{1,4}$/.test(parts[i])) return null;
      result.push(parseInt(parts[i], 16));
    }
  }

  if (!hasDoubleColon && result.length !== 8) return null;
  if (hasDoubleColon && result.length > 8) return null;
  while (result.length < 8) result.push(0);

  return result;
}

export function classifyIpv6(ip: string): IpClassification {
  const parts = parseIpv6ToParts(ip);
  if (!parts || parts.length !== 8) {
    return { isPublic: false, family: "IPv6", category: "invalid" };
  }

  initIpv6Ranges();
  const numeric = ipv6ToBigInt(parts);

  for (const range of IPV6_RANGES) {
    if (numeric >= range.start && numeric <= range.end) {
      if (range.category === "ipv4-mapped" || range.category === "nat64") {
        const ipv4Part = parts.slice(4, 8);
        const ipv4Str =
          String((ipv4Part[0] >> 8) & 0xff) +
          "." +
          String(ipv4Part[0] & 0xff) +
          "." +
          String((ipv4Part[1] >> 8) & 0xff) +
          "." +
          String(ipv4Part[1] & 0xff);
        return classifyIpv4(ipv4Str);
      }
      return {
        isPublic: !range.blocked,
        family: "IPv6",
        category: range.category,
      };
    }
  }

  return { isPublic: true, family: "IPv6", category: "public" };
}

export function classifyAddress(address: string): IpClassification {
  if (address.includes(":")) {
    return classifyIpv6(address);
  }
  return classifyIpv4(address);
}
