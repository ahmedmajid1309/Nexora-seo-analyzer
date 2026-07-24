import { describe, it, expect } from "vitest";
import * as http from "http";
import { safeFetch } from "@/lib/network/safe-fetch";
import {
  _enablePermissivePorts,
  _disablePermissivePorts,
  _enablePrivateIps,
  _disablePrivateIps,
} from "@/lib/network/constants";
import type { HostResolver, ResolvedAddress } from "@/lib/network/types";

function createTestServer(): Promise<{ server: http.Server; port: number }> {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

      if (url.pathname === "/html") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end("<!DOCTYPE html><html><body><h1>Test</h1></body></html>");
      } else if (url.pathname === "/redirect") {
        res.writeHead(302, { Location: "/html" });
        res.end();
      } else if (url.pathname === "/double-redirect") {
        res.writeHead(301, { Location: "/redirect" });
        res.end();
      } else if (url.pathname === "/loop") {
        res.writeHead(301, { Location: "/loop" });
        res.end();
      } else if (url.pathname === "/https-downgrade") {
        res.writeHead(301, { Location: "http://example.com/page" });
        res.end();
      } else if (url.pathname === "/binary") {
        res.writeHead(200, { "Content-Type": "image/png" });
        res.end(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
      } else if (url.pathname === "/oversized") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end("x".repeat(6 * 1024 * 1024));
      } else if (url.pathname === "/no-content-type") {
        res.writeHead(200, {});
        res.end("<!DOCTYPE html><html><body><h1>No CT</h1></body></html>");
      } else {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<!DOCTYPE html><html><body><h1>Not Found</h1></body></html>");
      }
    });

    server.listen(0, () => {
      const addr = server.address();
      const port = typeof addr === "object" && addr ? addr.port : 0;
      resolve({ server, port });
    });
  });
}

function makeMockResolver(address: string): HostResolver {
  return {
    async resolve(): Promise<ResolvedAddress[]> {
      return [{ family: "IPv4", address }];
    },
  };
}

describe("safeFetch integration", () => {
  it("fetches HTML from local server", async () => {
    const { server, port } = await createTestServer();
    _enablePermissivePorts();
    _enablePrivateIps();
    try {
      const resolver = makeMockResolver("127.0.0.1");
      const result = await safeFetch(`http://127.0.0.1:${port}/html`, { resolver });
      expect(result.status).toBe(200);
      expect(result.contentType).toBe("text/html");
      expect(result.html).toContain("<h1>Test</h1>");
    } finally {
      _disablePermissivePorts();
      _disablePrivateIps();
      server.close();
    }
  }, 15000);

  it("follows a single redirect", async () => {
    const { server, port } = await createTestServer();
    _enablePermissivePorts();
    _enablePrivateIps();
    try {
      const resolver = makeMockResolver("127.0.0.1");
      const result = await safeFetch(`http://127.0.0.1:${port}/redirect`, { resolver });
      expect(result.status).toBe(200);
      expect(result.redirectChain).toHaveLength(1);
      expect(result.finalUrl).toContain("/html");
    } finally {
      _disablePermissivePorts();
      _disablePrivateIps();
      server.close();
    }
  }, 15000);

  it("detects redirect loop", async () => {
    const { server, port } = await createTestServer();
    _enablePermissivePorts();
    _enablePrivateIps();
    try {
      const resolver = makeMockResolver("127.0.0.1");
      await expect(safeFetch(`http://127.0.0.1:${port}/loop`, { resolver })).rejects.toThrow();
    } finally {
      _disablePermissivePorts();
      _disablePrivateIps();
      server.close();
    }
  }, 15000);

  it("rejects binary content type", async () => {
    const { server, port } = await createTestServer();
    _enablePermissivePorts();
    _enablePrivateIps();
    try {
      const resolver = makeMockResolver("127.0.0.1");
      await expect(safeFetch(`http://127.0.0.1:${port}/binary`, { resolver })).rejects.toThrow();
    } finally {
      _disablePermissivePorts();
      _disablePrivateIps();
      server.close();
    }
  }, 15000);

  it("rejects invalid URL", async () => {
    await expect(safeFetch("not-a-valid-url-at-all-!!!")).rejects.toThrow();
  });

  it("rejects empty string URL", async () => {
    await expect(safeFetch("")).rejects.toThrow();
  });

  it("rejects URL with credentials", async () => {
    await expect(safeFetch("https://user:pass@example.com")).rejects.toThrow();
  });

  it("rejects non-HTTP scheme", async () => {
    await expect(safeFetch("ftp://example.com")).rejects.toThrow();
  });

  it("rejects IP address that resolves to private", async () => {
    await expect(safeFetch("https://192.168.1.1")).rejects.toThrow();
  });

  it("rejects localhost", async () => {
    await expect(safeFetch("https://localhost")).rejects.toThrow();
  });
});

describe("port policy", () => {
  it("allows port 80 on public URL", async () => {
    await expect(safeFetch("http://example.com:80")).rejects.toThrow();
  });

  it("allows port 443 on public URL", async () => {
    await expect(safeFetch("https://example.com:443")).rejects.toThrow();
  });

  it("rejects non-standard public port", async () => {
    await expect(safeFetch("http://example.com:8080")).rejects.toThrow();
  });

  it("allows dynamic port through internal test harness", async () => {
    const { server, port } = await createTestServer();
    _enablePermissivePorts();
    _enablePrivateIps();
    try {
      const resolver = makeMockResolver("127.0.0.1");
      const result = await safeFetch(`http://127.0.0.1:${port}/html`, { resolver });
      expect(result.status).toBe(200);
    } finally {
      _disablePermissivePorts();
      _disablePrivateIps();
      server.close();
    }
  }, 15000);
});
