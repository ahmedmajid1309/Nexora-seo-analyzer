import { beforeEach, describe, expect, it, vi } from "vitest";

const hoisted = vi.hoisted(() => ({
  env: { PAGESPEED_API_KEY: undefined as string | undefined },
}));

vi.mock("@/config/env", () => ({
  env: hoisted.env,
}));

import { fetchPageSpeedRaw } from "../client";

const psiResponse = {
  kind: "pagespeedonline#result",
};

describe("fetchPageSpeedRaw", () => {
  beforeEach(() => {
    hoisted.env.PAGESPEED_API_KEY = undefined;
    vi.restoreAllMocks();
  });

  it("requests PageSpeed without a key when no API key is configured", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(psiResponse),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchPageSpeedRaw({ strategy: "mobile", url: "https://example.com" });

    const requestUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(requestUrl.searchParams.get("url")).toBe("https://example.com");
    expect(requestUrl.searchParams.get("strategy")).toBe("mobile");
    expect(requestUrl.searchParams.has("key")).toBe(false);
  });

  it("appends key only when an API key is configured", async () => {
    hoisted.env.PAGESPEED_API_KEY = "secret-key";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(psiResponse),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchPageSpeedRaw({ strategy: "desktop", url: "https://example.com" });

    const requestUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(requestUrl.searchParams.get("strategy")).toBe("desktop");
    expect(requestUrl.searchParams.get("key")).toBe("secret-key");
  });
});
